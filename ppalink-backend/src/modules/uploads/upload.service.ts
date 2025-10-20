import AWS from 'aws-sdk';
import { randomUUID } from 'crypto';
import env from '../../config/env';

// Configure the AWS SDK with your credentials and region
const s3 = new AWS.S3({
  accessKeyId: env.AWS_ACCESS_KEY_ID,
  secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  region: env.AWS_S3_REGION,
  endpoint: env.AWS_S3_ENDPOINT, // This is optional, for S3-compatible services
  s3ForcePathStyle: !!env.AWS_S3_ENDPOINT, // Also for S3-compatibles
});

interface PresignedUrlParams {
  fileName: string;
  fileType: string;
  userId: string;
  uploadType: 'cv' | 'certificate' | 'nysc_document' | 'AVATAR' | 'LOGO'; // Define allowed upload types
  agencyId?: string;
}

/**
 * Generates a presigned URL for uploading a file directly to S3.
 * @param params - The parameters for the upload, including file name, type, and user context.
 */
export async function generatePresignedUploadUrl({ fileName, fileType, userId, uploadType, agencyId }: PresignedUrlParams) {
  // Generate a unique key (path) for the file in the S3 bucket
  // e.g., users/user-id-123/cv/random-uuid-filename.pdf
  const uniqueId = randomUUID();
  const fileExtension = fileName.split('.').pop();
  let key: string;

  // 3. Add intelligent key generation based on the upload type.
  switch (uploadType) {
    case 'AVATAR':
      key = `users/${userId}/avatar/${uniqueId}.${fileExtension}`;
      break;
    case 'LOGO':
      if (!agencyId) {
        throw new Error('agencyId is required for LOGO uploads.');
      }
      key = `agencies/${agencyId}/logo/${uniqueId}.${fileExtension}`;
      break;
    case 'cv':
    case 'certificate':
    case 'nysc_document':
      key = `users/${userId}/${uploadType}/${uniqueId}.${fileExtension}`;
      break;
    default:
      throw new Error('Invalid upload type specified.');
  }

  const params = {
    Bucket: env.AWS_S3_BUCKET_NAME,
    Key: key,
    ContentType: fileType,
    Expires: 60 * 5,
  };

  const uploadUrl = await s3.getSignedUrlPromise('putObject', params);
  return { uploadUrl, key };
}

export async function generatePresignedDownloadUrl(key: string) {
  try {
    // Check if the object exists
    await s3.headObject({
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: key,
    }).promise();

    // If exists, generate the presigned URL
    const params = {
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: key,
      Expires: 60 * 15,
    };
    const downloadUrl = await s3.getSignedUrlPromise('getObject', params);
    return { downloadUrl };
  } catch (error: any) {
    // Handle NoSuchKey (404) or other S3 errors gracefully
    if (error.code === 'NoSuchKey' || error.statusCode === 404) {
      return { downloadUrl: null };
    }
    // Re-throw other errors for upstream handling
    throw error;
  }
}