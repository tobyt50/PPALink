import { zodResolver } from "@hookform/resolvers/zod";

import { motion } from "framer-motion";

import { Info, Lock, Mail, Shield } from "lucide-react";

import { useState } from "react";

import { useForm } from "react-hook-form";

import toast from "react-hot-toast";

import { Link, useLocation, useNavigate } from "react-router-dom";

import { z } from "zod";

import { Input } from "../../components/forms/Input";

import { Button } from "../../components/ui/Button";

import { Label } from "../../components/ui/Label";

import { useAuthStore } from "../../context/AuthContext";

import authService from "../../services/auth.service";

import invitationService from "../../services/invitation.service";

import useFetch from "../../hooks/useFetch";

import type { Agency } from "../../types/agency";

import { Avatar } from "../../components/ui/Avatar";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),

  password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const twoFactorSchema = z.object({
  token: z.string().length(6, "Please enter a 6-digit code."),
});

type TwoFactorFormValues = z.infer<typeof twoFactorSchema>;

const AgencyCard = ({ agency }: { agency: Agency }) => (
  <Link to={`/agencies/${agency.id}/profile`}>
    <motion.div
      whileHover={{ y: -5, scale: 1.03 }}
      className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm hover:shadow-xl transition transform h-full flex flex-col items-center text-center"
    >
      <Avatar
        user={{ role: "AGENCY", ownedAgencies: [agency] }}
        size="lg"
      />

      <h3 className="font-semibold text-gray-900 dark:text-zinc-50 mt-4">{agency.name}</h3>

      <p className="mt-1 text-primary-600 dark:text-primary-400 text-sm">
        {agency.industry?.name || "Various Industries"}
      </p>
    </motion.div>
  </Link>
);

