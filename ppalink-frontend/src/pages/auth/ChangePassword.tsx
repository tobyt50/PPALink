import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Input } from '../../components/forms/Input';
import { Button } from '../../components/ui/Button';
import { Label } from '../../components/ui/Label';
import authService from '../../services/auth.service';
import { useAuthStore } from '../../context/AuthContext';

const changePasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters long.'),
});

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

const ChangePasswordPage = () => {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormValues) => {
    try {
      await authService.changePassword(data.newPassword);
      toast.success('Password changed successfully! Please log in with your new password.');
      logout();
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-920 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="text-center">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-r from-primary-100 to-green-100 mb-4">
              <Lock className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-400 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
              Change Your Password
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-zinc-300">
              For security, you must change your temporary password before you can proceed.
            </p>
        </div>
        <div className="mt-8 rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                icon={Lock}
                error={!!errors.newPassword}
                {...register('newPassword')}
              />
              {errors.newPassword && <p className="text-xs text-red-500">{errors.newPassword.message}</p>}
            </div>
            <Button type="submit" className="w-full" isLoading={isSubmitting} size="lg">
              Set New Password
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ChangePasswordPage;

