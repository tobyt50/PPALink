import { Loader2, Lock, Save, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/forms/Input";
import { Label } from "../../components/ui/Label";
import { ToggleSwitch } from "../../components/ui/ToggleSwitch";
import { useAuthStore } from "../../context/AuthContext";
import useFetch from "../../hooks/useFetch";
import adminService, {
  type FeatureFlag,
  type PlatformSetting,
} from "../../services/admin.service";
import { TwoFactorSetupModal } from "./forms/TwoFactorSetupModal";
import { TwoFactorDisableModal } from "./forms/TwoFactorDisableModal";

interface SettingsFormValues {
  maintenanceMode: boolean;
  freeJobPostLimit: number;
  freeMemberLimit: number;
}

const SettingsPage = () => {
  const {
    data: settings,
    isLoading: isLoadingSettings,
    refetch: refetchSettings,
  } = useFetch<PlatformSetting[]>("/admin/settings");
  const {
    data: flags,
    isLoading: isLoadingFlags,
    refetch: refetchFlags,
  } = useFetch<FeatureFlag[]>("/admin/feature-flags");

  const user = useAuthStore((state) => state.user);
  const refreshUser = useAuthStore((state) => state.refreshUser);

  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false); // 2. Add state for the disable modal

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<SettingsFormValues>();

  useEffect(() => {
    if (settings) {
      const settingsAsObject = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as any);
      reset({
        maintenanceMode: settingsAsObject.maintenanceMode || false,
        freeJobPostLimit: settingsAsObject.freeJobPostLimit || 1,
        freeMemberLimit: settingsAsObject.freeMemberLimit || 1,
      });
    }
  }, [settings, reset]);

  const isLoading = isLoadingSettings || isLoadingFlags;

  const handleFlagToggle = async (flagName: string, isEnabled: boolean) => {
    const togglePromise = adminService.updateFeatureFlag(flagName, isEnabled);
    await toast.promise(togglePromise, {
      loading: "Updating flag...",
      success: "Feature flag updated successfully!",
      error: "Failed to update feature flag.",
    });
    refetchFlags();
  };

  const onSaveSettings = async (data: SettingsFormValues) => {
    const settingsToUpdate = Object.entries(data).map(([key, value]) => ({
      key,
      value,
    }));
    const savePromise = adminService.updateSettings(settingsToUpdate);
    await toast.promise(savePromise, {
      loading: "Saving settings...",
      success: () => {
        refetchSettings();
        reset(data);
        return "Platform settings updated successfully!";
      },
      error: "Failed to save settings.",
    });
  };

  const handleClose2faModals = () => {
    setIsSetupModalOpen(false);
    setIsDisableModalOpen(false);
    refreshUser();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" />
      </div>
    );
  }

  return (
    <>
      <TwoFactorSetupModal
        isOpen={isSetupModalOpen}
        onClose={handleClose2faModals}
      />
      <TwoFactorDisableModal
        isOpen={isDisableModalOpen}
        onClose={handleClose2faModals}
      />

      <div className="mx-auto max-w-5xl space-y-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="mt-2 text-gray-600 dark:text-zinc-300">
            Manage global settings and experimental features.
          </p>
        </div>

        {/* --- 3. ADDED SECURITY SECTION --- */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
              Account Security
            </h2>
          </div>
          <div className="p-6">
            <h3 className="font-medium text-gray-800 dark:text-zinc-100">
              Two-Factor Authentication (2FA)
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
              Add an extra layer of security to your account. When enabled, you
              will be required to enter a code from your authenticator app to
              log in.
            </p>
            <div className="mt-6">
              {user?.isTwoFactorEnabled ? (
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/60 text-green-800 dark:text-green-300 rounded-xl">
                  <div className="flex items-center">
                    <ShieldCheck className="h-5 w-5 mr-3 flex-shrink-0" />
                    <div>
                      <strong>Status:</strong>{" "}
                      <span className="font-bold">ENABLED</span>.
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsDisableModalOpen(true)}
                  >
                    Disable 2FA
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-950/60 text-yellow-800 dark:text-yellow-400 rounded-xl">
                  <div className="flex items-center">
                    <Lock className="h-5 w-5 mr-3 flex-shrink-0" />
                    <div>
                      <strong>Status:</strong>{" "}
                      <span className="font-bold">DISABLED</span>.
                    </div>
                  </div>
                  <Button onClick={() => setIsSetupModalOpen(true)}>
                    Enable 2FA
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
              Feature Flags
            </h2>
          </div>
          <ul className="divide-y divide-gray-100 dark:divide-zinc-800">
            {flags?.map((flag) => (
              <li
                key={flag.name}
                className="px-6 py-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-800 dark:text-zinc-100">
                    {flag.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-zinc-400">
                    {flag.description}
                  </p>
                </div>
                <ToggleSwitch
                  enabled={flag.isEnabled}
                  onChange={(enabled) => handleFlagToggle(flag.name, enabled)}
                  srLabel={`Toggle ${flag.name}`}
                />
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={handleSubmit(onSaveSettings)}>
          <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
                General Settings
              </h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-zinc-800">
              <Controller
                name="maintenanceMode"
                control={control}
                render={({ field }) => (
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-zinc-100">
                        Maintenance Mode
                      </p>
                      <p className="text-sm text-gray-500 dark:text-zinc-400">
                        Temporarily disable public access to the site.
                      </p>
                    </div>
                    <ToggleSwitch
                      enabled={field.value}
                      onChange={field.onChange}
                      srLabel="Toggle Maintenance Mode"
                    />
                  </div>
                )}
              />
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label htmlFor="freeJobPostLimit">Free Plan Job Limit</Label>
                  <Input
                    id="freeJobPostLimit"
                    type="number"
                    {...register("freeJobPostLimit", {
                      valueAsNumber: true,
                      min: -1,
                    })}
                  />
                  <p className="text-xs text-gray-500 dark:text-zinc-400">
                    Set to -1 for unlimited posts.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="freeMemberLimit">
                    Free Plan Member Limit
                  </Label>
                  <Input
                    id="freeMemberLimit"
                    type="number"
                    {...register("freeMemberLimit", {
                      valueAsNumber: true,
                      min: -1,
                    })}
                  />
                  <p className="text-xs text-gray-500 dark:text-zinc-400">
                    Set to -1 for unlimited members.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-5 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-zinc-800 flex justify-end">
              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={!isDirty}
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default SettingsPage;
