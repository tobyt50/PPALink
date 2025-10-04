import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/forms/Input";
import { Label } from "../../../components/ui/Label";
import authService from "../../../services/auth.service";
import { useAuthStore } from "../../../context/AuthContext";
import { ShieldOff } from "lucide-react";

interface TwoFactorDisableModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TwoFactorDisableModal = ({
  isOpen,
  onClose,
}: TwoFactorDisableModalProps) => {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<{ token: string }>();
  const { login, user } = useAuthStore();

  const onSubmit = async (data: { token: string }) => {
    const disablePromise = authService.disable2fa(data.token);
    await toast.promise(disablePromise, {
      loading: "Verifying token...",
      success: () => {
        if (user) {
          const updatedUser = { ...user, isTwoFactorEnabled: false };
          login(updatedUser, useAuthStore.getState().token!);
        }
        onClose();
        return "2FA has been disabled successfully.";
      },
      error: "Invalid token. Please try again.",
    });
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/25 dark:bg-black/70 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 text-left align-middle shadow-2xl dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-black ring-opacity-5 transition-all">
                <div className="p-5 border-b border-gray-100 dark:border-zinc-800 flex items-center">
                  <ShieldOff className="h-5 w-5 mr-3 text-red-600 dark:text-red-500" />
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold leading-6 text-gray-900 dark:text-zinc-50"
                  >
                    Disable Two-Factor Authentication
                  </Dialog.Title>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-600 dark:text-zinc-300">
                    To confirm this action, please enter the 6-digit code from
                    your authenticator app.
                  </p>
                </div>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="px-6 pb-6 space-y-4"
                >
                  <div className="space-y-1.5">
                    <Label htmlFor="disable-token">Verification Code</Label>
                    <Input
                      id="disable-token"
                      type="text"
                      maxLength={6}
                      placeholder="123456"
                      {...register("token", { required: true })}
                      error={!!errors.token}
                    />
                  </div>
                  <div className="mt-6 flex justify-end space-x-3 pt-5 border-t border-gray-100 dark:border-zinc-800">
                    <Button type="button" variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="destructive"
                      isLoading={isSubmitting}
                    >
                      Confirm & Disable
                    </Button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
