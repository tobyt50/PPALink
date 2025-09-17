import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2 } from 'lucide-react';
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
        setError("Invitation token is missing.");
        setIsLoading(false);
        return;
      }
      try {
        const { email: invitedEmail } = await invitationService.verifyToken(token);
        setEmail(invitedEmail);
      } catch (err: any) {
        setError(err.response?.data?.message || "Invalid or expired invitation.");
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
      toast.error(err.response?.data?.message || "Failed to create account.");
    }
  };

  const PageWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md">
        <div className="rounded-xl border bg-white p-6 shadow-lg md:p-10">{children}</div>
      </motion.div>
    </div>
  );

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <div className="text-center text-red-500">{error}</div>
      </PageWrapper>
    );
  }

  if (isSuccess) {
    return (
      <PageWrapper>
        <div className="text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-primary-600" />
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">Welcome Aboard!</h1>
          <p className="mt-2 text-sm text-gray-600">
            Your account has been created. You can now log in and join your team.
          </p>
          <div className="mt-6">
            <Link to="/login">
              <Button className="w-full">Proceed to Login</Button>
            </Link>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-primary-600">Join Your Team</h1>
        <p className="mt-2 text-sm text-gray-600">Create your account to accept the invitation.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div className="space-y-1">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" value={email || ''} disabled className="bg-gray-100" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" {...register('firstName')} />
            <p className="text-xs text-red-500 h-3">{errors.firstName?.message}</p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" {...register('lastName')} />
            <p className="text-xs text-red-500 h-3">{errors.lastName?.message}</p>
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" {...register('password')} />
          <p className="text-xs text-red-500 h-3">{errors.password?.message}</p>
        </div>

        <div className="space-y-1">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input id="confirmPassword" type="password" {...register('confirmPassword')} />
          <p className="text-xs text-red-500 h-3">{errors.confirmPassword?.message}</p>
        </div>

        <Button type="submit" className="w-full" isLoading={isSubmitting} size="lg">
          Create Account & Join
        </Button>
      </form>
    </PageWrapper>
  );
};

export default AcceptInvitePage;
