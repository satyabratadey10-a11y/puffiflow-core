import { Router, Request, Response } from 'express';
import { verifyR2Credentials } from '../services/r2';
import { encryptToken } from '../services/crypto';
import { saveUserStorageCredentials, getUserById } from '../services/supabase';
import { VerifyStorageDto } from '../types';

const router = Router();

// 1. Verify R2 credentials & save to user profile
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

// 2. Check user storage setup status
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
      bucketName: user.r2_bucket_name || null,
      publicDomain: user.r2_public_domain || null
    });
  } catch (error: any) {
    console.error('[Storage Status Error]:', error);
    return res.status(500).json({ error: 'Failed to fetch storage status', details: error.message });
  }
});

export default router;
