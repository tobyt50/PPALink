import { zodResolver } from "@hookform/resolvers/zod";

import { motion, useScroll, useTransform } from "framer-motion";

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
      className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-sm hover:shadow-xl transition transform backdrop-blur-sm h-full flex flex-col items-center text-center"
    >
      <Avatar
        user={{ role: "AGENCY", ownedAgencies: [agency] }}
        size="lg"
        shape="square"
      />

      <h3 className="font-semibold text-white mt-4">{agency.name}</h3>

      <p className="mt-1 text-green-300 text-sm">
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
                Welcome back
              </h1>
            </div>

            <div className="flex flex-col space-y-3 pt-4 text-sm text-zinc-400 max-w-md mx-auto lg:mx-0">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 flex-shrink-0" />

                <span>Secure login</span>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 flex-shrink-0" />

                <span>Fast email auth</span>
              </div>

              <div className="flex items-center space-x-3">
                <Lock className="h-5 w-5 flex-shrink-0" />

                <span>Your data protected</span>
              </div>
            </div>

            {featuredAgencies && featuredAgencies.length > 0 && (
              <div className="mt-8 pt-6 border-t border-white/10">
                <h3 className="text-xl font-bold mb-4 text-white">
                  Hiring Now
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  {featuredAgencies.slice(0, 4).map((agency, i) => (
                    <motion.div
                      key={agency.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
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
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full lg:w-1/2 flex justify-center lg:justify-end"
          >
            <div className="w-full max-w-sm">
              <div className="rounded-2xl border border-gray-200/50 dark:border-zinc-800/50 bg-white/95 dark:bg-zinc-900/95 dark:backdrop-blur-md p-4 lg:p-8 shadow-2xl">
                {isTwoFactorStep ? (
                  <>
                    <div className="text-center">
                      <h2 className="text-xl font-bold tracking-tight text-primary-600 dark:text-primary-400">
                        Verify Your Identity
                      </h2>

                      <p className="mt-2 text-xs text-gray-600 dark:text-zinc-300">
                        Check your authenticator app for the 6-digit code.
                      </p>
                    </div>

                    <form
                      onSubmit={handle2FASubmit(on2FASubmit)}
                      className="mt-6 space-y-4"
                    >
                      {twoFactorErrors.root && (
                        <div className="rounded-md border border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-950/60 p-3 text-center text-xs text-red-700 dark:text-red-400">
                          {twoFactorErrors.root.message}
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="token">Verification Code</Label>

                        <Input
                          id="token"
                          type="text"
                          placeholder="123456"
                          icon={Shield}
                          error={!!twoFactorErrors.token}
                          {...register2FA("token")}
                          disabled={is2FASubmitting}
                          className="text-gray-900 dark:text-zinc-50 placeholder-gray-400 bg-white dark:bg-zinc-900"
                        />

                        {twoFactorErrors.token && (
                          <p className="text-xs text-red-600 dark:text-red-400">
                            {twoFactorErrors.token.message}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        isLoading={is2FASubmitting}
                        size="sm"
                      >
                        Confirm
                      </Button>

                      <Button
                        variant="link"
                        size="sm"
                        className="w-full"
                        onClick={() => setIsTwoFactorStep(false)}
                      >
                        Back to Sign In
                      </Button>
                    </form>
                  </>
                ) : (
                  <>
                    <div className="text-center">
                      <h2 className="text-xl font-bold tracking-tight text-primary-600 dark:text-primary-400 lg:text-3xl">
                        Sign In
                      </h2>

                      <p className="mt-2 text-xs text-gray-600 dark:text-zinc-300">
                        Access your PPALink dashboard securely.
                      </p>
                    </div>

                    {inviteMessage && (
                      <div className="mt-4 rounded-md bg-blue-50 dark:bg-blue-950/60 p-3 text-center text-xs text-blue-700 dark:text-blue-400">
                        <Info className="inline-block h-4 w-4 mr-2" />{" "}
                        {inviteMessage}
                      </div>
                    )}

                    {inviteError && (
                      <div className="mt-4 rounded-md bg-red-50 dark:bg-red-950/60 p-3 text-center text-xs text-red-700 dark:text-red-400">
                        {inviteError}
                      </div>
                    )}

                    <form
                      onSubmit={handleLoginSubmit(onLoginSubmit)}
                      className="mt-6 space-y-4"
                    >
                      {loginErrors.root && (
                        <div className="rounded-md border border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-950/60 p-3 text-center text-xs text-red-700 dark:text-red-400">
                          {loginErrors.root.message}
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>

                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          icon={Mail}
                          error={!!loginErrors.email}
                          {...registerLogin("email")}
                          disabled={isLoginSubmitting}
                          className="text-gray-900 dark:text-zinc-50 placeholder-gray-400 bg-white dark:bg-zinc-900"
                        />

                        {loginErrors.email && (
                          <p className="text-xs text-red-600 dark:text-red-400">
                            {loginErrors.email.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password">Password</Label>

                          <Link
                            to="/forgot-password"
                            className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500"
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
                          className="text-gray-900 dark:text-zinc-50 placeholder-gray-400 bg-white dark:bg-zinc-900"
                        />

                        {loginErrors.password && (
                          <p className="text-xs text-red-600 dark:text-red-400">
                            {loginErrors.password.message}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        isLoading={isLoginSubmitting}
                        size="sm"
                      >
                        Submit
                      </Button>
                    </form>

                    <p className="mt-6 text-center text-xs text-gray-600 dark:text-zinc-300">
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
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
