import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Building2, Lock, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Input } from '../../components/forms/Input';
import { Button } from '../../components/ui/Button';
import { Label } from '../../components/ui/Label';

// 1. Define the Zod schema for agency registration
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
  // 2. Set up React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterAgencyFormValues>({
    resolver: zodResolver(registerAgencySchema),
  });

  // 3. Define the submission handler
  const onSubmit = async (data: RegisterAgencyFormValues) => {
    console.log('Agency registration submitted:', data);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // Real-world logic would call the agency registration service
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="rounded-xl border border-gray-200 bg-white/50 p-6 shadow-lg backdrop-blur-sm md:p-10">
          <div className="text-center">
            {/* Green theme applied to the header */}
            <h1 className="text-2xl font-bold tracking-tight text-primary-600 sm:text-3xl">
              Register Your Agency
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Find and hire the best NYSC candidates.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
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