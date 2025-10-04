import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  Download,
  Filter,
  Undo,
  Redo,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

type PipelineToolbarProps = {
  jobTitle: string;
  applicationCount: number;
  onExport: () => void;
  onFilter: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

export const PipelineToolbar = ({
  jobTitle,
  applicationCount,
  onExport,
  onFilter,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: PipelineToolbarProps) => {
  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
          {jobTitle}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-zinc-300">
          Drag and drop to manage your applicant pipeline.
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          onClick={onExport}
          disabled={applicationCount === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button variant="outline" onClick={onFilter}>
          <Filter className="h-4 w-4 mr-2" /> Filters
        </Button>
        {canUndo && (
          <Button variant="ghost" size="icon" onClick={onUndo}>
            <Undo className="h-4 w-4" />
          </Button>
        )}
        {canRedo && (
          <Button variant="ghost" size="icon" onClick={onRedo}>
            <Redo className="h-4 w-4" />
          </Button>
        )}
        <Link
          to={`/dashboard/agency/jobs`}
          className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-zinc-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1.5" />
          Back to All Jobs
        </Link>
      </div>
    </div>
  );
};