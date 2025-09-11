import { Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import uploadService from '../../services/upload.service'; // 1. Import the real service

const DocumentLink = ({ fileKey, fileName }: { fileKey: string; fileName: string }) => {
  const [isLoading, setIsLoading] = useState(false);

  // 2. Update the handler to call the real API endpoint
  const handleGetLink = async () => {
    setIsLoading(true);
    try {
      // Fetch the secure, temporary download URL from our backend
      const { downloadUrl } = await uploadService.getDownloadUrl(fileKey);
      
      // Open the secure link in a new tab for the user to view/download
      window.open(downloadUrl, '_blank');

    } catch (error) {
      console.error("Failed to get download link", error);
      toast.error("Could not generate download link at this time.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleGetLink}
      disabled={isLoading}
      className="flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 disabled:opacity-50"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      {fileName}
    </button>
  );
};

export default DocumentLink;