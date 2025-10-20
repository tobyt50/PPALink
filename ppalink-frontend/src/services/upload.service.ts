import axios from 'axios'; // We need the raw axios for uploading to S3
import apiClient from '../config/axios';

interface PresignedUrlPayload {
  fileName: string;
  fileType: string;
  uploadType: 'cv' | 'certificate' | 'nysc_document' | 'AVATAR' | 'LOGO';
}

interface PresignedUrlResponse {
  uploadUrl: string;
  key: string;
}

interface PresignedDownloadUrlResponse {
  downloadUrl: string;
}

class UploadService {
  /**
   * Asks our backend for a secure URL to upload a file to.
   */
  async getPresignedUrl(payload: PresignedUrlPayload): Promise<PresignedUrlResponse> {
    const response = await apiClient.post('/uploads/presigned-url', payload);
    return response.data.data;
  }

  /**
   * Uploads the actual file to the S3 presigned URL.
   * Note: This does NOT use our `apiClient` because it's a direct request to S3.
   * @param presignedUrl The URL provided by our backend.
   * @param file The file object from the user's computer.
   * @param onUploadProgress A callback to track upload progress.
   */
  async uploadFileToS3(
    presignedUrl: string,
    file: File,
    onUploadProgress: (progressEvent: any) => void
  ): Promise<void> {
    await axios.put(presignedUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
      onUploadProgress,
    });
  }

  /**
   * Asks our backend for a secure URL to download a file from.
   * @param fileKey The S3 key of the file.
   */
  async getDownloadUrl(fileKey: string): Promise<PresignedDownloadUrlResponse> {
    const response = await apiClient.post('/uploads/download-url', { fileKey });
    return response.data.data;
  }

  /**
   * Asks our backend for a secure, temporary URL to view a private file.
   * @param fileKey The S3 key of the file.
   */
  async getPresignedDownloadUrl(fileKey: string): Promise<PresignedDownloadUrlResponse> {
      const response = await apiClient.post('/uploads/download-url', { fileKey });
      return response.data.data;
  }
}

export default new UploadService();