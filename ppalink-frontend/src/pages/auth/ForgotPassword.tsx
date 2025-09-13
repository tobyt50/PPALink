import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Input } from '../../components/forms/Input';
import { Button } from '../../components/ui/Button';
import { Label } from '../../components/ui/Label';
import passwordService from '../../services/password.service';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      // 2. Uncomment the real service call
      await passwordService.requestReset(data.email);
      setIsSubmitted(true);
    } catch (error) {
      setIsSubmitted(true);
      console.error("Forgot password error:", error);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="rounded-xl border bg-white p-6 shadow-lg md:p-10">
          {isSubmitted ? (
            <div className="text-center">
              <Mail className="mx-auto h-12 w-12 text-primary-600" />
              <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">
                Check your email
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                If an account with that email exists, we've sent a link to reset your password.
              </p>
            </div>
          ) : (
            <>
              <div className="text-center">
                <h1 className="text-2xl font-bold tracking-tight text-primary-600 sm:text-3xl">
                  Forgot Password?
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  No problem. Enter your email address and we'll send you a link to reset it.
                </p>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" {...register('email')} />
                  {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
                </div>
                <Button type="submit" className="w-full" isLoading={isSubmitting} size="lg">
                  Send Reset Link
                </Button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;