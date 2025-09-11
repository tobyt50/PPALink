import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Lock, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Input } from '../../components/forms/Input';
import { Button } from '../../components/ui/Button';
import { Label } from '../../components/ui/Label';
import { useAuthStore } from '../../context/AuthContext';
import authService from '../../services/auth.service';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const loginToStore = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await authService.login(data);

      if (response.success) {
        toast.success(response.message);
        const { user, token } = response.data;
        loginToStore(user, token);

        // The useEffect in ProtectedRoute will now handle all data fetching.
        // We simply navigate to the correct dashboard.
        if (user.role === 'ADMIN') {
          // 👇 ADD THIS REDIRECT LOGIC FOR ADMINS
          navigate('/admin/dashboard');
        } else if (user.role === 'CANDIDATE') {
          navigate('/dashboard/candidate');
        } else if (user.role === 'AGENCY') {
          navigate('/dashboard/agency');
        } else {
          navigate('/');
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred.';
      toast.error(errorMessage);
      setError('root', { type: 'server', message: errorMessage });
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg md:p-10">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-primary-600 sm:text-3xl">
              Welcome Back
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to access your PPAHire dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            {errors.root && (
              <div className="rounded-md border border-red-300 bg-red-50 p-3 text-center text-sm text-red-700">
                {errors.root.message}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email" type="email" placeholder="you@example.com" icon={Mail}
                error={!!errors.email} {...register('email')} disabled={isSubmitting}
              />
              {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                  Forgot password?
                </a>
              </div>
              <Input
                id="password" type="password" placeholder="••••••••" icon={Lock}
                error={!!errors.password} {...register('password')} disabled={isSubmitting}
              />
              {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" isLoading={isSubmitting} size="lg">
              Sign In
            </Button>
          </form>
          <p className="mt-8 text-center text-sm text-gray-600">
            Don't have an account yet?{' '}
            <a href="/register/candidate" className="font-semibold text-primary-600 hover:text-primary-500">
              Register as a Candidate
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;