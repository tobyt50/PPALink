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
  uploadType: 'cv' | 'certificate' | 'nysc_document'; // Define allowed upload types
}

/**
 * Generates a presigned URL for uploading a file directly to S3.
 * @param params - The parameters for the upload, including file name, type, and user context.
 */
export async function generatePresignedUploadUrl({ fileName, fileType, userId, uploadType }: PresignedUrlParams) {
  // Generate a unique key (path) for the file in the S3 bucket
  // e.g., users/user-id-123/cv/random-uuid-filename.pdf
  const uniqueId = randomUUID();
  const fileExtension = fileName.split('.').pop();
  const key = `users/${userId}/${uploadType}/${uniqueId}.${fileExtension}`;

  const params = {
    Bucket: env.AWS_S3_BUCKET_NAME,
    Key: key,
    ContentType: fileType,
    Expires: 60 * 5, // The URL will be valid for 5 minutes
  };

  // Generate the presigned URL for a PUT operation
  const uploadUrl = await s3.getSignedUrlPromise('putObject', params);

  return {
    uploadUrl,
    key, // The key is returned so we can store it in our database later
  };
}

/**
 * Generates a presigned URL for downloading a private file from S3.
 * @param key The S3 key of the file to download.
 */
export async function generatePresignedDownloadUrl(key: string) {
  const params = {
    Bucket: env.AWS_S3_BUCKET_NAME,
    Key: key,
    Expires: 60 * 15, // Link is valid for 15 minutes
  };

  // Generate the presigned URL for a GET operation
  const downloadUrl = await s3.getSignedUrlPromise('getObject', params);
  return { downloadUrl };
}