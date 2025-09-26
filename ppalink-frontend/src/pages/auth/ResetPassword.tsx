import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Link, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { Input } from '../../components/forms/Input';
import { Button } from '../../components/ui/Button';
import { Label } from '../../components/ui/Label';
import passwordService from '../../services/password.service';

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters long.'),
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      toast.error("Invalid or missing reset token.");
      return;
    }
    try {
      // 2. Uncomment the real service call
      await passwordService.resetPassword(token, data.password);
      setIsSuccess(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reset password.");
    }
  };
  
  if (!token) {
      return <div className="text-center text-red-500 p-8">This reset link is invalid or has expired.</div>
  }

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <motion.div /* ... */ className="w-full max-w-md">
        <div className="rounded-xl border bg-white dark:bg-zinc-900/90 dark:bg-black/80 dark:backdrop-blur-sm p-6 shadow-lg md:p-10">
          {isSuccess ? (
             <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-primary-600 dark:text-primary-400" />
              <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-zinc-50">
                Password Reset!
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-zinc-300">
                Your password has been reset successfully. You can now log in with your new password.
              </p>
              <div className="mt-6">
                <Link to="/login"><Button className="w-full">Back to Login</Button></Link>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center">
                <h1 className="text-2xl font-bold tracking-tight text-primary-600 dark:text-primary-400 sm:text-3xl">
                  Set a New Password
                </h1>
                <p className="mt-2 text-sm text-gray-600 dark:text-zinc-300">
                  Enter your new password below.
                </p>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input id="password" type="password" {...register('password')} />
                  {errors.password && <p className="text-xs text-red-600 dark:text-red-400">{errors.password.message}</p>}
                </div>
                <Button type="submit" className="w-full" isLoading={isSubmitting} size="lg">
                  Reset Password
                </Button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
