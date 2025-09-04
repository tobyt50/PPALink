import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Lock, Mail, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Input } from '../../components/forms/Input';
import { Button } from '../../components/ui/Button';
import { Label } from '../../components/ui/Label';

// 1. Define the validation schema, including password confirmation
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
    path: ['confirmPassword'], // Show error on the confirm password field
  });

// Infer the TypeScript type from the schema
type RegisterFormValues = z.infer<typeof registerCandidateSchema>;

const RegisterCandidate = () => {
  // 2. Set up React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerCandidateSchema),
  });

  // 3. Define the submission handler
  const onSubmit = async (data: RegisterFormValues) => {
    console.log('Candidate registration submitted:', data);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // Real-world logic:
    // try {
    //   const { confirmPassword, ...apiData } = data;
    //   await authService.registerCandidate(apiData);
    //   // show success toast, redirect to login or dashboard
    // } catch (error) {
    //   // show error toast
    // }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg" // Slightly wider for the longer form
      >
        <div className="rounded-xl border border-gray-200 bg-white/50 p-6 shadow-lg backdrop-blur-sm md:p-10">
          <div className="text-center">
            {/* --- THEME FEEDBACK APPLIED --- */}
            <h1 className="text-2xl font-bold tracking-tight text-primary-600 sm:text-3xl">
              Create your Candidate Account
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Join the top network of NYSC talent.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <div className="flex flex-col gap-5 sm:flex-row">
              <div className="w-full space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" icon={User} error={!!errors.firstName} {...register('firstName')} disabled={isSubmitting} />
                {errors.firstName && <p className="text-xs text-red-600">{errors.firstName.message}</p>}
              </div>
              <div className="w-full space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" icon={User} error={!!errors.lastName} {...register('lastName')} disabled={isSubmitting} />
                {errors.lastName && <p className="text-xs text-red-600">{errors.lastName.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
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
              Create Account
            </Button>
          </form>
          
          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="font-semibold text-primary-600 hover:text-primary-500">
              Sign In
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterCandidate;