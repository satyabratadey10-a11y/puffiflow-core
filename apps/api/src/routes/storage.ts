import { Router, Request, Response } from 'express';
import { verifyR2Credentials, verifyS3Credentials } from '../services/r2';
import { encryptToken } from '../services/crypto';
import { saveUserStorageCredentials, saveUserSupabaseStorage, saveUserMultiCloudStorage, getUserById, getSupabaseClient } from '../services/supabase';
import { VerifyStorageDto } from '../types';

const router = Router();

// Handler function for setup-supabase (Free Default)
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
        const { data: { user } } = await supabaseAdmin.auth.getUser(token);
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

    await saveUserSupabaseStorage(targetUserId);

    console.log(`[Storage Setup] Successfully enabled Supabase Default Storage for user ${targetUserId}`);

    return res.status(200).json({
      success: true,
      message: 'Supabase Default Storage enabled successfully!',
      storage_provider: 'supabase_default',
      storageProvider: 'supabase_default',
      storageSetupCompleted: true,
      bucketName: 'puffiflow-videos'
    });
  } catch (err: any) {
    console.error('[Storage Setup Error]:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

router.post('/storage/setup-supabase', handleSetupSupabase);
router.post('/setup-supabase', handleSetupSupabase);

// Unified Multi-Cloud Storage Setup & Verification Endpoint
router.post('/storage/setup', async (req: Request, res: Response) => {
  try {
    const {
      userId,
      provider,
      accountId,
      accessKeyId,
      secretAccessKey,
      bucketName,
      publicDomain,
      s3Endpoint,
      s3Region,
      supabaseUrl,
      supabaseServiceRoleKey,
    }: VerifyStorageDto = req.body;

    if (!userId || !provider) {
      return res.status(400).json({ error: 'Missing userId or provider parameter.' });
    }

    const bName = bucketName?.trim() || 'puffiflow-videos';

    // 1. Supabase Default
    if (provider === 'supabase_default' || provider === 'supabase') {
      await saveUserSupabaseStorage(userId);
      return res.status(200).json({
        success: true,
        message: 'Supabase Default Storage enabled successfully!',
        storageSetupCompleted: true,
        storage_provider: 'supabase_default',
        storageProvider: 'supabase_default',
        bucketName: bName,
      });
    }

    // 2. Supabase Custom
    if (provider === 'supabase_custom') {
      if (!supabaseUrl || !supabaseServiceRoleKey) {
        return res.status(400).json({ error: 'Missing custom Supabase URL or Service Role Key.' });
      }

      await saveUserMultiCloudStorage(userId, {
        provider: 'supabase_custom',
        supabaseUrl: supabaseUrl.trim(),
        encryptedSupabaseRoleKey: encryptToken(supabaseServiceRoleKey.trim()),
        bucketName: bName,
      });

      return res.status(200).json({
        success: true,
        message: 'Custom Supabase Storage configuration saved successfully!',
        storageSetupCompleted: true,
        storage_provider: 'supabase_custom',
        storageProvider: 'supabase_custom',
        bucketName: bName,
      });
    }

    // 3. Cloudflare R2
    if (provider === 'cloudflare_r2') {
      if (!accountId || !accessKeyId || !secretAccessKey) {
        return res.status(400).json({ error: 'Missing required Cloudflare R2 parameters (accountId, accessKeyId, secretAccessKey, bucketName).' });
      }

      await verifyR2Credentials(accountId.trim(), accessKeyId.trim(), secretAccessKey.trim(), bName);

      const formattedPublicDomain = publicDomain && publicDomain.trim() !== ''
        ? (publicDomain.startsWith('http') ? publicDomain.trim() : `https://${publicDomain.trim()}`)
        : `https://${bName}.${accountId.trim()}.r2.cloudflarestorage.com`;

      await saveUserMultiCloudStorage(userId, {
        provider: 'cloudflare_r2',
        encryptedAccountId: encryptToken(accountId.trim()),
        encryptedAccessKey: encryptToken(accessKeyId.trim()),
        encryptedSecretKey: encryptToken(secretAccessKey.trim()),
        bucketName: bName,
        publicDomain: formattedPublicDomain,
      });

      return res.status(200).json({
        success: true,
        message: 'Cloudflare R2 connection verified and saved successfully!',
        storageSetupCompleted: true,
        storage_provider: 'cloudflare_r2',
        storageProvider: 'cloudflare_r2',
        bucketName: bName,
        publicDomain: formattedPublicDomain,
      });
    }

    // 4. AWS S3, Backblaze B2, Wasabi, or Generic S3 Compatible Storage
    if (!accessKeyId || !secretAccessKey) {
      return res.status(400).json({ error: 'Missing Access Key ID or Secret Access Key for S3 provider.' });
    }

    let defaultEndpoint = s3Endpoint?.trim();
    let defaultRegion = s3Region?.trim() || 'us-east-1';

    if (provider === 'backblaze_b2' && !defaultEndpoint) {
      defaultEndpoint = 'https://s3.us-west-004.backblazeb2.com';
      defaultRegion = s3Region?.trim() || 'us-west-004';
    } else if (provider === 'wasabi' && !defaultEndpoint) {
      defaultEndpoint = 'https://s3.wasabisys.com';
      defaultRegion = s3Region?.trim() || 'us-east-1';
    }

    console.log(`[Storage Verification] Testing S3 provider (${provider}) for user ${userId}, bucket ${bName}...`);
    await verifyS3Credentials(defaultEndpoint, defaultRegion, accessKeyId.trim(), secretAccessKey.trim(), bName);

    const formattedPublicDomain = publicDomain && publicDomain.trim() !== ''
      ? (publicDomain.startsWith('http') ? publicDomain.trim() : `https://${publicDomain.trim()}`)
      : (defaultEndpoint ? `${defaultEndpoint.replace(/\/$/, '')}/${bName}` : `https://${bName}.s3.${defaultRegion}.amazonaws.com`);

    await saveUserMultiCloudStorage(userId, {
      provider,
      s3Endpoint: defaultEndpoint || null,
      s3Region: defaultRegion,
      encryptedAccessKey: encryptToken(accessKeyId.trim()),
      encryptedSecretKey: encryptToken(secretAccessKey.trim()),
      bucketName: bName,
      publicDomain: formattedPublicDomain,
    });

    return res.status(200).json({
      success: true,
      message: `${provider.toUpperCase()} storage connection verified and saved successfully!`,
      storageSetupCompleted: true,
      storage_provider: provider,
      storageProvider: provider,
      bucketName: bName,
      publicDomain: formattedPublicDomain,
    });
  } catch (error: any) {
    console.error('[Storage Setup Error]:', error);
    return res.status(400).json({
      error: 'Failed to save or verify storage configuration',
      details: error.message,
    });
  }
});

// Legacy R2 verification route for backward compatibility
router.post('/storage/verify', async (req: Request, res: Response) => {
  req.body.provider = 'cloudflare_r2';
  return router.handle(req, res, () => {});
});

// Check user storage setup status
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

    const bucketName = user.s3_bucket_name || user.r2_bucket_name || null;
    const publicDomain = user.r2_public_domain || null;

    return res.status(200).json({
      success: true,
      storageSetupCompleted: user.storage_setup_completed || false,
      storage_provider: user.storage_provider || 'supabase_default',
      storageProvider: user.storage_provider || 'supabase_default',
      bucketName,
      publicDomain,
    });
  } catch (error: any) {
    console.error('[Storage Status Error]:', error);
    return res.status(500).json({ error: 'Failed to fetch storage status', details: error.message });
  }
});

export default router;
