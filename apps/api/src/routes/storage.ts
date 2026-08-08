import { Router, Request, Response } from 'express';
import { verifyR2Credentials } from '../services/r2';
import { encryptToken } from '../services/crypto';
import { saveUserStorageCredentials, saveUserSupabaseStorage, getUserById, getSupabaseClient } from '../services/supabase';
import { VerifyStorageDto } from '../types';

const router = Router();

// Handler function for setup-supabase
async function handleSetupSupabase(req: Request, res: Response) {
  try {
    const supabaseAdmin = getSupabaseClient();
    let targetUserId: string | null = req.body?.userId || null;
    let userEmail: string | null = req.body?.email || null;

    // Check optional Bearer authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '').trim();
      if (token) {
        const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
        if (user) {
          targetUserId = user.id;
          userEmail = user.email || userEmail;
        }
      }
    }

    if (!targetUserId) {
      return res.status(400).json({ error: 'Missing userId parameter or valid Bearer authorization token.' });
    }

    // Verify or auto-create public bucket 'puffiflow-videos'
    try {
      const { data: buckets } = await supabaseAdmin.storage.listBuckets();
      const hasBucket = buckets?.some((b) => b.name === 'puffiflow-videos');
      if (!hasBucket) {
        await supabaseAdmin.storage.createBucket('puffiflow-videos', { public: true });
      }
    } catch (bucketErr: any) {
      console.warn('[Storage Setup] Bucket listing/creation warning:', bucketErr.message || bucketErr);
    }

    // Update user record in database
    await saveUserSupabaseStorage(targetUserId);

    console.log(`[Storage Setup] Successfully enabled Supabase Storage for user ${targetUserId}`);

    return res.status(200).json({
      success: true,
      message: 'Supabase Storage enabled successfully!',
      storage_provider: 'supabase',
      storageProvider: 'supabase',
      storageSetupCompleted: true,
      bucketName: 'puffiflow-videos'
    });
  } catch (err: any) {
    console.error('[Storage Setup Error]:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

// Register both /storage/setup-supabase and /setup-supabase routes
router.post('/storage/setup-supabase', handleSetupSupabase);
router.post('/setup-supabase', handleSetupSupabase);

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
      storage_provider: 'cloudflare_r2',
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
      storage_provider: user.storage_provider || 'supabase',
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
