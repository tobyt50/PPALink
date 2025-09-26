import { CheckCircle, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { FileUpload } from '../../../components/forms/FileUpload';
import { Input } from '../../../components/forms/Input';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';
import agencyService from '../../../services/agency.service';
import type { Agency } from '../../../types/agency';

interface VerificationSectionProps {
  agency: Agency;
  refetch: () => void;
}

const VerificationSection = ({ agency, refetch }: VerificationSectionProps) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedDomain, setSubmittedDomain] = useState('');
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<{ domain: string }>();

  const currentPlan = agency.subscriptions?.[0]?.plan?.name || 'Free';
  const hasProAccess = currentPlan === 'Pro' || currentPlan === 'Enterprise';

  const onDomainSubmit = async (data: { domain: string }) => {
    try {
      const response = await agencyService.initiateDomainVerification(data.domain);
      toast.success(response.message);
      setSubmittedDomain(data.domain);
      setIsSubmitted(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Verification request failed.');
    }
  };

  const handleCacUploadSuccess = async (fileKey: string, file: File) => {
    const submitPromise = agencyService.submitVerification({
      type: 'CAC',
      evidence: { fileKey, fileName: file.name },
    });

    await toast.promise(submitPromise, {
      loading: 'Submitting CAC document for review...',
      success: () => {
        refetch();
        return 'CAC document submitted successfully!';
      },
      error: (err) => err.response?.data?.message || 'Submission failed.',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-800 dark:text-zinc-100">Domain Verification</h3>
        {agency.domainVerified ? (
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 mt-2">
            <div className="flex items-center"><CheckCircle className="h-5 w-5 mr-2" /><p className="font-semibold">Domain Verified: {agency.domain}</p></div>
          </div>
        ) : !hasProAccess ? (
          <div className="relative p-4 rounded-lg border-2 border-dashed mt-2">
            <div className="absolute inset-0 bg-white dark:bg-zinc-900/70 backdrop-blur-sm flex flex-col items-center justify-center z-10">
              <Lock className="h-8 w-8 text-yellow-500"/>
              <p className="mt-2 text-sm font-semibold text-gray-800 dark:text-zinc-100">This is a Pro feature</p>
              <Link to="/dashboard/agency/billing" className="mt-2"><Button size="sm">Upgrade Plan</Button></Link>
            </div>
            <p className="text-sm text-gray-500 dark:text-zinc-400">Get a "Verified" badge by confirming ownership of your company's domain.</p>
          </div>
        ) : isSubmitted ? (
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/60 text-green-800 dark:text-green-200 text-center mt-2">
            <Mail className="h-8 w-8 mx-auto"/><p className="font-semibold mt-2">Verification Email Sent!</p>
            <p className="text-sm mt-1">Please check <strong>verify@{submittedDomain}</strong> to complete the process.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onDomainSubmit)} className="mt-4 flex items-end gap-2">
              <div className="flex-grow space-y-1">
                  <Label htmlFor="domain" className="sr-only">Domain</Label>
                  <Input id="domain" placeholder="yourcompany.com" {...register('domain', { required: 'Domain name is required.'})} />
                  {errors.domain && <p className="text-xs text-red-500">{errors.domain.message}</p>}
              </div>
              <Button type="submit" isLoading={isSubmitting}>Send Email</Button>
          </form>
        )}
      </div>

      <div className="border-t pt-6">
        <h3 className="font-semibold text-gray-800 dark:text-zinc-100">CAC Verification</h3>
        {agency.cacVerified ? (
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/60 text-green-800 dark:text-green-200 mt-2">
                <div className="flex items-center"><CheckCircle className="h-5 w-5 mr-2" /><p className="font-semibold">Your business is CAC Verified!</p></div>
            </div>
        ) : !hasProAccess ? (
             <div className="relative p-4 rounded-lg border-2 border-dashed mt-2">
                <div className="absolute inset-0 bg-white dark:bg-zinc-900/70 backdrop-blur-sm flex flex-col items-center justify-center z-10"><Lock className="h-8 w-8 text-yellow-500"/><p className="mt-2 text-sm font-semibold text-gray-800 dark:text-zinc-100">This is a Pro feature</p><Link to="/dashboard/agency/billing" className="mt-2"><Button size="sm">Upgrade Plan</Button></Link></div>
                <p className="text-sm text-gray-500 dark:text-zinc-400">Get the highest level of trust by uploading your CAC registration document for admin review.</p>
            </div>
        ) : (
            <div className="mt-2">
                <p className="text-sm text-gray-500 dark:text-zinc-400">Upload your CAC registration document to get the "CAC Verified" badge. Our team will review it within 24 hours.</p>
                <div className="mt-4">
                    <FileUpload
                        label="CAC Document"
                        uploadType="nysc_document"
                        onUploadSuccess={handleCacUploadSuccess}
                    />
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default VerificationSection;
