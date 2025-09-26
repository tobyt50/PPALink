import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    text: string;
    to: string;
  };
}

export const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => {
  return (
    <div className="text-center rounded-lg border-2 border-dashed border-gray-300 dark:border-zinc-800 p-12">
      <Icon className="mx-auto h-12 w-12 text-gray-400 dark:text-zinc-500" />
      <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-zinc-50">{title}</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">{description}</p>
      {action && (
        <div className="mt-6">
          <Link to={action.to}>
            <Button>{action.text}</Button>
          </Link>
        </div>
      )}
    </div>
  );
};
