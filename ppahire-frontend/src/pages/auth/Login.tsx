import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Lock, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Input } from '../../components/forms/Input';
import { Button } from '../../components/ui/Button';
import { Label } from '../../components/ui/Label';

// 1. Define the validation schema using Zod
const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

// Infer the TypeScript type from the schema
type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  // 2. Set up the form hook from React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // 3. Define the submission handler
  const onSubmit = async (data: LoginFormValues) => {
    // Simulate an API call
    console.log('Form submitted with:', data);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // In a real app, you would have your API call logic here:
    // try {
    //   const response = await authService.login(data);
    //   // handle success, e.g., redirect, save token
    // } catch (error) {
    //   // handle error, e.g., show toast notification
    // }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="rounded-xl border border-gray-200 bg-white/50 p-6 shadow-lg backdrop-blur-sm md:p-10">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Welcome Back
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to access your PPAHire dashboard.
            </p>
          </div>

          {/* 4. Build the form structure */}
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                icon={Mail}
                error={!!errors.email}
                {...register('email')}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                        Forgot password?
                    </a>
                </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                icon={Lock}
                error={!!errors.password}
                {...register('password')}
                disabled={isSubmitting}
              />
              {errors.password && (
                <p className="text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>
            
            <Button type="submit" className="w-full" isLoading={isSubmitting} size="lg">
              Sign In
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="#" className="font-semibold text-primary-600 hover:text-primary-500">
              Register now
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;