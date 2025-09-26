import { ChevronLeft, Download, Loader2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { format } from 'date-fns';

import useFetch from '../../hooks/useFetch';
import type { AuditLog } from '../../types/user';
import { exportAuditLogsToCSV } from '../../utils/csv';
import { Button } from '../../components/ui/Button';

/* ---------------------- Shared UI Components ---------------------- */
const DetailField = ({
  label,
  value,
  children,
}: {
  label: string;
  value?: React.ReactNode;
  children?: React.ReactNode;
}) => (
  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
    <dt className="text-sm font-medium text-gray-500 dark:text-zinc-400">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900 dark:text-zinc-50 sm:mt-0 sm:col-span-2 font-mono break-all">
      {value || children}
    </dd>
  </div>
);

/* ---------------------- Action Details Formatter ---------------------- */
const ActionDetails = ({ log }: { log: AuditLog }) => {
  const { action, metadata } = log;
  if (!metadata)
    return (
      <p className="text-sm text-gray-500 dark:text-zinc-400">
        No additional details were recorded for this action.
      </p>
    );

  switch (action) {
    case 'plan.update': {
      const before = (metadata.before as any) || {};
      const after = (metadata.after as any) || {};
      const changes = Object.keys(after).map((key) => ({
        key,
        before: before[key],
        after: after[key],
      }));

      return (
        <div className="space-y-2 text-sm text-gray-600 dark:text-zinc-300">
          <p>
            Updated the <strong>{metadata.planName}</strong> plan:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            {changes.map((c) => (
              <li key={c.key}>
                Changed <strong>{c.key}</strong> from "<span className="font-semibold text-red-600 dark:text-red-400">{String(c.before)}</span>" to "
                <span className="font-semibold text-green-600 dark:text-green-400">{String(c.after)}</span>"
              </li>
            ))}
          </ul>
        </div>
      );
    }

    case 'user.status.update':
      return (
        <p className="text-sm text-gray-600 dark:text-zinc-300">
          Changed user <strong>{metadata.targetUserEmail}'s</strong> status from{' '}
          <strong className="font-mono bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 px-1.5 py-0.5 rounded-md text-xs">
            {metadata.previousStatus}
          </strong>{' '}
          to{' '}
          <strong className="font-mono bg-green-50 dark:bg-green-950/60 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded-md text-xs">
            {metadata.newStatus}
          </strong>
          .
        </p>
      );

    case 'verification.status.update':
      return (
        <p className="text-sm text-gray-600 dark:text-zinc-300">
          Set <strong>{metadata.verificationType}</strong> verification for user{' '}
          <strong>{metadata.targetUserEmail}</strong> from{' '}
          <strong className="font-mono bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 px-1.5 py-0.5 rounded-md text-xs">
            {metadata.previousStatus}
          </strong>{' '}
          to{' '}
          <strong className="font-mono bg-green-50 dark:bg-green-950/60 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded-md text-xs">
            {metadata.newStatus}
          </strong>
          .
        </p>
      );

    case 'admin.user_impersonate':
      return (
        <p className="text-sm text-gray-600 dark:text-zinc-300">
          Initiated an impersonation session for user{' '}
          <strong className="text-primary-600 dark:text-primary-400">{metadata.targetUserEmail}</strong>.
        </p>
      );

    case 'plan.create':
      return (
        <div className="space-y-2 text-sm text-gray-600 dark:text-zinc-300">
          <p>
            Created the{' '}
            <strong>{(metadata.createdPlan as any)?.name}</strong> plan with the
            following initial values:
          </p>
          <pre className="bg-gray-50 dark:bg-gray-920 p-4 rounded-xl text-xs overflow-x-auto ring-1 ring-gray-100 dark:ring-white/10">
            {JSON.stringify(metadata.createdPlan, null, 2)}
          </pre>
        </div>
      );

    case 'plan.delete':
      return (
        <p className="text-sm text-gray-600 dark:text-zinc-300">
          Deleted the <strong>{(metadata.deletedPlan as any)?.name}</strong>{' '}
          plan.
        </p>
      );

    case 'user.message.send':
      return (
        <p className="text-sm text-gray-600 dark:text-zinc-300">
          Sent a system message to <strong>{metadata.recipientEmail}</strong>{' '}
          with excerpt: "<em>{metadata.messageExcerpt}</em>"
        </p>
      );

    default:
      return (
        <pre className="bg-gray-50 dark:bg-gray-920 p-4 rounded-xl text-xs overflow-x-auto ring-1 ring-gray-100 dark:ring-white/10">
          {JSON.stringify(log.metadata, null, 2)}
        </pre>
      );
  }
};

/* ---------------------- Page Component ---------------------- */
const AuditLogDetailsPage = () => {
  const { logId } = useParams<{ logId: string }>();
  const { data: log, isLoading, error } = useFetch<AuditLog>(
    logId ? `/admin/audit-logs/${logId}` : null
  );

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" />
      </div>
    );
  }

  if (error || !log) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/60 p-8 text-center text-red-800 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10">
        Error loading audit log details.
      </div>
    );
  }

  const handleExport = () => {
    exportAuditLogsToCSV([log]);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link
            to="/admin/audit-logs"
            className="flex items-center text-sm font-semibold text-gray-500 dark:text-zinc-400 hover:text-primary-600 dark:hover:text-primary-400 transition"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Audit Logs
          </Link>
          <h1 className="mt-4 text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-400 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
            Audit Log Details
          </h1>
          <p className="mt-2 text-gray-600 dark:text-zinc-300">
            A detailed view of a specific administrative action.
          </p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export to CSV
        </Button>
      </div>

      <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
        <div className="p-6">
          <dl className="divide-y divide-gray-100">
            <DetailField label="Log ID" value={log.id} />
            <DetailField label="Admin Actor" value={log.actor.email} />
            <DetailField label="Action" value={log.action} />
            <DetailField label="Target ID" value={log.targetId || 'N/A'} />
            <DetailField
              label="Timestamp"
              value={format(new Date(log.createdAt), 'MMM d, yyyy, h:mm:ss a')}
            />
          </dl>
        </div>

        {log.metadata && (
          <div className="border-t border-gray-100 dark:border-zinc-800">
            <div className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-zinc-50">
                Action Details & Metadata
              </h3>
              <ActionDetails log={log} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogDetailsPage;

