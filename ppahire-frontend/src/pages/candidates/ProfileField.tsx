import type { LucideIcon } from 'lucide-react';
import React from 'react';

interface ProfileFieldProps {
  icon: LucideIcon;
  label: string;
  value?: string | number | null;
  children?: React.ReactNode;
}

const ProfileField: React.FC<ProfileFieldProps> = ({ icon: Icon, label, value, children }) => {
  const displayValue = value || <span className="text-gray-400">Not provided</span>;

  return (
    <div className="flex items-start">
      <Icon className="h-5 w-5 flex-shrink-0 text-gray-400 mt-0.5" />
      <div className="ml-3">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <div className="mt-1 text-sm text-gray-800">
          {children || displayValue}
        </div>
      </div>
    </div>
  );
};

export default ProfileField;