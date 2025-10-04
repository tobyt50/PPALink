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

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});
type LoginFormValues = z.infer<typeof loginSchema>;

const twoFactorSchema = z.object({
  token: z.string().length(6, "Please enter a 6-digit code."),
});
type TwoFactorFormValues = z.infer<typeof twoFactorSchema>;

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

  const onLoginSubmit = async (data: LoginFormValues) => {
    try {
      const response = await authService.login(data);
      if (response.twoFactorRequired) {
        setLoginPayload(data);
        setIsTwoFactorStep(true);
      } else if (response.success) {
        toast.success(response.message);
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
        toast.success("Login successful!");
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

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 100]);

  return (
    <div className="w-full min-h-screen relative overflow-hidden text-white dark:text-zinc-100 flex items-center justify-center">
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 dark:backdrop-blur-sm p-6 shadow-lg md:p-10">
          {isTwoFactorStep ? (
            <>
              <div className="text-center">
                <h1 className="text-2xl font-bold tracking-tight text-primary-600 dark:text-primary-400">
                  Enter Verification Code
                </h1>
                <p className="mt-2 text-sm text-gray-600 dark:text-zinc-300">
                  Open your authenticator app and enter the 6-digit code.
                </p>
              </div>
              <form
                onSubmit={handle2FASubmit(on2FASubmit)}
                className="mt-8 space-y-6"
              >
                {twoFactorErrors.root && (
                  <div className="rounded-md border border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-950/60 p-3 text-center text-sm text-red-700 dark:text-red-400">
                    {twoFactorErrors.root.message}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="token">6-Digit Code</Label>
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
                  size="lg"
                >
                  Verify
                </Button>
                <Button
                  variant="link"
                  size="sm"
                  className="w-full"
                  onClick={() => setIsTwoFactorStep(false)}
                >
                  Back to Login
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center">
                <h1 className="text-2xl font-bold tracking-tight text-primary-600 dark:text-primary-400 sm:text-3xl">
                  Welcome Back
                </h1>
                <p className="mt-2 text-sm text-gray-600 dark:text-zinc-300">
                  Sign in to access your PPALink dashboard.
                </p>
              </div>
              {inviteMessage && (
                <div className="mt-6 rounded-md bg-blue-50 dark:bg-blue-950/60 p-4 text-center text-sm text-blue-700 dark:text-blue-400">
                  <Info className="inline-block h-5 w-5 mr-2" /> {inviteMessage}
                </div>
              )}
              {inviteError && (
                <div className="mt-6 rounded-md bg-red-50 dark:bg-red-950/60 p-4 text-center text-sm text-red-700 dark:text-red-400">
                  {inviteError}
                </div>
              )}
              <form
                onSubmit={handleLoginSubmit(onLoginSubmit)}
                className="mt-8 space-y-6"
              >
                {loginErrors.root && (
                  <div className="rounded-md border border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-950/60 p-3 text-center text-sm text-red-700 dark:text-red-400">
                    {loginErrors.root.message}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
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
                      className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500"
                    >
                      Forgot password?
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
                  size="lg"
                >
                  Sign In
                </Button>
              </form>
              <p className="mt-8 text-center text-sm text-gray-600 dark:text-zinc-300">
                Not account yet? Register as{" "}
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
  );
};

export default Login;
