import { AlertCircle, CheckCircle, File as FileIcon, UploadCloud } from 'lucide-react';
import React, { useRef, useState, type DragEvent } from 'react';
import uploadService from '../../services/upload.service';

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
  
  // --- DRAG AND DROP STATE ---
  const [isDragging, setIsDragging] = useState(false);
  // ---

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reusable function to handle the file upload logic
  const handleFileUpload = async (file: File | null) => {
    if (!file) return;

    // Optional: Add file type/size validation here
    // if (file.size > 5 * 1024 * 1024) { ... } 

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
  
  // --- DRAG AND DROP EVENT HANDLERS ---
  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // This is crucial to allow dropping
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
  // ---

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {/* Add the drag-and-drop event handlers to the dropzone div */}
      <div 
        className={`mt-1 flex justify-center rounded-md border-2 border-dashed px-6 pt-5 pb-6 transition-colors
          ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-1 text-center">
          <UploadCloud className={`mx-auto h-12 w-12 ${isDragging ? 'text-primary-500' : 'text-gray-400'}`} />
          <div className="flex text-sm text-gray-600">
            <label
              htmlFor={`file-upload-${uploadType}`}
              className="relative cursor-pointer rounded-md bg-transparent font-medium text-primary-600 focus-within:outline-none hover:text-primary-500"
            >
              <span>Upload a file</span>
              <input 
                id={`file-upload-${uploadType}`} 
                ref={fileInputRef}
                name={`file-upload-${uploadType}`} 
                type="file" 
                className="sr-only" 
                onChange={handleFileChange}
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 5MB</p>
        </div>
      </div>
      
      {/* The Upload Status Display remains unchanged */}
      {uploadStatus !== 'idle' && (
         <div className="mt-4">
          <div className="flex items-center text-sm">
            <FileIcon className="h-5 w-5 text-gray-400 mr-2" />
            <span className="truncate">{fileName}</span>
          </div>
          {uploadStatus === 'uploading' && (
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
          )}
          {uploadStatus === 'success' && (
             <div className="flex items-center text-green-600 mt-2">
                <CheckCircle className="h-4 w-4 mr-1"/>
                <span>Upload successful!</span>
            </div>
          )}
           {uploadStatus === 'error' && (
             <div className="flex items-center text-red-600 mt-2">
                <AlertCircle className="h-4 w-4 mr-1"/>
                <span>{error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};