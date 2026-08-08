import { Router, Request, Response } from 'express';
import { verifyR2Credentials } from '../services/r2';
import { encryptToken } from '../services/crypto';
import { saveUserStorageCredentials, saveUserSupabaseStorage, getUserById } from '../services/supabase';
import { VerifyStorageDto } from '../types';

const router = Router();

// 1. Enable Supabase Storage (No Credit Card Required)
router.post('/storage/setup-supabase', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId parameter is required.' });
    }

    await saveUserSupabaseStorage(userId);
    console.log(`[Storage Setup] Successfully enabled Supabase Storage for user ${userId}`);

    return res.status(200).json({
      success: true,
      message: 'Supabase Storage enabled successfully!',
      storageSetupCompleted: true,
      storageProvider: 'supabase',
      bucketName: 'puffiflow-videos'
    });
  } catch (error: any) {
    console.error('[Supabase Storage Setup Error]:', error);
    return res.status(500).json({
      error: 'Failed to enable Supabase Storage',
      details: error.message
    });
  }
});

// 2. Verify R2 credentials & save to user profile
router.post('/storage/verify', async (req: Request, res: Response) => {
  try {
    const { userId, accountId, accessKeyId, secretAccessKey, bucketName, publicDomain }: VerifyStorageDto = req.body;

    if (!userId || !accountId || !accessKeyId || !secretAccessKey || !bucketName) {
      return res.status(400).json({
        error: 'Missing required parameters (userId, accountId, accessKeyId, secretAccessKey, bucketName)'
      });
    }

    // Test bucket access using HeadBucket Command
    console.log(`[Storage Verification] Testing R2 credentials for user ${userId}, bucket: ${bucketName}...`);
    await verifyR2Credentials(accountId, accessKeyId, secretAccessKey, bucketName);

    // Encrypt sensitive AWS/R2 credentials before storing in Supabase
    const encryptedAccountId = encryptToken(accountId);
    const encryptedAccessKeyId = encryptToken(accessKeyId);
    const encryptedSecretAccessKey = encryptToken(secretAccessKey);

    const formattedPublicDomain = publicDomain && publicDomain.trim() !== ''
      ? (publicDomain.startsWith('http') ? publicDomain : `https://${publicDomain}`)
      : `https://${bucketName}.${accountId}.r2.cloudflarestorage.com`;

    await saveUserStorageCredentials(userId, {
      encryptedAccountId,
      encryptedAccessKeyId,
      encryptedSecretAccessKey,
      bucketName,
      publicDomain: formattedPublicDomain
    });

    console.log(`[Storage Verification] Successfully verified & saved R2 credentials for user ${userId}`);

    return res.status(200).json({
      success: true,
      message: 'Cloudflare R2 storage connection verified and saved successfully!',
      storageSetupCompleted: true,
      storageProvider: 'cloudflare_r2',
      bucketName,
      publicDomain: formattedPublicDomain
    });
  } catch (error: any) {
    console.error('[Storage Verification Error]:', error);
    return res.status(400).json({
      error: 'Failed to verify Cloudflare R2 bucket connection',
      details: error.message
    });
  }
});

// 3. Check user storage setup status
router.get('/storage/status', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ error: 'userId query parameter is required.' });
    }

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      storageSetupCompleted: user.storage_setup_completed || false,
      storageProvider: user.storage_provider || 'supabase',
      bucketName: user.r2_bucket_name || null,
      publicDomain: user.r2_public_domain || null
    });
  } catch (error: any) {
    console.error('[Storage Status Error]:', error);
    return res.status(500).json({ error: 'Failed to fetch storage status', details: error.message });
  }
});

export default router;
