import { zodResolver } from "@hookform/resolvers/zod";
import { motion, useScroll, useTransform } from "framer-motion";
import { Lock, Mail, Briefcase, Shield, Building, User } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { Input } from "../../components/forms/Input";
import { Button } from "../../components/ui/Button";
import { Label } from "../../components/ui/Label";
import { useAuthStore } from "../../context/AuthContext";
import authService from "../../services/auth.service";
import useFetch from "../../hooks/useFetch";
import type { Agency } from "../../types/agency";
import type { RegisterCandidatePayload } from "../../types/auth";

const registerCandidateSchema = z.object({
  firstName: z.string().min(2, { message: "First name is required." }),
  lastName: z.string().min(2, { message: "Last name is required." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." }),
});
type RegisterFormValues = z.infer<typeof registerCandidateSchema>;

const AgencyCard = ({ agency }: { agency: Agency }) => (
  <Link to={`/agencies/${agency.id}/profile`}>
    <motion.div
      whileHover={{ y: -5, scale: 1.03 }}
      className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm hover:shadow-xl transition transform backdrop-blur-sm h-full flex flex-col items-center text-center"
    >
      <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-zinc-800 flex-shrink-0 flex items-center justify-center mb-3">
        <Building className="h-6 w-6 text-gray-400 dark:text-zinc-500" />
      </div>
      <h3 className="font-semibold text-white text-sm">{agency.name}</h3>
      <p className="mt-1 text-green-300 text-xs">{agency.industry?.name || 'Various Industries'}</p>
    </motion.div>
  </Link>
);

const RegisterCandidate = () => {
  const navigate = useNavigate();
  const loginToStore = useAuthStore((state) => state.login);

  const [searchParams] = useSearchParams();
  const profileType =
    searchParams.get("type") === "PROFESSIONAL" ? "PROFESSIONAL" : "NYSC";

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerCandidateSchema),
  });

  const { data: featuredAgencies } = useFetch<Agency[]>('/public/featured-agencies');

  const onSubmit = async (data: RegisterFormValues) => {
    const payload: RegisterCandidatePayload = { ...data, profileType };
    try {
      const response = await authService.registerCandidate(payload);
      if (response.success) {
        toast.success("Account created successfully!");
        const { user, token } = response.data;
        // 1. Immediately log the user into the state store.
        loginToStore(user, token);
        // 2. Navigate them directly into the app. The OnboardingGuard will handle the rest.
        navigate("/dashboard/candidate");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      toast.error(errorMessage);
      setError("root", { type: "server", message: errorMessage });
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
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:block lg:w-1/2 text-center lg:text-left space-y-1 max-h-[80vh] overflow-y-auto"
          >
            <div className="space-y-1">
              <h1 className="text-4xl font-bold tracking-tight leading-tight">
                Get Started
              </h1>
            </div>
            <div className="flex flex-col space-y-3 pt-4 text-sm text-zinc-400 max-w-md mx-auto lg:mx-0">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 flex-shrink-0" />
                <span>Create your profile</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 flex-shrink-0" />
                <span>Secure registration</span>
              </div>
              <div className="flex items-center space-x-3">
                <Briefcase className="h-5 w-5 flex-shrink-0" />
                <span>Find your dream job</span>
              </div>
            </div>
            {featuredAgencies && featuredAgencies.length > 0 && (
              <div className="mt-8 pt-6 border-t border-white/10">
                <h3 className="text-xl font-bold mb-4 text-white">Hiring Now</h3>
                <div className="grid grid-cols-2 gap-4">
                  {featuredAgencies.slice(0, 4).map((agency, i) => (
                    <motion.div key={agency.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.1 }}>
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
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full lg:w-1/2 flex justify-center lg:justify-end"
          >
            <div className="w-full max-w-sm">
              <div className="rounded-2xl border border-gray-200/50 dark:border-zinc-800/50 bg-white/95 dark:bg-zinc-900/95 dark:backdrop-blur-md p-4 lg:p-8 shadow-2xl">
                <div className="text-center">
                  <h2 className="text-xl font-bold tracking-tight text-primary-600 dark:text-primary-400 lg:text-3xl">
                    Create Account
                  </h2>
                  <p className="mt-2 text-xs text-gray-600 dark:text-zinc-300">
                    Join as a{" "}
                    <span className="font-semibold">
                      {profileType === "NYSC"
                        ? "Corps Member"
                        : "Young Professional"}
                    </span>
                    .
                  </p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                  {errors.root && (
                    <div className="rounded-md border border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-950/60 p-3 text-center text-xs text-red-700 dark:text-red-400">
                      {errors.root.message}
                    </div>
                  )}
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="w-full space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        icon={User}
                        error={!!errors.firstName}
                        {...register("firstName")}
                        disabled={isSubmitting}
                        className="text-gray-900 dark:text-zinc-50 placeholder-gray-400 bg-white dark:bg-zinc-900"
                      />
                      {errors.firstName && (
                        <p className="text-xs text-red-600 dark:text-red-400">
                          {errors.firstName.message}
                        </p>
                      )}
                    </div>
                    <div className="w-full space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        icon={User}
                        error={!!errors.lastName}
                        {...register("lastName")}
                        disabled={isSubmitting}
                        className="text-gray-900 dark:text-zinc-50 placeholder-gray-400 bg-white dark:bg-zinc-900"
                      />
                      {errors.lastName && (
                        <p className="text-xs text-red-600 dark:text-red-400">
                          {errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      icon={Mail}
                      error={!!errors.email}
                      {...register("email")}
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
                      {...register("password")}
                      disabled={isSubmitting}
                      className="text-gray-900 dark:text-zinc-50 placeholder-gray-400 bg-white dark:bg-zinc-900"
                    />
                    {errors.password && (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    isLoading={isSubmitting}
                    size="sm"
                  >
                    Create Account
                  </Button>
                </form>
                <p className="mt-6 text-center text-xs text-gray-600 dark:text-zinc-300">
                  Already have an account?{" "}
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

export default RegisterCandidate;