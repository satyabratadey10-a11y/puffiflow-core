import { Router, Request, Response } from 'express';
import { createJobRecord, updateJobStatus, getAllJobsForUser } from '../services/supabase';
import { triggerModalGpuWorker } from '../services/modal';
import { CreateJobDto, ModalWebhookPayload } from '../types';
import { config } from '../config/env';

const router = Router();

// 1. Create new upscaling and scheduled publish job
router.post('/jobs/create', async (req: Request, res: Response) => {
  try {
    const {
      userId,
      title,
      description,
      thumbnailUrl,
      relatedVideoId,
      aiEnhancerEnabled,
      targetResolution,
      rawVideoUrl,
      scheduledTime
    }: CreateJobDto = req.body;

    if (!userId || !title || !rawVideoUrl || !scheduledTime) {
      return res.status(400).json({ error: 'userId, title, rawVideoUrl, and scheduledTime are required fields.' });
    }

    // Save job into Supabase database with initial QUEUED status
    const job = await createJobRecord({
      userId,
      title,
      description: description || '',
      thumbnailUrl,
      relatedVideoId,
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
    console.error('[Create Job Error]:', error);
    return res.status(500).json({ error: 'Failed to create job', details: error.message });
  }
});

// 2. Webhook completion handler called by Modal worker
router.post('/jobs/webhook', async (req: Request, res: Response) => {
  try {
    // Validate secret header to protect webhook integrity
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
      console.log(`[Job Webhook] Job ${jobId} successfully marked COMPLETED. 4K URL: ${processed4kUrl}`);
    } else {
      await updateJobStatus(jobId, 'FAILED');
      console.warn(`[Job Webhook] Job ${jobId} marked FAILED. Error: ${error}`);
    }

    return res.status(200).json({ success: true, jobId, status });
  } catch (error: any) {
    console.error('[Job Webhook Error]:', error);
    return res.status(500).json({ error: 'Failed to process job webhook', details: error.message });
  }
});

// 3. Get list of all jobs for a specific user
router.get('/jobs', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ error: 'userId query parameter is required.' });
    }

    const jobs = await getAllJobsForUser(userId);
    return res.status(200).json({ success: true, jobs });
  } catch (error: any) {
    console.error('[Get Jobs Error]:', error);
    return res.status(500).json({ error: 'Failed to fetch jobs', details: error.message });
  }
});

export default router;
