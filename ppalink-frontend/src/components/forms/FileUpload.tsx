import { AlertCircle, CheckCircle, File as FileIcon, UploadCloud } from 'lucide-react';
import React, { useRef, useState, type DragEvent } from 'react';
import uploadService from '../../services/upload.service';
import { Label } from '../ui/Label'; // Assuming a styled Label component exists

interface FileUploadProps {
  uploadType: 'cv' | 'certificate' | 'nysc_document';
  onUploadSuccess: (fileKey: string, file: File) => void;
  label: string;
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export const FileUpload = ({ uploadType, onUploadSuccess, label }: FileUploadProps) => {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File | null) => {
    if (!file) return;

    setUploadStatus('uploading');
    setFileName(file.name);
    setError(null);
    setProgress(0);

    try {
      const { uploadUrl, key } = await uploadService.getPresignedUrl({
        fileName: file.name,
        fileType: file.type,
        uploadType,
      });

      await uploadService.uploadFileToS3(uploadUrl, file, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setProgress(percentCompleted);
      });

      setUploadStatus('success');
      onUploadSuccess(key, file);
    
    } catch (err: any) {
      setUploadStatus('error');
      setError('Upload failed. Please try again.');
      console.error(err);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(event.target.files?.[0] || null);
  };
  
  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFileUpload(event.dataTransfer.files?.[0] || null);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={`file-upload-${uploadType}`}>{label}</Label>
      {/* Polished Dropzone */}
      <div 
        className={`relative flex w-full flex-col items-center justify-center rounded-xl border border-dashed p-8 transition-all
          ${isDragging 
            ? 'border-primary-500 dark:border-primary-500 bg-primary-50 dark:bg-primary-950/60 ring-2 ring-primary-200 dark:ring-primary-500/30' 
            : 'border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-primary-400 dark:hover:border-primary-500'
          }`
        }
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()} // Make the whole area clickable
      >
        <div className="text-center">
          <UploadCloud className={`mx-auto h-10 w-10 transition-colors ${isDragging ? 'text-primary-500 dark:text-primary-400' : 'text-gray-400 dark:text-zinc-500'}`} />
          <p className="mt-3 text-sm text-gray-600 dark:text-zinc-300">
            <span className="font-semibold text-primary-600 dark:text-primary-400">Click to upload</span> or drag and drop
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">PDF, DOC, DOCX up to 5MB</p>
          <input 
            id={`file-upload-${uploadType}`} 
            ref={fileInputRef}
            name={`file-upload-${uploadType}`} 
            type="file" 
            className="sr-only" 
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx" // Specify accepted file types
          />
        </div>
      </div>
      
      {/* Polished Upload Status Display */}
      {uploadStatus !== 'idle' && (
         <div className="mt-4 rounded-lg bg-gray-50 dark:bg-gray-920 p-3">
          <div className="flex items-center text-sm font-medium text-gray-800 dark:text-zinc-100">
            <FileIcon className="h-5 w-5 text-gray-400 dark:text-zinc-500 mr-2 flex-shrink-0" />
            <span className="truncate flex-grow">{fileName}</span>
          </div>
          {uploadStatus === 'uploading' && (
            <div className="w-full bg-gray-200 dark:bg-zinc-800 rounded-full h-1.5 mt-2">
              <div 
                className="bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 h-1.5 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
          {uploadStatus === 'success' && (
             <div className="flex items-center text-sm text-green-700 dark:text-green-300 font-semibold mt-2">
                <CheckCircle className="h-4 w-4 mr-1.5"/>
                <span>Upload successful</span>
            </div>
          )}
           {uploadStatus === 'error' && (
             <div className="flex items-center text-sm text-red-700 dark:text-red-400 font-semibold mt-2">
                <AlertCircle className="h-4 w-4 mr-1.5"/>
                <span>{error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