const Login = () => {
  const navigate = useNavigate();

  const location = useLocation();

  const loginToStore = useAuthStore((state) => state.login);

  const inviteMessage = location.state?.message;

  const inviteError = location.state?.error;

  const [isTwoFactorStep, setIsTwoFactorStep] = useState(false);

  const [loginPayload, setLoginPayload] = useState<LoginFormValues | null>(
    null
  );

  const {
    register: registerLogin,

    handleSubmit: handleLoginSubmit,

    setError: setLoginError,

    formState: { errors: loginErrors, isSubmitting: isLoginSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const {
    register: register2FA,

    handleSubmit: handle2FASubmit,

    setError: set2FAError,

    formState: { errors: twoFactorErrors, isSubmitting: is2FASubmitting },
  } = useForm<TwoFactorFormValues>({ resolver: zodResolver(twoFactorSchema) });

  const { data: featuredAgencies } = useFetch<Agency[]>(
    "/public/featured-agencies"
  );

  const onLoginSubmit = async (data: LoginFormValues) => {
    try {
      const response = await authService.login(data);

      if (response.twoFactorRequired) {
        setLoginPayload(data);

        setIsTwoFactorStep(true);
      } else if (response.success) {
        const { user, token } = response.data;

        loginToStore(user, token);

        if (location.state?.from?.pathname === "/handle-invite") {
          const token = new URLSearchParams(location.state.from.search).get(
            "token"
          );

          if (token) {
            try {
              await invitationService.acceptInviteAsLoggedInUser(token);

              toast.success("Invitation accepted successfully!");
            } catch (inviteError: any) {
              toast.error(
                inviteError.response?.data?.message ||
                  "Failed to accept invitation."
              );
            }
          }
        }

        if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
          navigate("/admin/dashboard");
        } else if (user.role === "CANDIDATE") {
          navigate("/dashboard/candidate");
        } else if (user.role === "AGENCY") {
          navigate("/dashboard/agency");
        } else {
          navigate("/");
        }
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "An unexpected error occurred.";

      toast.error(errorMessage);

      setLoginError("root", { type: "server", message: errorMessage });
    }
  };

  const on2FASubmit = async (data: TwoFactorFormValues) => {
    if (!loginPayload) return;

    try {
      const response = await authService.login({
        ...loginPayload,

        twoFactorToken: data.token,
      });

      if (response.success) {
        const { user, token } = response.data;

        loginToStore(user, token);

        if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
          navigate("/admin/dashboard");
        } else if (user.role === "CANDIDATE") {
          navigate("/dashboard/candidate");
        } else if (user.role === "AGENCY") {
          navigate("/dashboard/agency");
        } else {
          navigate("/");
        }
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "An unexpected error occurred.";

      toast.error(errorMessage);

      set2FAError("root", { type: "server", message: errorMessage });
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-920 flex items-start justify-center pt-20 lg:items-start lg:pt-12">
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
              <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-zinc-50">Hiring Now</h3>
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
            {isTwoFactorStep ? (
              <>
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold tracking-tight text-primary-600 dark:text-primary-400">
                    Verify Your Identity
                  </h2>

                  <p className="text-sm text-gray-500 dark:text-zinc-400">
                    Check your authenticator app for the 6-digit code.
                  </p>
                </div>

                <form
                  onSubmit={handle2FASubmit(on2FASubmit)}
                  className="space-y-6"
                >
                  {twoFactorErrors.root && (
                    <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-4 text-center text-sm text-red-600 dark:text-red-400">
                      {twoFactorErrors.root.message}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="token" className="text-gray-900 dark:text-zinc-50">Verification Code</Label>

                    <Input
                      id="token"
                      type="text"
                      placeholder="123456"
                      icon={Shield}
                      error={!!twoFactorErrors.token}
                      {...register2FA("token")}
                      disabled={is2FASubmitting}
                      className="text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 focus:ring-primary-500 focus:border-primary-500 rounded-lg"
                    />

                    {twoFactorErrors.token && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {twoFactorErrors.token.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full rounded-lg"
                    isLoading={is2FASubmitting}
                    size="lg"
                  >
                    Confirm
                  </Button>

                  <Button
                    variant="link"
                    size="lg"
                    className="w-full text-gray-600 dark:text-zinc-400"
                    onClick={() => setIsTwoFactorStep(false)}
                  >
                    Back to Sign In
                  </Button>
                </form>
              </>
            ) : (
              <>
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold tracking-tight text-primary-600 dark:text-primary-400">
                    Welcome back
                  </h2>

                  <p className="text-sm text-gray-500 dark:text-zinc-400">
                    Access your dashboard securely.
                  </p>
                </div>

                {inviteMessage && (
                  <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 p-4 text-center text-sm text-blue-600 dark:text-blue-400">
                    <Info className="inline-block h-4 w-4 mr-2" />{" "}
                    {inviteMessage}
                  </div>
                )}

                {inviteError && (
                  <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-4 text-center text-sm text-red-600 dark:text-red-400">
                    {inviteError}
                  </div>
                )}

                <form
                  onSubmit={handleLoginSubmit(onLoginSubmit)}
                  className="space-y-6"
                >
                  {loginErrors.root && (
                    <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-4 text-center text-sm text-red-600 dark:text-red-400">
                      {loginErrors.root.message}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-900 dark:text-zinc-50">Email</Label>

                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      icon={Mail}
                      error={!!loginErrors.email}
                      {...registerLogin("email")}
                      disabled={isLoginSubmitting}
                      className="text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 focus:ring-primary-500 focus:border-primary-500 rounded-lg"
                    />

                    {loginErrors.email && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {loginErrors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-gray-900 dark:text-zinc-50">Password</Label>

                      <Link
                        to="/forgot-password"
                        className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500"
                      >
                        Forgot?
                      </Link>
                    </div>

                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      icon={Lock}
                      error={!!loginErrors.password}
                      {...registerLogin("password")}
                      disabled={isLoginSubmitting}
                      className="text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 focus:ring-primary-500 focus:border-primary-500 rounded-lg"
                    />

                    {loginErrors.password && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {loginErrors.password.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full rounded-lg"
                    isLoading={isLoginSubmitting}
                    size="lg"
                  >
                    Sign In
                  </Button>
                </form>

                <p className="text-center text-sm text-gray-500 dark:text-zinc-400">
                  New here? Create an account as{" "}
                  <Link
                    to="/register/candidate"
                    className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-500"
                  >
                    Corp Member
                  </Link>{" "}
                  or{" "}
                  <Link
                    to="/register/agency"
                    className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-500"
                  >
                    Agency
                  </Link>
                </p>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;