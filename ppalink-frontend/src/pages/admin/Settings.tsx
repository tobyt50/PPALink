import { Loader2, Save } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/forms/Input';
import { Label } from '../../components/ui/Label';
import { ToggleSwitch } from '../../components/ui/ToggleSwitch';
import useFetch from '../../hooks/useFetch';
import adminService, { type FeatureFlag, type PlatformSetting } from '../../services/admin.service';

interface SettingsFormValues {
    maintenanceMode: boolean;
    freeJobPostLimit: number;
    freeMemberLimit: number;
}

const SettingsPage = () => {
  const { data: settings, isLoading: isLoadingSettings, refetch: refetchSettings } = useFetch<PlatformSetting[]>('/admin/settings');
  const { data: flags, isLoading: isLoadingFlags, refetch: refetchFlags } = useFetch<FeatureFlag[]>('/admin/feature-flags');

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
      loading: 'Updating flag...',
      success: 'Feature flag updated successfully!',
      error: 'Failed to update feature flag.',
    });
    refetchFlags();
  };
  
  const onSaveSettings = async (data: SettingsFormValues) => {
    const settingsToUpdate = Object.entries(data).map(([key, value]) => ({ key, value }));
    
    const savePromise = adminService.updateSettings(settingsToUpdate);
    await toast.promise(savePromise, {
        loading: 'Saving settings...',
        success: () => {
            refetchSettings();
            reset(data); // Resets form's dirty state with the new values
            return 'Platform settings updated successfully!';
        },
        error: 'Failed to save settings.'
    });
  };

  if (isLoading) { return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" /></div>; }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
          Platform Settings
        </h1>
        <p className="mt-2 text-gray-600 dark:text-zinc-300">Manage global settings and experimental features.</p>
      </div>

      <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-zinc-800"><h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">Feature Flags</h2></div>
        <ul className="divide-y divide-gray-100">
          {flags?.map((flag) => (
            <li key={flag.name} className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800 dark:text-zinc-100">{flag.name}</p>
                <p className="text-sm text-gray-500 dark:text-zinc-400">{flag.description}</p>
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
          <div className="p-5 border-b border-gray-100 dark:border-zinc-800"><h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">General Settings</h2></div>
          <div className="divide-y divide-gray-100">
            <Controller
              name="maintenanceMode"
              control={control}
              render={({ field }) => (
                <div className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-zinc-100">Maintenance Mode</p>
                    <p className="text-sm text-gray-500 dark:text-zinc-400">Temporarily disable public access to the site.</p>
                  </div>
                  <ToggleSwitch enabled={field.value} onChange={field.onChange} srLabel="Toggle Maintenance Mode" />
                </div>
              )}
            />
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Label htmlFor="freeJobPostLimit">Free Plan Job Limit</Label>
                <Input id="freeJobPostLimit" type="number" {...register('freeJobPostLimit', { valueAsNumber: true, min: -1 })} />
                <p className="text-xs text-gray-500 dark:text-zinc-400">Set to -1 for unlimited posts.</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="freeMemberLimit">Free Plan Member Limit</Label>
                <Input id="freeMemberLimit" type="number" {...register('freeMemberLimit', { valueAsNumber: true, min: -1 })} />
                 <p className="text-xs text-gray-500 dark:text-zinc-400">Set to -1 for unlimited members.</p>
              </div>
            </div>
          </div>
          <div className="p-5 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-zinc-800 flex justify-end">
            <Button type="submit" isLoading={isSubmitting} disabled={!isDirty}>
                <Save className="mr-2 h-4 w-4"/>
                Save Changes
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;

