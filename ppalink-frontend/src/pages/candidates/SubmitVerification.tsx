import { FileUp } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { FileUpload } from '../../components/forms/FileUpload';
import { Button } from '../../components/ui/Button';
import candidateService from '../../services/candidate.service'; // 1. Import the service
import type { VerificationType } from '../../types/user';

const SubmitVerificationPage = () => {
  const navigate = useNavigate();
  const [fileKey, setFileKey] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const verificationType: VerificationType = 'NYSC';

  const handleUploadSuccess = (key: string, file: File) => {
    setFileKey(key);
    setFileName(file.name);
  };

  // 2. This handler is now fully functional
  const handleSubmit = async () => {
    if (!fileKey || !fileName) {
      toast.error("Please upload a document first.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await candidateService.submitVerification({
        type: verificationType,
        evidence: { fileKey, fileName },
      });

      toast.success("Verification submitted successfully! You will be notified once it has been reviewed.");
      navigate('/dashboard/candidate/profile');
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-primary-600">Submit NYSC Verification</h1>
        <p className="mt-1 text-gray-500">
          Upload your official NYSC Call-up Letter to get a verified badge on your profile.
        </p>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm space-y-6">
        <FileUpload
          label="NYSC Call-up Letter Document"
          uploadType="nysc_document"
          onUploadSuccess={handleUploadSuccess}
        />
        
        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSubmit} 
            disabled={!fileKey || isSubmitting}
            isLoading={isSubmitting}
          >
            <FileUp className="mr-2 h-4 w-4" />
            Submit for Review
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubmitVerificationPage;