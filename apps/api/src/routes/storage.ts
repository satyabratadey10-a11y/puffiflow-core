import { Router, Response } from 'express';
import { verifyR2Credentials, verifyS3Credentials } from '../services/r2';
import { encryptToken } from '../services/crypto';
import { saveUserSupabaseStorage, saveUserMultiCloudStorage, getUserById, getSupabaseClient } from '../services/supabase';
import { VerifyStorageDto } from '../types';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Handler function for setup-supabase (Free Default)
async function handleSetupSupabase(req: AuthenticatedRequest, res: Response) {
  try {
    const authenticatedUserId = req.user?.id || req.body?.userId;
    if (!authenticatedUserId) {
      return res.status(401).json({ error: 'Unauthorized: Missing valid session token or userId.' });
    }

    const supabaseAdmin = getSupabaseClient();
    try {
      const { data: buckets } = await supabaseAdmin.storage.listBuckets();
      const hasBucket = buckets?.some((b) => b.name === 'puffiflow-videos');
      if (!hasBucket) {
        await supabaseAdmin.storage.createBucket('puffiflow-videos', { public: true });
      }
    } catch (bucketErr: any) {
      console.warn('[Storage Setup] Bucket listing/creation warning:', bucketErr.message || bucketErr);
    }

    await saveUserSupabaseStorage(authenticatedUserId);

    return res.status(200).json({
      success: true,
      message: 'Supabase Default Storage enabled successfully!',
      storage_provider: 'supabase_default',
      storageProvider: 'supabase_default',
      storageSetupCompleted: true,
      bucketName: 'puffiflow-videos'
    });
  } catch (err: any) {
    console.error('[Storage Setup Error]:', err.message || err);
    return res.status(500).json({ error: 'Internal server error during storage setup' });
  }
}

router.post('/storage/setup-supabase', requireAuth, handleSetupSupabase);
router.post('/setup-supabase', requireAuth, handleSetupSupabase);

// Unified Multi-Cloud Storage Setup & Verification Endpoint (Protected & IDOR-safe)
router.post('/storage/setup', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const authenticatedUserId = req.user?.id;
    const {
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

    if (!authenticatedUserId) {
      return res.status(401).json({ error: 'Unauthorized user session.' });
    }

    if (!provider) {
      return res.status(400).json({ error: 'Missing provider parameter.' });
    }

    const bName = bucketName?.trim() || 'puffiflow-videos';

    // 1. Supabase Default
    if (provider === 'supabase_default' || provider === 'supabase') {
      await saveUserSupabaseStorage(authenticatedUserId);
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

      await saveUserMultiCloudStorage(authenticatedUserId, {
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

      await saveUserMultiCloudStorage(authenticatedUserId, {
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

    await verifyS3Credentials(defaultEndpoint, defaultRegion, accessKeyId.trim(), secretAccessKey.trim(), bName);

    const formattedPublicDomain = publicDomain && publicDomain.trim() !== ''
      ? (publicDomain.startsWith('http') ? publicDomain.trim() : `https://${publicDomain.trim()}`)
      : (defaultEndpoint ? `${defaultEndpoint.replace(/\/$/, '')}/${bName}` : `https://${bName}.s3.${defaultRegion}.amazonaws.com`);

    await saveUserMultiCloudStorage(authenticatedUserId, {
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
    console.error('[Storage Setup Error]:', error.message || error);
    return res.status(400).json({
      error: 'Failed to save or verify storage configuration'
    });
  }
});

// Legacy R2 verification route for backward compatibility
router.post('/storage/verify', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  req.body.provider = 'cloudflare_r2';
  return router.handle(req, res, () => {});
});

// Check user storage setup status (Protected & IDOR-safe)
router.get('/storage/status', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const authenticatedUserId = req.user?.id;
    if (!authenticatedUserId) {
      return res.status(401).json({ error: 'Unauthorized user session.' });
    }

    const user = await getUserById(authenticatedUserId);
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
    console.error('[Storage Status Error]:', error.message || error);
    return res.status(500).json({ error: 'Failed to fetch storage status' });
  }
});

export default router;
