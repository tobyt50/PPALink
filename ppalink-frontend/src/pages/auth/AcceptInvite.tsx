import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Link, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { Input } from '../../components/forms/Input';
import { Button } from '../../components/ui/Button';
import { Label } from '../../components/ui/Label';
import invitationService from '../../services/invitation.service';

const acceptInviteSchema = z
  .object({
    firstName: z.string().min(2, 'First name is required.'),
    lastName: z.string().min(2, 'Last name is required.'),
    password: z.string().min(8, 'Password must be at least 8 characters long.'),
    confirmPassword: z.string().min(8, 'Confirm password is required.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  });

type AcceptInviteFormValues = z.infer<typeof acceptInviteSchema>;

const AcceptInvitePage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError("Invitation token is missing or invalid.");
        setIsLoading(false);
        return;
      }
      try {
        const { email: invitedEmail } = await invitationService.verifyToken(token);
        setEmail(invitedEmail);
      } catch (err: any) {
        setError(err.response?.data?.message || "This invitation is invalid or has expired.");
      } finally {
        setIsLoading(false);
      }
    };
    verifyToken();
  }, [token]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AcceptInviteFormValues>({ resolver: zodResolver(acceptInviteSchema) });

  const onSubmit = async (data: AcceptInviteFormValues) => {
    if (!token) return;
    try {
      await invitationService.acceptInvite({ token, ...data });
      setIsSuccess(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create your account. Please try again.");
    }
  };

  // Polished Page Wrapper
  const PageWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="flex min-h-[calc(100vh-150px)] items-center justify-center bg-white/90 dark:bg-zinc-900/90 px-4 py-12">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="rounded-2xl bg-white dark:bg-zinc-900 p-8 shadow-2xl dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-black dark:ring-white/10/5">{children}</div>
      </motion.div>
    </div>
  );

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex justify-center p-8">
          <Loader2 className="h-10 w-10 animate-spin text-primary-600 dark:text-primary-400" />
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/60">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="mt-4 text-xl font-semibold text-gray-900 dark:text-zinc-50">Invitation Error</h1>
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      </PageWrapper>
    );
  }

  if (isSuccess) {
    return (
      <PageWrapper>
        <div className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h1 className="mt-4 text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
            Welcome Aboard!
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-zinc-300">
            Your account has been created successfully. You can now log in to join your team.
          </p>
          <div className="mt-8">
            <Link to="/login">
              <Button size="lg" className="w-full rounded-xl shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 text-white dark:text-zinc-100 hover:opacity-90 transition">
                Proceed to Login
              </Button>
            </Link>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
          Join Your Team
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-zinc-300">Create your account to accept the invitation.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" value={email || ''} disabled className="mt-1 bg-gray-100 dark:bg-zinc-800 cursor-not-allowed" />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" {...register('firstName')} className="mt-1" />
            <p className="text-xs text-red-500 h-3 mt-1">{errors.firstName?.message}</p>
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" {...register('lastName')} className="mt-1" />
            <p className="text-xs text-red-500 h-3 mt-1">{errors.lastName?.message}</p>
          </div>
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" {...register('password')} className="mt-1" />
          <p className="text-xs text-red-500 h-3 mt-1">{errors.password?.message}</p>
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input id="confirmPassword" type="password" {...register('confirmPassword')} className="mt-1" />
          <p className="text-xs text-red-500 h-3 mt-1">{errors.confirmPassword?.message}</p>
        </div>

        <Button type="submit" className="w-full rounded-xl shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 text-white dark:text-zinc-100 hover:opacity-90 transition" isLoading={isSubmitting} size="lg">
          Create Account & Join
        </Button>
      </form>
    </PageWrapper>
  );
};

export default AcceptInvitePage;
