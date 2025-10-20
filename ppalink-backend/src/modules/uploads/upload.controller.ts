import type { NextFunction, Response } from 'express';
import type { AuthRequest } from '../../middleware/auth';
import { generatePresignedDownloadUrl, generatePresignedUploadUrl } from './upload.service';
import { getAgencyByUserId } from '../agencies/agency.service';

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
    
    let agencyId: string | undefined;

    // 1. If the upload is for a LOGO, we must find the user's agency ID.
    if (uploadType === 'LOGO') {
        const agency = await getAgencyByUserId(req.user.id);
        if (!agency) {
            return res.status(403).json({ success: false, message: 'You must be an agency owner to upload a logo.' });
        }
        agencyId = agency.id;
    }

    const presignedData = await generatePresignedUploadUrl({
      fileName,
      fileType,
      userId: req.user.id,
      uploadType,
      agencyId,
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

    const { downloadUrl } = await generatePresignedDownloadUrl(fileKey);

    return res.status(200).json({ 
      success: true, 
      data: { downloadUrl: downloadUrl || null } 
    });
  } catch (error) {
    next(error);
  }
}