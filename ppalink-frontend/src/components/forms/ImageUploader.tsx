import { Edit, Loader2, User } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import uploadService from '../../services/upload.service';

interface ImageUploaderProps {
  initialImageKey?: string | null;
  onUploadSuccess: (fileKey: string) => void;
  uploadType: 'AVATAR' | 'LOGO';
  shape?: 'circle' | 'square';
  label: string;
}

export const ImageUploader = ({ initialImageKey, onUploadSuccess, uploadType, shape = 'circle', label }: ImageUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [remoteImageUrl, setRemoteImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // useEffect to securely fetch the image URL when the component loads or the key changes.
  useEffect(() => {
    if (initialImageKey) {
        let isCancelled = false;
        const fetchUrl = async () => {
            try {
                const { downloadUrl } = await uploadService.getPresignedDownloadUrl(initialImageKey);
                if (!isCancelled) {
                    setRemoteImageUrl(downloadUrl);
                }
            } catch (error) {
                console.error("Failed to get presigned URL for image", error);
                if (!isCancelled) {
                    setRemoteImageUrl(null);
                }
            }
        };
        fetchUrl();
        return () => { isCancelled = true; }; // Cleanup to prevent state updates on unmounted component
    } else {
        setRemoteImageUrl(null);
    }
  }, [initialImageKey]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
        toast.error('Please upload a valid image file (PNG, JPG, etc.).');
        return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setLocalPreview(reader.result as string);
    reader.readAsDataURL(file);

    setIsUploading(true);
    setRemoteImageUrl(null); // Clear old remote image during upload
    try {
      const { uploadUrl, key } = await uploadService.getPresignedUrl({ fileName: file.name, fileType: file.type, uploadType });
      await uploadService.uploadFileToS3(uploadUrl, file, () => {});
      onUploadSuccess(key);
      toast.success(`${label} uploaded successfully! Remember to save your profile.`);
    } catch (err) {
      toast.error(`Failed to upload ${label.toLowerCase()}.`);
      setLocalPreview(null); // Clear preview on failure
    } finally {
      setIsUploading(false);
    }
  };

  const currentImageUrl = localPreview || remoteImageUrl;

  return (
    <div className="relative group w-32 h-32">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
      <div className={`w-full h-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden ${shape === 'circle' ? 'rounded-full' : 'rounded-lg'}`}>
        {isUploading || (initialImageKey && !remoteImageUrl) ? (
          <Loader2 className="animate-spin text-primary-500" />
        ) : currentImageUrl ? (
          <img src={currentImageUrl} alt={label} className="w-full h-full object-cover" />
        ) : (
          <User className="w-16 h-16 text-gray-400" />
        )}
      </div>
      <button type="button" onClick={() => fileInputRef.current?.click()} className={`absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity ${shape === 'circle' ? 'rounded-full' : 'rounded-lg'}`} disabled={isUploading}>
        <Edit className="h-6 w-6" />
      </button>
    </div>
  );
};