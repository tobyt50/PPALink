import {
  Edit,
  Eye,
  EyeOff,
  Loader2,
  Search,
  ChevronDown,
  MoreHorizontal,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { toast } from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ConfirmationModal } from "../../components/ui/Modal";
import { useDebounce } from "../../hooks/useDebounce";
import adminService from "../../services/admin.service";
import useFetch from "../../hooks/useFetch";
import type { Position } from "../../types/job";
import { useDataStore } from "../../context/DataStore";
import {
  SimpleDropdown,
  SimpleDropdownItem,
} from "../../components/ui/SimpleDropdown";
import { DropdownTrigger } from "../../components/ui/DropdownTrigger";
import { Input } from "../../components/forms/Input";
import { Button } from "../../components/ui/Button";

const JobStatusIcon = ({ status }: { status: Position["status"] }) => {
  const statusStyles: Record<Position["status"], string> = {
    OPEN: "text-green-600 dark:text-green-400",
    CLOSED: "text-gray-600 dark:text-gray-400",
    DRAFT: "text-yellow-600 dark:text-yellow-400",
  };
  const statusIcons: Record<Position["status"], React.ReactNode> = {
    OPEN: <Eye className="h-4 w-4" />,
    CLOSED: <EyeOff className="h-4 w-4" />,
    DRAFT: <Edit className="h-4 w-4" />,
  };
  return (
    <span className={`inline-flex items-center ${statusStyles[status]}`}>
      {statusIcons[status]}
    </span>
  );
};

type JobFilterValues = {
  status: Position["status"] | "ALL";
  visibility: Position["visibility"] | "ALL";
  industryId: string | "ALL";
};

