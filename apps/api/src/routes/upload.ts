import { Router, Request, Response } from 'express';
import { generateR2PresignedUrl } from '../services/r2';
import { PresignUploadDto } from '../types';

const router = Router();

router.post('/upload/presign', async (req: Request, res: Response) => {
  try {
    const { userId, fileName, contentType, fileType }: PresignUploadDto = req.body;

    if (!userId || !fileName || !contentType) {
      return res.status(400).json({ error: 'userId, fileName, and contentType parameters are required.' });
    }

    const presignedData = await generateR2PresignedUrl(
      userId,
      fileName,
      contentType,
      fileType || 'video'
    );

    return res.status(200).json({
      success: true,
      uploadUrl: presignedData.uploadUrl,
      objectKey: presignedData.objectKey,
      publicUrl: presignedData.publicUrl
    });
  } catch (error: any) {
    console.error('[Upload Presign Error]:', error);
    return res.status(500).json({ error: 'Failed to generate presigned upload URL', details: error.message });
  }
});

export default router;
