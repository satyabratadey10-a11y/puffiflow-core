import { Router, Response } from 'express';
import { generatePresignedUploadUrl } from '../services/r2';
import { PresignUploadDto } from '../types';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.post('/upload/presign', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const authenticatedUserId = req.user?.id;
    const { fileName, contentType, fileType }: PresignUploadDto = req.body;

    if (!authenticatedUserId) {
      return res.status(401).json({ error: 'Unauthorized user session.' });
    }

    if (!fileName || !contentType) {
      return res.status(400).json({ error: 'fileName and contentType parameters are required.' });
    }

    const presignedData = await generatePresignedUploadUrl(
      authenticatedUserId,
      fileName.trim(),
      contentType.trim(),
      fileType || 'video'
    );

    return res.status(200).json({
      success: true,
      uploadUrl: presignedData.uploadUrl,
      objectKey: presignedData.objectKey,
      publicUrl: presignedData.publicUrl
    });
  } catch (error: any) {
    console.error('[Upload Presign Error]:', error.message || error);
    return res.status(500).json({ error: 'Failed to generate presigned upload URL' });
  }
});

export default router;
