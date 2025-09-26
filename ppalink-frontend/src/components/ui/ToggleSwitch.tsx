import { Switch } from '@headlessui/react';

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  srLabel: string; // Screen reader label
}

export const ToggleSwitch = ({ enabled, onChange, srLabel }: ToggleSwitchProps) => {
  return (
    <Switch
      checked={enabled}
      onChange={onChange}
      className={`${
        enabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-zinc-800'
      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
    >
      <span className="sr-only">{srLabel}</span>
      <span
        aria-hidden="true"
        className={`${
          enabled ? 'translate-x-5' : 'translate-x-0'
        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-zinc-900 shadow ring-0 dark:ring-1 dark:ring-white/10 transition duration-200 ease-in-out`}
      />
    </Switch>
  );
};
