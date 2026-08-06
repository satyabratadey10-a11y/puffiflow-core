import { Router, Request, Response } from 'express';
import { getPendingCompletedJobs, getUserById, updateJobStatus } from '../services/supabase';
import { decryptToken } from '../services/crypto';
import { publishVideoToYoutube } from '../services/youtube';

const router = Router();

router.get('/cron/publish', async (_req: Request, res: Response) => {
  console.log(`[Cron Publisher] Checking for scheduled 4K videos to publish...`);
  try {
    const pendingJobs = await getPendingCompletedJobs();

    if (pendingJobs.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No pending COMPLETED jobs ready for YouTube publication.',
        publishedCount: 0
      });
    }

    console.log(`[Cron Publisher] Found ${pendingJobs.length} job(s) ready to publish.`);
    const results: Array<{ jobId: string; status: string; youtubeUrl?: string; error?: string }> = [];

    for (const job of pendingJobs) {
      try {
        if (!job.processed_4k_url) {
          throw new Error(`Job ${job.id} does not have a valid processed_4k_url`);
        }

        const user = await getUserById(job.user_id);
        if (!user || !user.youtube_refresh_token) {
          throw new Error(`User ${job.user_id} does not have a linked YouTube refresh token`);
        }

        // Decrypt the stored YouTube refresh token
        const decryptedRefreshToken = decryptToken(user.youtube_refresh_token);

        // Stream 4K video & thumbnail directly from R2 to YouTube API
        const { youtubeUrl } = await publishVideoToYoutube({
          refreshToken: decryptedRefreshToken,
          videoUrl: job.processed_4k_url,
          title: job.title,
          description: job.description,
          thumbnailUrl: job.thumbnail_url,
          relatedVideoId: job.related_video_id
        });

        // Update status to PUBLISHED
        await updateJobStatus(job.id, 'PUBLISHED');

        results.push({ jobId: job.id, status: 'PUBLISHED', youtubeUrl });
      } catch (err: any) {
        console.error(`[Cron Publisher Error] Job ${job.id} failed to publish:`, err);
        await updateJobStatus(job.id, 'FAILED');
        results.push({ jobId: job.id, status: 'FAILED', error: err.message });
      }
    }

    return res.status(200).json({
      success: true,
      publishedCount: results.filter(r => r.status === 'PUBLISHED').length,
      details: results
    });
  } catch (error: any) {
    console.error('[Cron Publisher Fatal Error]:', error);
    return res.status(500).json({ error: 'Background publish cron failed', details: error.message });
  }
});

export default router;
