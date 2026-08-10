import { Router, Response } from 'express';
import { createJobRecord, updateJobStatus, getAllJobsForUser } from '../services/supabase';
import { triggerModalGpuWorker } from '../services/modal';
import { CreateJobDto, ModalWebhookPayload } from '../types';
import { config } from '../config/env';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// 1. Create new upscaling and scheduled publish job (Protected)
router.post('/jobs/create', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const authenticatedUserId = req.user?.id;
    const {
      title,
      description,
      thumbnailUrl,
      relatedVideoId,
      aiEnhancerEnabled,
      targetResolution,
      rawVideoUrl,
      scheduledTime
    }: CreateJobDto = req.body;

    if (!authenticatedUserId) {
      return res.status(401).json({ error: 'Unauthorized: User session missing.' });
    }

    if (!title || !rawVideoUrl || !scheduledTime) {
      return res.status(400).json({ error: 'title, rawVideoUrl, and scheduledTime are required fields.' });
    }

    // Save job into Supabase database with initial QUEUED status bound to authenticated user
    const job = await createJobRecord({
      userId: authenticatedUserId,
      title: title.trim(),
      description: description ? description.trim() : '',
      thumbnailUrl,
      relatedVideoId: relatedVideoId ? relatedVideoId.trim() : undefined,
      aiEnhancerEnabled: aiEnhancerEnabled ?? true,
      targetResolution: targetResolution || '4K',
      rawVideoUrl,
      scheduledTime
    });

    // Invoke Modal GPU Worker Webhook asynchronously
    const workerTriggered = await triggerModalGpuWorker(job.id, rawVideoUrl);

    if (workerTriggered) {
      await updateJobStatus(job.id, 'PROCESSING');
      job.status = 'PROCESSING';
    }

    return res.status(201).json({
      success: true,
      message: 'Job created successfully',
      job
    });
  } catch (error: any) {
    console.error('[Create Job Error]:', error.message || error);
    return res.status(500).json({ error: 'Failed to create job' });
  }
});

// 2. Webhook completion handler called by Modal worker (Secured by Secret Header)
router.post('/jobs/webhook', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const secretHeader = req.headers['x-api-secret'];
    if (secretHeader !== config.apiSecretKey) {
      return res.status(401).json({ error: 'Unauthorized webhook request.' });
    }

    const { jobId, status, processed4kUrl, error }: ModalWebhookPayload = req.body;

    if (!jobId || !status) {
      return res.status(400).json({ error: 'jobId and status are required in webhook payload.' });
    }

    if (status === 'COMPLETED') {
      await updateJobStatus(jobId, 'COMPLETED', processed4kUrl);
      console.log(`[Job Webhook] Job ${jobId} successfully marked COMPLETED.`);
    } else {
      await updateJobStatus(jobId, 'FAILED');
      console.warn(`[Job Webhook] Job ${jobId} marked FAILED.`);
    }

    return res.status(200).json({ success: true, jobId, status });
  } catch (error: any) {
    console.error('[Job Webhook Error]:', error.message || error);
    return res.status(500).json({ error: 'Failed to process job webhook' });
  }
});

// 3. Get list of all jobs for authenticated user (Protected & IDOR-safe)
router.get('/jobs', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const authenticatedUserId = req.user?.id;
    if (!authenticatedUserId) {
      return res.status(401).json({ error: 'Unauthorized user session.' });
    }

    const jobs = await getAllJobsForUser(authenticatedUserId);
    return res.status(200).json({ success: true, jobs });
  } catch (error: any) {
    console.error('[Get Jobs Error]:', error.message || error);
    return res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

export default router;
