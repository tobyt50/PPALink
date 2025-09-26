import { ChevronDown, Download, Loader2, RotateCcw, Search } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

import { Button } from '../../components/ui/Button';
import { DropdownTrigger } from '../../components/ui/DropdownTrigger';
import { Pagination } from '../../components/ui/Pagination';
import { SimpleDropdown, SimpleDropdownItem } from '../../components/ui/SimpleDropdown';
import { Input } from '../../components/forms/Input';

import adminService from '../../services/admin.service';
import useFetch from '../../hooks/useFetch';

import type { AuditLog, PaginatedResponse, User } from '../../types/user';
import { exportAuditLogsToCSV } from '../../utils/csv';

/* -----------------------------------------------------------
   Helpers
----------------------------------------------------------- */

const formatLogMessage = (log: AuditLog): string => {
  switch (log.action) {
    case 'user.status.update':
      return `Set status of user ${log.metadata?.targetUserEmail} to ${log.metadata?.newStatus}`;
    case 'plan.create':
      return `Created plan: ${log.metadata?.planName}`;
    case 'plan.update':
      return `Updated plan: ${log.metadata?.planName}`;
    case 'plan.delete':
      return `Deleted plan: ${log.metadata?.planName}`;
    case 'admin.user_impersonate':
      return `Impersonated: ${log.metadata?.targetUserEmail}`;
    case 'verification.status.update':
      return `Set ${log.metadata?.verificationType} verification for ${log.metadata?.targetUserEmail} to ${log.metadata?.newStatus}`;
    case 'user.message.send':
      return `Sent message to ${log.metadata?.recipientEmail}`;
    default:
      return log.action.replace('.', ' ');
  }
};

/* -----------------------------------------------------------
   Filter Bar
----------------------------------------------------------- */