const JobsFilterSidebar = ({
  onFilterChange,
  currentFilters,
  industries,
}: {
  onFilterChange: (filters: JobFilterValues) => void;
  currentFilters: JobFilterValues;
  industries: any[]; // Adjust type based on your Industry type
}) => {
  const [localFilters, setLocalFilters] = useState(currentFilters);
  const statusOptions: { [key: string]: string } = {
    ALL: "All Statuses",
    OPEN: "Open",
    CLOSED: "Closed",
    DRAFT: "Draft",
  };
  const visibilityOptions: { [key: string]: string } = {
    ALL: "All Visibilities",
    PUBLIC: "Public",
    PRIVATE: "Private",
  };
  const selectedIndustryName =
    industries.find((i) => String(i.id) === localFilters.industryId)?.name ||
    "All Industries";

  useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters]);

  const handleStatusChange = (status: Position["status"] | "ALL") => {
    setLocalFilters({ ...localFilters, status });
  };

  const handleVisibilityChange = (visibility: Position["visibility"] | "ALL") => {
    setLocalFilters({ ...localFilters, visibility });
  };

  const handleIndustryChange = (industryId: number | null) => {
    const industryIdStr = industryId === null ? "ALL" : String(industryId);
    setLocalFilters({ ...localFilters, industryId: industryIdStr });
  };

  const handleApply = () => {
    onFilterChange(localFilters);
  };

  const handleClear = () => {
    const clearedFilters = {
      status: "ALL" as const,
      visibility: "ALL" as const,
      industryId: "ALL" as const,
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-50 mb-2">
          Industry
        </h3>
        <SimpleDropdown
          isIndustryDropdown
          industries={industries}
          onSelectIndustry={handleIndustryChange}
          trigger={
            <DropdownTrigger>
              {selectedIndustryName}
              <ChevronDown className="h-4 w-4 text-gray-500 dark:text-zinc-400" />
            </DropdownTrigger>
          }
        />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-50 mb-2">
          Status
        </h3>
        <SimpleDropdown
          trigger={
            <DropdownTrigger>
              {statusOptions[localFilters.status]}
              <ChevronDown className="h-4 w-4 text-gray-500 dark:text-zinc-400" />
            </DropdownTrigger>
          }
        >
          {Object.entries(statusOptions).map(([key, value]) => (
            <SimpleDropdownItem
              key={key}
              onSelect={() => handleStatusChange(key as Position["status"] | "ALL")}
            >
              {value}
            </SimpleDropdownItem>
          ))}
        </SimpleDropdown>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-50 mb-2">
          Visibility
        </h3>
        <SimpleDropdown
          trigger={
            <DropdownTrigger>
              {visibilityOptions[localFilters.visibility]}
              <ChevronDown className="h-4 w-4 text-gray-500 dark:text-zinc-400" />
            </DropdownTrigger>
          }
        >
          {Object.entries(visibilityOptions).map(([key, value]) => (
            <SimpleDropdownItem
              key={key}
              onSelect={() => handleVisibilityChange(key as Position["visibility"] | "ALL")}
            >
              {value}
            </SimpleDropdownItem>
          ))}
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

const ManageJobsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { industries } = useDataStore();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [filters, setFilters] = useState<JobFilterValues>({
    status: (searchParams.get("status") as Position["status"]) || "ALL",
    visibility: (searchParams.get("visibility") as Position["visibility"]) || "ALL",
    industryId: searchParams.get("industryId") || "ALL",
  });
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  const debouncedQuery = useDebounce(query, 500);
  const debouncedFilters = useDebounce(filters, 500);

  const fetchUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (debouncedFilters.status !== "ALL") params.set("status", debouncedFilters.status);
    if (debouncedFilters.visibility !== "ALL") params.set("visibility", debouncedFilters.visibility);
    if (debouncedFilters.industryId !== "ALL") params.set("industryId", debouncedFilters.industryId);
    return `/admin/jobs?${params.toString()}`;
  }, [debouncedQuery, debouncedFilters]);

  const {
    data: jobs,
    isLoading,
    error,
    refetch,
  } = useFetch<Position[]>(fetchUrl);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (filters.status !== "ALL") params.set("status", filters.status);
    if (filters.visibility !== "ALL") params.set("visibility", filters.visibility);
    if (filters.industryId !== "ALL") params.set("industryId", filters.industryId);
    setSearchParams(params, { replace: true });
  }, [query, filters, setSearchParams]);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    job: Position | null;
    action: "unpublish" | "republish" | null;
  }>({ isOpen: false, job: null, action: null });

  const openModal = (job: Position, action: "unpublish" | "republish") =>
    setModalState({ isOpen: true, job, action });
  const closeModal = () =>
    setModalState({ isOpen: false, job: null, action: null });

  const handleVisibilityToggle = async () => {
    if (!modalState.job || !modalState.action) return;
    const actionPromise =
      modalState.action === "unpublish"
        ? adminService.adminUnpublishJob(modalState.job.id)
        : adminService.adminRepublishJob(modalState.job.id);
    await toast.promise(actionPromise, {
      loading: `${modalState.action === "unpublish" ? "Unpublishing" : "Republishing"} job...`,
      success: () => {
        refetch();
        closeModal();
        return `Job has been successfully ${modalState.action === "unpublish" ? "unpublished" : "republished"}.`;
      },
      error: (err) => {
        closeModal();
        return err.response?.data?.message || `Failed to ${modalState.action} job.`;
      },
    });
  };

  const handleFilterChange = (newFilters: JobFilterValues) => {
    setFilters(newFilters);
    if (showFiltersModal) {
      setShowFiltersModal(false);
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
  }, [handleMouseMove, handleMouseUp, jobs]);

  return (
    <>
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onConfirm={handleVisibilityToggle}
        title={`${modalState.action === "republish" ? "Republish" : "Unpublish"} Job`}
        description={`Are you sure you want to ${modalState.action} the job posting "${modalState.job?.title}"?`}
        confirmButtonText={modalState.action === "republish" ? "Republish" : "Unpublish"}
        isDestructive={modalState.action === "unpublish"}
      />
      <div className="space-y-5">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
            Job Management
          </h1>
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
              <JobsFilterSidebar
                onFilterChange={handleFilterChange}
                currentFilters={filters}
                industries={industries}
              />
            </div>
          </aside>

          {/* Main */}
          <main className="lg:col-span-3">
            <div className="pb-5">
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Search by title or agency..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
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
                Could not load jobs.
              </div>
            )}
            {!isLoading && !error && jobs && (
              <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
                    Job Postings ({jobs.length})
                  </h2>
                </div>
                <div className="hidden md:block">
                  <div className="overflow-x-auto" ref={scrollRef}>
                    <table className="min-w-full divide-y divide-gray-100 dark:divide-zinc-800">
                      <thead className="bg-gray-50 dark:bg-zinc-800/50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400 select-none cursor-grab"
                          >
                            Job Title
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400 select-none cursor-grab"
                          >
                            Agency
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400 select-none cursor-grab"
                          >
                            Status
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400 select-none cursor-grab"
                          >
                            Visibility
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400 select-none cursor-grab"
                          >
                            Date Posted
                          </th>
                          <th scope="col" className="relative px-6 py-3 select-none cursor-grab">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white dark:bg-zinc-900">
                        {jobs.length === 0 ? (
                          <tr>
                            <td
                              colSpan={6}
                              className="text-center p-8 text-gray-500 dark:text-zinc-400"
                            >
                              No jobs found matching your criteria.
                            </td>
                          </tr>
                        ) : (
                          jobs.map((job) => (
                            <tr
                              key={job.id}
                              className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                              onClick={() => navigate(`/admin/jobs/${job.id}`)}
                            >
                              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-zinc-50">
                                {job.title}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-zinc-400">
                                {job.agency?.name}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-sm">
                                <JobStatusIcon status={job.status} />
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-zinc-400">
                                {job.visibility}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-zinc-400">
                                {new Date(job.createdAt).toLocaleDateString()}
                              </td>
                              <td
                                className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <SimpleDropdown
                                  trigger={
                                    <button className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 dark:text-zinc-400 transition-colors hover:bg-gray-200 dark:hover:bg-zinc-700 hover:text-gray-800 dark:hover:text-zinc-200">
                                      <MoreHorizontal className="h-5 w-5" />
                                    </button>
                                  }
                                >
                                  <SimpleDropdownItem
                                    onSelect={() =>
                                      navigate(`/admin/jobs/${job.id}/edit`)
                                    }
                                    className="group text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800"
                                  >
                                    <Edit className="mr-2 h-4 w-4" />{" "}
                                    <span>Edit Job</span>
                                  </SimpleDropdownItem>
                                  {job.visibility === "PRIVATE" ? (
                                    <SimpleDropdownItem
                                      onSelect={() => openModal(job, "republish")}
                                      className="group text-green-700 dark:text-green-300 hover:bg-green-50 hover:text-green-800"
                                    >
                                      <Eye className="mr-2 h-4 w-4" />{" "}
                                      <span>Republish Job</span>
                                    </SimpleDropdownItem>
                                  ) : (
                                    <SimpleDropdownItem
                                      onSelect={() => openModal(job, "unpublish")}
                                      className="group text-yellow-700 hover:bg-yellow-50 hover:text-yellow-800 dark:hover:text-yellow-100"
                                    >
                                      <EyeOff className="mr-2 h-4 w-4" />{" "}
                                      <span>Unpublish Job</span>
                                    </SimpleDropdownItem>
                                  )}
                                </SimpleDropdown>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="md:hidden">
                  {jobs.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-zinc-400">
                      No jobs found matching your criteria.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                      {jobs.map((job) => {
                        const postedDate = new Date(
                          job.createdAt
                        ).toLocaleDateString();
                        return (
                          <div
                            key={job.id}
                            className="p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                            onClick={() => navigate(`/admin/jobs/${job.id}`)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-medium text-gray-900 dark:text-zinc-50 text-base">
                                    {job.title}
                                  </h3>
                                  <JobStatusIcon status={job.status} />
                                </div>
                                <p className="text-sm text-gray-500 dark:text-zinc-400 mb-1">
                                  {job.agency?.name || "N/A"}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-zinc-400 mb-1">
                                  Visibility: {job.visibility}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-zinc-400">
                                  Posted on {postedDate}
                                </p>
                              </div>
                              <div
                                className="ml-4 flex-shrink-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <SimpleDropdown
                                  trigger={
                                    <button className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 dark:text-zinc-400 transition-colors hover:bg-gray-200 dark:hover:bg-zinc-700 hover:text-gray-800 dark:hover:text-zinc-200">
                                      <MoreHorizontal className="h-5 w-5" />
                                    </button>
                                  }
                                >
                                  <SimpleDropdownItem
                                    onSelect={() =>
                                      navigate(`/admin/jobs/${job.id}/edit`)
                                    }
                                    className="group text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800"
                                  >
                                    <Edit className="mr-2 h-4 w-4" />{" "}
                                    <span>Edit Job</span>
                                  </SimpleDropdownItem>
                                  {job.visibility === "PRIVATE" ? (
                                    <SimpleDropdownItem
                                      onSelect={() => openModal(job, "republish")}
                                      className="group text-green-700 dark:text-green-300 hover:bg-green-50 hover:text-green-800"
                                    >
                                      <Eye className="mr-2 h-4 w-4" />{" "}
                                      <span>Republish Job</span>
                                    </SimpleDropdownItem>
                                  ) : (
                                    <SimpleDropdownItem
                                      onSelect={() => openModal(job, "unpublish")}
                                      className="group text-yellow-700 hover:bg-yellow-50 hover:text-yellow-800 dark:hover:text-yellow-100"
                                    >
                                      <EyeOff className="mr-2 h-4 w-4" />{" "}
                                      <span>Unpublish Job</span>
                                    </SimpleDropdownItem>
                                  )}
                                </SimpleDropdown>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
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
                <JobsFilterSidebar
                  onFilterChange={handleFilterChange}
                  currentFilters={filters}
                  industries={industries}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ManageJobsPage;