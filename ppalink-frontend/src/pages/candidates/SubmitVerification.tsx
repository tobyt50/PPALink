import { ChevronLeft, FileUp } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { FileUpload } from '../../components/forms/FileUpload';
import { Button } from '../../components/ui/Button';
import candidateService from '../../services/candidate.service';
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
    <div className="mx-auto max-w-3xl space-y-5">
      {/* Header - Replicated from AgencyDashboard */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 to-green-500 bg-clip-text text-transparent">
            Submit NYSC Verification
          </h1>
          <p className="mt-2 text-gray-600">
            Upload your official NYSC Call-up Letter to get a verified badge.
          </p>
        </div>
        <Link to="/dashboard/candidate/profile" className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">
          <ChevronLeft className="h-4 w-4 mr-1.5" />
          Back to Profile
        </Link>
      </div>

      {/* Replicated Card Styling */}
      <div className="rounded-2xl bg-white shadow-md ring-1 ring-gray-100 overflow-hidden">
        {/* Card Header */}
        <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Upload Document</h2>
        </div>

        {/* Card Body */}
        <div className="p-6">
            <FileUpload
            label="NYSC Call-up Letter Document"
            uploadType="nysc_document"
            onUploadSuccess={handleUploadSuccess}
            />
        </div>

        {/* Card Footer */}
        <div className="flex justify-end p-4 bg-gray-50 border-t border-gray-100">
          <Button 
            onClick={handleSubmit} 
            disabled={!fileKey || isSubmitting}
            isLoading={isSubmitting}
            // Replicated Primary Button Style
            className="rounded-lg shadow-md bg-gradient-to-r from-primary-600 to-green-500 text-white hover:opacity-90 transition disabled:opacity-50"
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