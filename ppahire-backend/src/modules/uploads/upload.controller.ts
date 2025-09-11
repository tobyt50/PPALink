import type { NextFunction, Response } from 'express';
import type { AuthRequest } from '../../middleware/auth';
import { generatePresignedDownloadUrl, generatePresignedUploadUrl } from './upload.service';

/**
 * Handler to get a presigned URL for a file upload.
 */
export async function getPresignedUrlHandler(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const { fileName, fileType, uploadType } = req.body;

    // Basic validation
    if (!fileName || !fileType || !uploadType) {
      return res.status(400).json({ success: false, message: 'fileName, fileType, and uploadType are required.' });
    }
    
    // You could add more robust validation here (e.g., using Zod) to check
    // for allowed file types, sizes, or valid uploadType enums.

    const presignedData = await generatePresignedUploadUrl({
      fileName,
      fileType,
      userId: req.user.id,
      uploadType,
    });

    return res.status(200).json({ success: true, data: presignedData });
  } catch (error) {
    next(error);
  }
}

/**
 * Handler to get a presigned URL for a file download.
 */
export async function getPresignedDownloadUrlHandler(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const { fileKey } = req.body;

    if (!fileKey) {
      return res.status(400).json({ success: false, message: 'fileKey is required.' });
    }

    // Optional Security Check: You could add logic here to verify if the
    // currently logged-in user has permission to access this specific fileKey.
    // For now, we assume any authenticated user can request if they have the key.
    
    const { downloadUrl } = await generatePresignedDownloadUrl(fileKey);

    return res.status(200).json({ success: true, data: { downloadUrl } });
  } catch (error) {
    next(error);
  }
}