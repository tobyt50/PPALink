import type { LucideIcon } from 'lucide-react';
import React from 'react';

interface ProfileFieldProps {
  icon: LucideIcon;
  label: string;
  value?: string | number | null;
  children?: React.ReactNode;
}

const ProfileField: React.FC<ProfileFieldProps> = ({ icon: Icon, label, value, children }) => {
  const displayValue = value || <span className="text-gray-400 italic">Not provided</span>;

  return (
    // Uses a flex-col layout for better structure
    <div className="flex flex-col">
      {/* dt holds the icon and label on one line */}
      <dt className="flex items-center text-sm font-medium text-gray-500">
        <Icon className="h-5 w-5 flex-shrink-0 text-gray-400 mr-2" />
        <span>{label}</span>
      </dt>
      {/* dd holds the value, indented to align with the label */}
      <dd className="mt-1.5 text-sm font-medium text-gray-900 ml-7">
        {children || displayValue}
      </dd>
    </div>
  );
};

export default ProfileField;