import { zodResolver } from '@hookform/resolvers/zod';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Lock, Mail, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Input } from '../../components/forms/Input';
import { Button } from '../../components/ui/Button';
import { Label } from '../../components/ui/Label';
import authService from '../../services/auth.service';

const registerCandidateSchema = z
  .object({
    firstName: z.string().min(2, { message: 'First name is required.' }),
    lastName: z.string().min(2, { message: 'Last name is required.' }),
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters long.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerCandidateSchema>;

const RegisterCandidate = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerCandidateSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const { confirmPassword, ...apiData } = data;
      const response = await authService.registerCandidate(apiData);

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
    <div className="w-full min-h-screen relative overflow-hidden text-white">
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
      <div className="absolute inset-0 bg-black/50" />

      {/* Form wrapper with top & bottom padding */}
      <div className="relative flex flex-col items-center justify-start pt-12 pb-12 px-4 sm:px-6 lg:px-8 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg md:p-10">
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight text-primary-600 sm:text-3xl">
                Create your Account
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Join the top network of NYSC talent.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
              {errors.root && (
                <div className="rounded-md border border-red-300 bg-red-50 p-3 text-center text-sm text-red-700">
                  {errors.root.message}
                </div>
              )}

              <div className="flex flex-col gap-5 sm:flex-row">
                <div className="w-full space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    icon={User}
                    error={!!errors.firstName}
                    {...register('firstName')}
                    disabled={isSubmitting}
                    className="text-gray-900 placeholder-gray-400 bg-white"
                  />
                  {errors.firstName && <p className="text-xs text-red-600">{errors.firstName.message}</p>}
                </div>
                <div className="w-full space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    icon={User}
                    error={!!errors.lastName}
                    {...register('lastName')}
                    disabled={isSubmitting}
                    className="text-gray-900 placeholder-gray-400 bg-white"
                  />
                  {errors.lastName && <p className="text-xs text-red-600">{errors.lastName.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  icon={Mail}
                  error={!!errors.email}
                  {...register('email')}
                  disabled={isSubmitting}
                  className="text-gray-900 placeholder-gray-400 bg-white"
                />
                {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
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
                  className="text-gray-900 placeholder-gray-400 bg-white"
                />
                {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
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
                  className="text-gray-900 placeholder-gray-400 bg-white"
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" isLoading={isSubmitting} size="lg">
                Create Account
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500">
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterCandidate;
