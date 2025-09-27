import { zodResolver } from '@hookform/resolvers/zod';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Building2, Lock, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Input } from '../../components/forms/Input';
import { Button } from '../../components/ui/Button';
import { Label } from '../../components/ui/Label';
import authService from '../../services/auth.service';

const registerAgencySchema = z
  .object({
    agencyName: z.string().min(3, { message: 'Agency name must be at least 3 characters.' }),
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters long.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  });

type RegisterAgencyFormValues = z.infer<typeof registerAgencySchema>;

const RegisterAgency = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterAgencyFormValues>({
    resolver: zodResolver(registerAgencySchema),
  });

  const onSubmit = async (data: RegisterAgencyFormValues) => {
    try {
      const { confirmPassword, ...apiData } = data;
      const response = await authService.registerAgency(apiData);

      if (response.success) {
        toast.success(response.message);
        setTimeout(() => navigate('/login'), 1500);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      setError('root', { type: 'server', message: errorMessage });
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

      {/* Form wrapper with top padding */}
      <div className="relative flex flex-col items-center justify-start pt-12 pb-12 px-4 sm:px-6 lg:px-8 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 dark:backdrop-blur-sm p-6 shadow-lg md:p-10">
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight text-primary-600 dark:text-primary-400 sm:text-3xl">
                Register Your Agency
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-zinc-300">
                Find and hire the best NYSC candidates.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
              {errors.root && (
                <div className="rounded-md border border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-950/60 p-3 text-center text-sm text-red-700 dark:text-red-400">
                  {errors.root.message}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="agencyName">Agency Name</Label>
                <Input
                  id="agencyName"
                  icon={Building2}
                  error={!!errors.agencyName}
                  {...register('agencyName')}
                  disabled={isSubmitting}
                  className="text-gray-900 dark:text-zinc-50 placeholder-gray-400 bg-white dark:bg-zinc-900"
                />
                {errors.agencyName && <p className="text-xs text-red-600 dark:text-red-400">{errors.agencyName.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Owner's Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  icon={Mail}
                  error={!!errors.email}
                  {...register('email')}
                  disabled={isSubmitting}
                  className="text-gray-900 dark:text-zinc-50 placeholder-gray-400 bg-white dark:bg-zinc-900"
                />
                {errors.email && <p className="text-xs text-red-600 dark:text-red-400">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  icon={Lock}
                  error={!!errors.password}
                  {...register('password')}
                  disabled={isSubmitting}
                  className="text-gray-900 dark:text-zinc-50 placeholder-gray-400 bg-white dark:bg-zinc-900"
                />
                {errors.password && <p className="text-xs text-red-600 dark:text-red-400">{errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  icon={Lock}
                  error={!!errors.confirmPassword}
                  {...register('confirmPassword')}
                  disabled={isSubmitting}
                  className="text-gray-900 dark:text-zinc-50 placeholder-gray-400 bg-white dark:bg-zinc-900"
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-600 dark:text-red-400">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" isLoading={isSubmitting} size="lg">
                Create Agency Account
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-600 dark:text-zinc-300">
              Already registered?{' '}
              <Link to="/login" className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-500">
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterAgency;

