import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Building2, Lock, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'; // 1. Import hooks
import { z } from 'zod';

import { Input } from '../../components/forms/Input';
import { Button } from '../../components/ui/Button';
import { Label } from '../../components/ui/Label';
import authService from '../../services/auth.service'; // 2. Import service

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
  const navigate = useNavigate(); // 3. Initialize navigate

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterAgencyFormValues>({
    resolver: zodResolver(registerAgencySchema),
  });

  // 4. UPDATE the onSubmit handler
  const onSubmit = async (data: RegisterAgencyFormValues) => {
    try {
      const { confirmPassword, ...apiData } = data;
      const response = await authService.registerAgency(apiData);

      if (response.success) {
        toast.success(response.message);
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      setError('root', { type: 'server', message: errorMessage });
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg md:p-10">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-primary-600 sm:text-3xl">
              Register Your Agency
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Find and hire the best NYSC candidates.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            {/* 5. Add server error display */}
            {errors.root && (
              <div className="rounded-md border border-red-300 bg-red-50 p-3 text-center text-sm text-red-700">
                {errors.root.message}
              </div>
            )}

            {/* ... rest of the form is unchanged ... */}
            <div className="space-y-2">
              <Label htmlFor="agencyName">Agency Name</Label>
              <Input id="agencyName" icon={Building2} error={!!errors.agencyName} {...register('agencyName')} disabled={isSubmitting} />
              {errors.agencyName && <p className="text-xs text-red-600">{errors.agencyName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Owner's Email Address</Label>
              <Input id="email" type="email" icon={Mail} error={!!errors.email} {...register('email')} disabled={isSubmitting} />
              {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" icon={Lock} error={!!errors.password} {...register('password')} disabled={isSubmitting} />
              {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" icon={Lock} error={!!errors.confirmPassword} {...register('confirmPassword')} disabled={isSubmitting} />
              {errors.confirmPassword && <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>}
            </div>
            <Button type="submit" className="w-full" isLoading={isSubmitting} size="lg">
              Create Agency Account
            </Button>
          </form>
          <p className="mt-8 text-center text-sm text-gray-600">
            Already registered?{' '}
            <a href="/login" className="font-semibold text-primary-600 hover:text-primary-500">
              Sign In
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterAgency;