import {
  ChevronDown,
  Download,
  Loader2,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

import { Button } from "../../components/ui/Button";
import { DropdownTrigger } from "../../components/ui/DropdownTrigger";
import { Pagination } from "../../components/ui/Pagination";
import { SimpleDropdown, SimpleDropdownItem } from "../../components/ui/SimpleDropdown";
import { Input } from "../../components/forms/Input";

import adminService from "../../services/admin.service";
import useFetch from "../../hooks/useFetch";
import { useDebounce } from "../../hooks/useDebounce";

import type { AuditLog, PaginatedResponse, User } from "../../types/user";
import { exportAuditLogsToCSV } from "../../utils/csv";

/* -----------------------------------------------------------
   Helpers
----------------------------------------------------------- */

const formatLogMessage = (log: AuditLog): string => {
  switch (log.action) {
    case "user.status.update":
      return `Set status of user ${log.metadata?.targetUserEmail} to ${log.metadata?.newStatus}`;
    case "plan.create":
      return `Created plan: ${log.metadata?.planName}`;
    case "plan.update":
      return `Updated plan: ${log.metadata?.planName}`;
    case "plan.delete":
      return `Deleted plan: ${log.metadata?.planName}`;
    case "admin.user_impersonate":
      return `Impersonated: ${log.metadata?.targetUserEmail}`;
    case "verification.status.update":
      return `Set ${log.metadata?.verificationType} verification for ${log.metadata?.targetUserEmail} to ${log.metadata?.newStatus}`;
    case "user.message.send":
      return `Sent message to ${log.metadata?.recipientEmail}`;
    default:
      return log.action.replace(".", " ");
  }
};

type AuditFilterValues = {
  actorId: string | "";
  action: string | "";
  sortOrder: "asc" | "desc";
};

const AuditFilterSidebar = ({
  onFilterChange,
  currentFilters,
  admins,
  auditActions,
  onReset,
}: {
  onFilterChange: (filters: AuditFilterValues) => void;
  currentFilters: AuditFilterValues;
  admins: User[];
  auditActions: string[];
  onReset: () => void;
}) => {
  const [localFilters, setLocalFilters] = useState(currentFilters);

  useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters]);

  const handleAdminChange = (actorId: string) => {
    setLocalFilters({ ...localFilters, actorId: actorId || "" });
  };

  const handleActionChange = (action: string) => {
    setLocalFilters({ ...localFilters, action: action || "" });
  };

  const handleSortChange = (sortOrder: "asc" | "desc") => {
    setLocalFilters({ ...localFilters, sortOrder });
  };

  const handleApply = () => {
    onFilterChange(localFilters);
  };

  const handleClear = () => {
    const clearedFilters: AuditFilterValues = {
      actorId: "",
      action: "",
      sortOrder: "desc",
    };
    setLocalFilters(clearedFilters);
    onReset();
  };

  const selectedAdminEmail =
    admins.find((a) => a.id === localFilters.actorId)?.email || "All Admins";
  const selectedActionText = localFilters.action || "All Actions";
  const selectedSortText =
    localFilters.sortOrder === "asc" ? "Oldest First" : "Newest First";

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-50 mb-2">
          Admin
        </h3>
        <SimpleDropdown
          trigger={
            <DropdownTrigger>
              <span className="truncate">{selectedAdminEmail}</span>
              <ChevronDown className="h-4 w-4 text-gray-500 dark:text-zinc-400" />
            </DropdownTrigger>
          }
        >
          <SimpleDropdownItem onSelect={() => handleAdminChange("")}>
            All Admins
          </SimpleDropdownItem>
          {admins.map((a) => (
            <SimpleDropdownItem
              key={a.id}
              onSelect={() => handleAdminChange(a.id)}
            >
              {a.email}
            </SimpleDropdownItem>
          ))}
        </SimpleDropdown>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-50 mb-2">
          Action
        </h3>
        <SimpleDropdown
          trigger={
            <DropdownTrigger>
              <span className="truncate">{selectedActionText}</span>
              <ChevronDown className="h-4 w-4 text-gray-500 dark:text-zinc-400" />
            </DropdownTrigger>
          }
        >
          <SimpleDropdownItem onSelect={() => handleActionChange("")}>
            All Actions
          </SimpleDropdownItem>
          {auditActions.map((action) => (
            <SimpleDropdownItem
              key={action}
              onSelect={() => handleActionChange(action)}
            >
              {action}
            </SimpleDropdownItem>
          ))}
        </SimpleDropdown>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-50 mb-2">
          Sort by Date
        </h3>
        <SimpleDropdown
          trigger={
            <DropdownTrigger>
              <span className="truncate">{selectedSortText}</span>
              <ChevronDown className="h-4 w-4 text-gray-500 dark:text-zinc-400" />
            </DropdownTrigger>
          }
        >
          <SimpleDropdownItem onSelect={() => handleSortChange("desc")}>
            Newest First
          </SimpleDropdownItem>
          <SimpleDropdownItem onSelect={() => handleSortChange("asc")}>
            Oldest First
          </SimpleDropdownItem>
        </SimpleDropdown>
      </div>
      <div className="pt-4 border-t border-gray-200 dark:border-zinc-700 space-y-3">
        <Button
          onClick={handleApply}
          className="w-full"
          variant="primary"
          size="sm"
        >
          Apply Filters
        </Button>
        <Button
          onClick={handleClear}
          className="w-full"
          variant="outline"
          size="sm"
        >
          Clear All
        </Button>
      </div>
    </div>
  );
};

/* -----------------------------------------------------------
   Main Page
----------------------------------------------------------- */

const AuditLogsPage = () => {
  const [response, setResponse] = useState<PaginatedResponse<AuditLog> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<AuditFilterValues>({
    actorId: "",
    action: "",
    sortOrder: "desc",
  });
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const debouncedFilters = useDebounce(filters, 500);

  const { data: users } = useFetch<User[]>("/admin/users");
  const admins = useMemo(
    () => users?.filter((u) => u.role === "ADMIN" || u.role === "SUPER_ADMIN") || [],
    [users]
  );

  const auditActions = [
    "user.status.update",
    "plan.create",
    "plan.update",
    "plan.delete",
    "admin.user_impersonate",
    "verification.status.update",
    "user.message.send",
  ];

  const queryParams = useMemo(() => {
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: "20",
    });
    if (debouncedSearchQuery?.trim()) {
      params.set("targetId", debouncedSearchQuery.trim());
    }
    if (debouncedFilters.actorId) {
      params.set("actorId", debouncedFilters.actorId);
    }
    if (debouncedFilters.action) {
      params.set("action", debouncedFilters.action);
    }
    params.set("sortOrder", debouncedFilters.sortOrder);
    return params;
  }, [currentPage, debouncedSearchQuery, debouncedFilters]);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await adminService.getAuditLogs(queryParams);
        setResponse(data);
      } catch {
        setError("Could not load audit logs.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, [queryParams]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  const logs = response?.data;
  const meta = response?.meta;

  const handleFilterChange = (newFilters: AuditFilterValues) => {
    setFilters(newFilters);
    setCurrentPage(1);
    if (showFiltersModal) {
      setShowFiltersModal(false);
    }
  };

  const handleReset = () => {
    setFilters({
      actorId: "",
      action: "",
      sortOrder: "desc",
    });
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleExport = async () => {
    toast.loading("Preparing your full log export...");
    try {
      const allLogs = await adminService.getFullAuditLogExport();
      exportAuditLogsToCSV(allLogs);
      toast.dismiss();
      toast.success("Export started successfully!");
    } catch {
      toast.dismiss();
      toast.error("Failed to export logs.");
    }
  };

  // Horizontal scroll drag and wheel handling
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current || !scrollRef.current) return;
    const x = e.clientX;
    const walk = (x - startXRef.current) * 2; // Adjust sensitivity as needed
    scrollRef.current.scrollLeft = scrollLeftRef.current - walk;
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    document.body.style.cursor = "";
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const thElements = container.querySelectorAll("th");

    const handleMouseDown = (e: MouseEvent) => {
      const th = e.currentTarget as HTMLElement;
      th.style.cursor = "grabbing";
      document.body.style.cursor = "grabbing";
      isDraggingRef.current = true;
      startXRef.current = e.clientX;
      scrollLeftRef.current = container.scrollLeft;
      e.preventDefault();
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (container) {
        container.scrollLeft += e.deltaY;
      }
    };

    const handleMouseLeave = (_e: MouseEvent) => {
      if (isDraggingRef.current) {
        handleMouseUp();
      }
    };

    thElements.forEach((th) => {
      th.addEventListener("mousedown", handleMouseDown);
      th.addEventListener("wheel", handleWheel, { passive: false });
      th.addEventListener("mouseleave", handleMouseLeave);
    });

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      thElements.forEach((th) => {
        th.removeEventListener("mousedown", handleMouseDown);
        th.removeEventListener("wheel", handleWheel);
        th.removeEventListener("mouseleave", handleMouseLeave);
      });
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp, logs]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
          Audit Logs
        </h1>
        <Button
          size="sm"
          onClick={handleExport}
          disabled={isLoading || !logs || logs.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Sidebar */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-2 max-h-[calc(100vh-5rem)] overflow-auto rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 p-5">
            <h2 className="text-md font-semibold text-gray-900 dark:text-zinc-50 border-b border-gray-100 dark:border-zinc-800 pb-3 mb-4 flex items-center">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </h2>
            <AuditFilterSidebar
              onFilterChange={handleFilterChange}
              currentFilters={filters}
              admins={admins}
              auditActions={auditActions}
              onReset={handleReset}
            />
          </div>
        </aside>

        {/* Main */}
        <main className="lg:col-span-3">
          <div className="pb-5">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search by Target ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={Search}
                className="lg:pr-3 pr-10"
              />
              <button
                type="button"
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-transparent border-none p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 lg:hidden"
                onClick={() => setShowFiltersModal(true)}
              >
                <SlidersHorizontal className="h-4 w-6 text-gray-500" />
              </button>
            </div>
          </div>

          {isLoading && (
            <div className="flex h-80 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" />
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/60 p-8 text-center text-red-800 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10">
              {error}
            </div>
          )}

          {!isLoading && !error && logs && (
            <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 dark:border-zinc-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
                  Audit Logs ({logs.length})
                </h2>
              </div>

              <div className="hidden md:block">
                <div className="overflow-x-auto" ref={scrollRef}>
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50 dark:bg-gray-920">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400 select-none cursor-grab">
                          Admin
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400 select-none cursor-grab">
                          Action
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400 select-none cursor-grab">
                          Target
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400 select-none cursor-grab">
                          Timestamp
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white dark:bg-zinc-900">
                      {logs.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="p-12 text-center text-gray-500 dark:text-zinc-400"
                          >
                            No audit logs found for the selected filters.
                          </td>
                        </tr>
                      ) : (
                        logs.map((log) => (
                          <tr
                            key={log.id}
                            className="hover:bg-gray-50 dark:hover:bg-zinc-800/70 transition-colors"
                          >
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
                                {log.targetId || "N/A"}
                              </Link>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-zinc-400">
                              {format(new Date(log.createdAt), "MMM d, yyyy, h:mm a")}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="md:hidden">
                {logs.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 dark:text-zinc-400">
                    No audit logs found for the selected filters.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {logs.map((log) => {
                      const timestamp = format(
                        new Date(log.createdAt),
                        "MMM d, yyyy, h:mm a"
                      );
                      return (
                        <div
                          key={log.id}
                          className="p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/70 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium text-gray-900 dark:text-zinc-50 text-base">
                                  {log.actor.email}
                                </h3>
                              </div>
                              <p className="text-sm text-gray-700 dark:text-zinc-200 mb-2">
                                {formatLogMessage(log)}
                              </p>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm text-gray-500 dark:text-zinc-400 font-mono">
                                  Target:
                                </span>
                                <Link
                                  to={`/admin/audit-logs/${log.id}`}
                                  className="hover:underline text-primary-600 dark:text-primary-400 text-sm"
                                >
                                  {log.targetId || "N/A"}
                                </Link>
                              </div>
                              <p className="text-sm text-gray-500 dark:text-zinc-400">
                                {timestamp}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
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
          )}
        </main>
      </div>

      {showFiltersModal && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed top-0 md:top-14 bottom-14 left-0 right-0 bg-black/50"
            onClick={() => setShowFiltersModal(false)}
          />
          <div className="fixed top-0 md:top-14 bottom-14 right-0 w-full max-w-md bg-white dark:bg-zinc-900 shadow-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-zinc-800 flex-shrink-0">
              <h2 className="flex items-center text-md font-semibold text-gray-900 dark:text-zinc-50">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
              </h2>
              <button
                type="button"
                className="bg-transparent border-none p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800"
                onClick={() => setShowFiltersModal(false)}
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1">
              <AuditFilterSidebar
                onFilterChange={handleFilterChange}
                currentFilters={filters}
                admins={admins}
                auditActions={auditActions}
                onReset={handleReset}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogsPage;