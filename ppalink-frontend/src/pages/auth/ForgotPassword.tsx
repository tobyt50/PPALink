import { zodResolver } from '@hookform/resolvers/zod';
import { motion, useScroll, useTransform } from 'framer-motion';
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
      await passwordService.requestReset(data.email);
      setIsSubmitted(true);
    } catch (error) {
      setIsSubmitted(true);
      console.error('Forgot password error:', error);
    }
  };

  // Parallax background
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 100]);

  return (
    <div className="w-full min-h-screen relative overflow-hidden text-white dark:text-zinc-100">
      {/* Background image */}
      <motion.div
        style={{
          y,
          backgroundImage: "url('/bg.JPG')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        className="absolute inset-0"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70" />

      {/* Form wrapper */}
      <div className="relative flex flex-col items-center justify-start pt-12 pb-12 px-4 sm:px-6 lg:px-8 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 dark:backdrop-blur-sm p-6 shadow-lg md:p-10">
            {isSubmitted ? (
              <div className="text-center">
                <Mail className="mx-auto h-12 w-12 text-primary-600 dark:text-primary-400" />
                <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-zinc-50">
                  Check your email
                </h1>
                <p className="mt-2 text-sm text-gray-600 dark:text-zinc-300">
                  If an account with that email exists, we've sent a link to reset your password.
                </p>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <h1 className="text-2xl font-bold tracking-tight text-primary-600 dark:text-primary-400 sm:text-3xl">
                    Forgot Password?
                  </h1>
                  <p className="mt-2 text-sm text-gray-600 dark:text-zinc-300">
                    No problem. Enter your email address and we'll send you a link to reset it.
                  </p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      error={!!errors.email}
                      {...register('email')}
                      disabled={isSubmitting}
                      className="text-gray-900 dark:text-zinc-50 placeholder-gray-400 bg-white dark:bg-zinc-900"
                    />
                    {errors.email && (
                      <p className="text-xs text-red-600 dark:text-red-400">{errors.email.message}</p>
                    )}
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
    </div>
  );
};

export default ForgotPasswordPage;

