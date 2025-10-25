import { zodResolver } from "@hookform/resolvers/zod";
import { motion, useScroll, useTransform } from "framer-motion";
import { Building2, Lock, Mail, Shield } from "lucide-react";
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
            className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-sm hover:shadow-xl transition transform backdrop-blur-sm h-full flex flex-col items-center text-center"
        >
            <Avatar
                user={{ role: 'AGENCY', ownedAgencies: [agency] }}
                size="lg"
                shape="square"
            />
            <h3 className="font-semibold text-white mt-4">{agency.name}</h3>
            <p className="mt-1 text-green-300 text-sm">{agency.industry?.name || 'Various Industries'}</p>
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

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 100]);

  return (
    <div className="w-full min-h-screen relative overflow-hidden text-white dark:text-zinc-100 h-screen flex items-center justify-center">
      <motion.div
        style={{
          y,
          backgroundImage: "url('/bg.JPG')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className="absolute inset-0"
      />
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70" />
      <div className="relative w-full h-full flex items-center justify-center px-4">
        <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left Section */}
<motion.div
  initial={{ opacity: 0, x: -50 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }} // faster + smooth
  className="hidden lg:block lg:w-1/2 text-center lg:text-left space-y-1 max-h-[80vh] overflow-y-auto"
>
            <div className="space-y-1">
              <h1 className="text-4xl font-bold tracking-tight leading-tight">
                Join the Network
              </h1>
            </div>
            <div className="flex flex-col space-y-3 pt-4 text-sm text-zinc-400 max-w-md mx-auto lg:mx-0">
              <div className="flex items-center space-x-3">
                <Building2 className="h-5 w-5 flex-shrink-0" />
                <span>Post unlimited jobs</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 flex-shrink-0" />
                <span>Access top candidates</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 flex-shrink-0" />
                <span>Secure hiring process</span>
              </div>
            </div>
            {featuredAgencies && featuredAgencies.length > 0 && (
    <div className="mt-8 pt-6 border-t border-white/10">
      <h3 className="text-xl font-bold mb-4 text-white">Active Agencies</h3>
      <div className="grid grid-cols-2 gap-4">
        {featuredAgencies.slice(0, 4).map((agency, i) => (
          <motion.div
            key={agency.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, delay: 0.2 + i * 0.08, ease: "easeOut" }} // snappier cascade
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
  transition={{ duration: 0.35, delay: 0.15, ease: "easeOut" }} // fast + synced
  className="w-full lg:w-1/2 flex justify-center lg:justify-end"
>
            <div className="w-full max-w-sm">
              <div className="rounded-2xl border border-gray-200/50 dark:border-zinc-800/50 bg-white/95 dark:bg-zinc-900/95 dark:backdrop-blur-md p-4 lg:p-8 shadow-2xl">
                <div className="text-center">
                  <h2 className="text-xl font-bold tracking-tight text-primary-600 dark:text-primary-400 lg:text-3xl">
                    Create Account
                  </h2>
                  <p className="mt-2 text-xs text-gray-600 dark:text-zinc-300">
                    Find and hire the best NYSC candidates.
                  </p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                  {errors.root && (
                    <div className="rounded-md border border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-950/60 p-3 text-center text-xs text-red-700 dark:text-red-400">
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
                    {errors.agencyName && (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {errors.agencyName.message}
                      </p>
                    )}
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
                    {errors.email && (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {errors.email.message}
                      </p>
                    )}
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
                    {errors.password && (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {errors.password.message}
                      </p>
                    )}
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
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    isLoading={isSubmitting}
                    size="sm"
                  >
                    Create Agency Account
                  </Button>
                </form>
                <p className="mt-6 text-center text-xs text-gray-600 dark:text-zinc-300">
                  Already registered?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-500"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RegisterAgency;