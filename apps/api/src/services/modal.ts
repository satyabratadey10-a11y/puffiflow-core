import fetch from 'node-fetch';
import { config } from '../config/env';

export async function triggerModalGpuWorker(jobId: string, rawVideoUrl: string): Promise<boolean> {
  if (!config.modalWebhookUrl) {
    console.warn('[PuffiFlow Warning] MODAL_WEBHOOK_URL is not set. Skipping Modal webhook trigger.');
    return false;
  }

  const callbackUrl = `http://localhost:${config.port}/api/jobs/webhook`;
  
  const payload = {
    jobId,
    rawVideoUrl,
    callbackUrl,
    apiSecretKey: config.apiSecretKey
  };

  try {
    console.log(`[Modal Service] Dispatching GPU job ${jobId} to Modal Webhook: ${config.modalWebhookUrl}`);
    const response = await fetch(config.modalWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.modalApiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Modal Error] Failed to trigger Modal worker (Status ${response.status}): ${errorText}`);
      return false;
    }

    const data = await response.json();
    console.log(`[Modal Service] Worker acknowledged job trigger:`, data);
    return true;
  } catch (error) {
    console.error('[Modal Service Error] Failed to connect to Modal webhook:', error);
    return false;
  }
}
