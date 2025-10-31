import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Building2, Lock, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Input } from "../../components/forms/Input";
import { Button } from "../../components/ui/Button";
import { Label } from "../../components/ui/Label";
import { useAuthStore } from "../../context/AuthContext";
import authService from "../../services/auth.service";
import useFetch from "../../hooks/useFetch";
import type { Agency } from "../../types/agency";
import { Avatar } from "../../components/ui/Avatar";

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

const AgencyCard = ({ agency }: { agency: Agency }) => (
  <Link to={`/agencies/${agency.id}/profile`}>
    <motion.div
      whileHover={{ y: -5, scale: 1.03 }}
      className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm hover:shadow-xl transition transform h-full flex flex-col items-center text-center"
    >
      <Avatar
        user={{ role: 'AGENCY', ownedAgencies: [agency] }}
        size="lg"
      />
      <h3 className="font-semibold text-gray-900 dark:text-zinc-50 mt-4">{agency.name}</h3>
      <p className="mt-1 text-primary-600 dark:text-primary-400 text-sm">{agency.industry?.name || 'Various Industries'}</p>
    </motion.div>
  </Link>
);

const RegisterAgency = () => {
  const navigate = useNavigate();
  const loginToStore = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterAgencyFormValues>({
    resolver: zodResolver(registerAgencySchema),
  });

  const { data: featuredAgencies } = useFetch<Agency[]>('/public/featured-agencies');

  const onSubmit = async (data: RegisterAgencyFormValues) => {
    try {
      const { confirmPassword, ...apiData } = data;
      const response = await authService.registerAgency(apiData);

      if (response.success) {
        toast.success("Agency created successfully!");
        const { user, token } = response.data;
        loginToStore(user, token);

        // The OnboardingGuard will handle redirecting new agencies to their onboarding flow.
        navigate("/dashboard/agency");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      setError('root', { type: 'server', message: errorMessage });
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-920 flex items-center lg:items-start justify-center lg:pt-12">
      <div className="w-full max-w-5xl mx-auto px-4 py-4 flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8 lg:gap-12">
        {/* Left Section */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="hidden lg:block w-full lg:w-1/2 text-center lg:text-left -mt-4"
        >
          {featuredAgencies && featuredAgencies.length > 0 && (
            <div className="mt-4">
              <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-zinc-50">Active Agencies</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-h-80">
                {featuredAgencies.slice(0, 4).map((agency, i) => (
                  <motion.div
                    key={agency.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25, delay: 0.2 + i * 0.08 }}
                  >
                    <AgencyCard agency={agency} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
        {/* Right Section - Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="w-full lg:w-1/2 flex justify-center"
        >
          <div className="w-full max-w-sm lg:max-w-md space-y-8 lg:rounded-2xl lg:bg-white dark:lg:bg-zinc-900 lg:shadow-md dark:lg:shadow-none dark:lg:ring-1 dark:lg:ring-white/10 lg:ring-1 lg:ring-gray-100 lg:p-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-primary-600 dark:text-primary-400">
                Create Account
              </h2>
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                Find and hire the best candidates.
              </p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {errors.root && (
                <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-4 text-center text-sm text-red-600 dark:text-red-400">
                  {errors.root.message}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="agencyName" className="text-gray-900 dark:text-zinc-50">Agency Name</Label>
                <Input
                  id="agencyName"
                  icon={Building2}
                  error={!!errors.agencyName}
                  {...register('agencyName')}
                  disabled={isSubmitting}
                  className="text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 focus:ring-primary-500 focus:border-primary-500 rounded-lg"
                />
                {errors.agencyName && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.agencyName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-900 dark:text-zinc-50">Owner's Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  icon={Mail}
                  error={!!errors.email}
                  {...register('email')}
                  disabled={isSubmitting}
                  className="text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 focus:ring-primary-500 focus:border-primary-500 rounded-lg"
                />
                {errors.email && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-900 dark:text-zinc-50">Password</Label>
                <Input
                  id="password"
                  type="password"
                  icon={Lock}
                  error={!!errors.password}
                  {...register('password')}
                  disabled={isSubmitting}
                  className="text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 focus:ring-primary-500 focus:border-primary-500 rounded-lg"
                />
                {errors.password && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-900 dark:text-zinc-50">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  icon={Lock}
                  error={!!errors.confirmPassword}
                  {...register('confirmPassword')}
                  disabled={isSubmitting}
                  className="text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 focus:ring-primary-500 focus:border-primary-500 rounded-lg"
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full rounded-lg"
                isLoading={isSubmitting}
                size="lg"
              >
                Create Agency Account
              </Button>
            </form>
            <p className="text-center text-sm text-gray-500 dark:text-zinc-400">
              Already registered?{" "}
              <Link
                to="/login"
                className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-500"
              >
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