import useSWR from 'swr';
import uploadService from '../services/upload.service';

// The fetcher function for SWR
const urlFetcher = (fileKey: string) => 
  uploadService.getPresignedDownloadUrl(fileKey).then(res => res.downloadUrl);

/**
 * A custom hook to securely and efficiently fetch a presigned URL for a private file.
 * It uses SWR to handle caching, revalidation, and prevent duplicate requests.
 * @param fileKey The S3 key of the file.
 */
export const usePresignedUrl = (fileKey: string | null | undefined) => {
  // SWR will only fetch if `fileKey` is a non-empty string.
  const { data: url, error, isLoading } = useSWR(
    fileKey ? `presignedUrl/${fileKey}` : null,
    () => urlFetcher(fileKey!),
    {
      // The presigned URL is valid for 15 minutes, so we can cache it for a while.
      // Revalidate every 10 minutes to get a fresh URL before the old one expires.
      revalidateOnFocus: false,
      refreshInterval: 10 * 60 * 1000, 
    }
  );

  return { url, error, isLoading };
};