const FilterBar = ({
  onApply,
  isLoading,
  onReset,
}: {
  onApply: (filters: any) => void;
  isLoading: boolean;
  onReset: () => void;
}) => {
  const { data: users } = useFetch<User[]>('/admin/users');
  const { register, handleSubmit, control, watch, reset } = useForm();

  const admins = useMemo(() => users?.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN') || [], [users]);

  const watchedActorId = watch('actorId');
  const watchedAction = watch('action');
  const watchedSortOrder = watch('sortOrder');

  const selectedAdminEmail =
    admins.find(a => a.id === watchedActorId)?.email || 'All Admins';

  const auditActions = [
    'user.status.update',
    'plan.create',
    'plan.update',
    'plan.delete',
    'admin.user_impersonate',
    'verification.status.update',
    'user.message.send',
  ];

  const selectedActionText = watchedAction || 'All Actions';
  const selectedSortText = watchedSortOrder === 'asc' ? 'Oldest First' : 'Newest First';

  const handleReset = () => {
    reset({ actorId: '', action: '', targetId: '', sortOrder: 'desc' });
    onReset();
  };

  return (
    <form
      onSubmit={handleSubmit(onApply)}
      className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 p-5"
    >
      <div className="flex flex-col sm:flex-row items-end gap-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-grow">
          {/* Admin filter */}
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-zinc-300 block mb-1.5">
              Filter by Admin
            </label>
            <Controller
              name="actorId"
              control={control}
              render={({ field: { onChange } }) => (
                <SimpleDropdown
                  trigger={
                    <DropdownTrigger>
                      <span className="truncate">{selectedAdminEmail}</span>
                      <ChevronDown className="h-4 w-4 text-gray-500 dark:text-zinc-400" />
                    </DropdownTrigger>
                  }
                >
                  <SimpleDropdownItem onSelect={() => onChange('')}>
                    All Admins
                  </SimpleDropdownItem>
                  {admins.map(a => (
                    <SimpleDropdownItem key={a.id} onSelect={() => onChange(a.id)}>
                      {a.email}
                    </SimpleDropdownItem>
                  ))}
                </SimpleDropdown>
              )}
            />
          </div>

          {/* Action filter */}
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-zinc-300 block mb-1.5">
              Filter by Action
            </label>
            <Controller
              name="action"
              control={control}
              render={({ field: { onChange } }) => (
                <SimpleDropdown
                  trigger={
                    <DropdownTrigger>
                      <span className="truncate">{selectedActionText}</span>
                      <ChevronDown className="h-4 w-4 text-gray-500 dark:text-zinc-400" />
                    </DropdownTrigger>
                  }
                >
                  <SimpleDropdownItem onSelect={() => onChange('')}>
                    All Actions
                  </SimpleDropdownItem>
                  {auditActions.map(action => (
                    <SimpleDropdownItem key={action} onSelect={() => onChange(action)}>
                      {action}
                    </SimpleDropdownItem>
                  ))}
                </SimpleDropdown>
              )}
            />
          </div>

          {/* Target ID filter */}
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-zinc-300 block mb-1.5">
              Filter by Target ID
            </label>
            <Input
              type="text"
              placeholder="UUID..."
              {...register('targetId')}
            />
          </div>

          {/* Sort by Date */}
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-zinc-300 block mb-1.5">
              Sort by Date
            </label>
            <Controller
              name="sortOrder"
              control={control}
              defaultValue="desc"
              render={({ field: { onChange } }) => (
                <SimpleDropdown
                  trigger={
                    <DropdownTrigger>
                      <span className="truncate">{selectedSortText}</span>
                      <ChevronDown className="h-4 w-4 text-gray-500 dark:text-zinc-400" />
                    </DropdownTrigger>
                  }
                >
                  <SimpleDropdownItem onSelect={() => onChange('desc')}>
                    Newest First
                  </SimpleDropdownItem>
                  <SimpleDropdownItem onSelect={() => onChange('asc')}>
                    Oldest First
                  </SimpleDropdownItem>
                </SimpleDropdown>
              )}
            />
          </div>
        </div>

        <div className="flex w-full sm:w-auto sm:space-x-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleReset}
            className="w-1/2 sm:w-auto"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
            className="w-1/2 sm:w-auto"
          >
            <Search className="mr-2 h-4 w-4" />
            Apply
          </Button>
        </div>
      </div>
    </form>
  );
};

/* -----------------------------------------------------------
   Main Page
----------------------------------------------------------- */

const AuditLogsPage = () => {
  const [response, setResponse] = useState<PaginatedResponse<AuditLog> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [queryParams, setQueryParams] = useState(
    () => new URLSearchParams({ page: '1', limit: '20', sortOrder: 'desc' })
  );

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await adminService.getAuditLogs(queryParams);
        setResponse(data);
      } catch {
        setError('Could not load audit logs.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, [queryParams]);

  const logs = response?.data;
  const meta = response?.meta;

  const handleFilter = (filters: any) => {
    const newParams = new URLSearchParams({ page: '1', limit: '20' });
    Object.entries(filters).forEach(([key, value]) => {
      if (value) newParams.set(key, String(value));
    });
    setQueryParams(newParams);
  };

  const handleResetFilters = () => {
    setQueryParams(new URLSearchParams({ page: '1', limit: '20', sortOrder: 'desc' }));
  };

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(queryParams);
    newParams.set('page', String(page));
    setQueryParams(newParams);
  };

  const handleExport = async () => {
    toast.loading('Preparing your full log export...');
    try {
      const allLogs = await adminService.getFullAuditLogExport();
      exportAuditLogsToCSV(allLogs);
      toast.dismiss();
      toast.success('Export started successfully!');
    } catch {
      toast.dismiss();
      toast.error('Failed to export logs.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-400 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
            Audit Logs
          </h1>
          <p className="mt-2 text-gray-600 dark:text-zinc-300">
            A chronological record of all administrative actions on the platform.
          </p>
        </div>
        <Button
          onClick={handleExport}
          disabled={isLoading || !logs || logs.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          Export Full Log
        </Button>
      </div>

      <FilterBar
        onApply={handleFilter}
        isLoading={isLoading}
        onReset={handleResetFilters}
      />

      <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50 dark:bg-gray-920">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                  Target
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white dark:bg-zinc-900">
              {isLoading && (
                <tr>
                  <td colSpan={4} className="p-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary-600 dark:text-primary-400" />
                  </td>
                </tr>
              )}

              {error && (
                <tr>
                  <td colSpan={4}>
                    <div className="m-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/60 p-8 text-center text-red-800 shadow-sm dark:shadow-none dark:ring-1 dark:ring-white/10">
                        {error}
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && !error && logs?.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-gray-500 dark:text-zinc-400">
                    No audit logs found for the selected filters.
                  </td>
                </tr>
              )}

              {!isLoading &&
                !error &&
                logs?.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/70 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-zinc-50">
                      {log.actor.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-zinc-200">
                      {formatLogMessage(log)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-zinc-400 font-mono">
                      <Link
                        to={`/admin/audit-logs/${log.id}`}
                        className="hover:underline text-primary-600 dark:text-primary-400"
                      >
                        {log.targetId || 'N/A'}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-zinc-400">
                      {format(new Date(log.createdAt), 'MMM d, yyyy, h:mm a')}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {meta && meta.totalPages > 1 && (
          <div className="p-5 border-t border-gray-100 dark:border-zinc-800">
            <Pagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogsPage;

