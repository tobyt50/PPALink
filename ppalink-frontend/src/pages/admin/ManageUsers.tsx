import {
  ChevronDown,
  Loader2,
  MoreHorizontal,
  Search,
  UserCheck,
  UserX,
  Pause,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ConfirmationModal } from "../../components/ui/Modal";
import {
  SimpleDropdown,
  SimpleDropdownItem,
} from "../../components/ui/SimpleDropdown";
import useFetch from "../../hooks/useFetch";
import adminService from "../../services/admin.service";
import type { User, UserStatus, Role } from "../../types/user";
import { DropdownTrigger } from "../../components/ui/DropdownTrigger";
import { useDebounce } from "../../hooks/useDebounce";
import { Input } from "../../components/forms/Input";
import { Button } from "../../components/ui/Button";
import { Avatar } from "../../components/ui/Avatar";

const UserRoleBadge = ({ role }: { role: User["role"] }) => {
  const roleStyles: Record<User["role"], string> = {
    ADMIN: "bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300",
    AGENCY:
      "bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300",
    CANDIDATE:
      "bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-200",
    SUPER_ADMIN:
      "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${roleStyles[role]}`}
    >
      {role}
    </span>
  );
};

const UserStatusIcon = ({ status }: { status: User["status"] }) => {
  const statusStyles: Record<User["status"], string> = {
    ACTIVE: "text-green-600 dark:text-green-400",
    SUSPENDED: "text-yellow-600 dark:text-yellow-400",
    DEACTIVATED: "text-red-600 dark:text-red-400",
  };
  const statusIcons: Record<User["status"], React.ReactNode> = {
    ACTIVE: <UserCheck className="h-4 w-4" />,
    SUSPENDED: <Pause className="h-4 w-4" />,
    DEACTIVATED: <UserX className="h-4 w-4" />,
  };
  return (
    <span className={`inline-flex items-center ${statusStyles[status]}`}>
      {statusIcons[status]}
    </span>
  );
};

type UserFilterValues = {
  role: Role | "ALL";
  status: UserStatus | "ALL";
};

const UsersFilterSidebar = ({
  onFilterChange,
  currentFilters,
}: {
  onFilterChange: (filters: UserFilterValues) => void;
  currentFilters: UserFilterValues;
}) => {
  const [localFilters, setLocalFilters] = useState(currentFilters);
  const roleOptions: { [key: string]: string } = {
    ALL: "All Roles",
    CANDIDATE: "Candidate",
    AGENCY: "Agency",
    ADMIN: "Admin",
    SUPER_ADMIN: "Super Admin",
  };
  const statusOptions: { [key: string]: string } = {
    ALL: "All Statuses",
    ACTIVE: "Active",
    SUSPENDED: "Suspended",
    DEACTIVATED: "Deactivated",
  };

  useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters]);

  const handleRoleChange = (role: Role | "ALL") => {
    setLocalFilters({ ...localFilters, role });
  };

  const handleStatusChange = (status: UserStatus | "ALL") => {
    setLocalFilters({ ...localFilters, status });
  };

  const handleApply = () => {
    onFilterChange(localFilters);
  };

  const handleClear = () => {
    const clearedFilters = { role: "ALL" as const, status: "ALL" as const };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-50 mb-2">
          Role
        </h3>
        <SimpleDropdown
          trigger={
            <DropdownTrigger>
              {roleOptions[localFilters.role]}
              <ChevronDown className="h-4 w-4 text-gray-500 dark:text-zinc-400" />
            </DropdownTrigger>
          }
        >
          {Object.entries(roleOptions).map(([key, value]) => (
            <SimpleDropdownItem
              key={key}
              onSelect={() => handleRoleChange(key as Role | "ALL")}
            >
              {value}
            </SimpleDropdownItem>
          ))}
        </SimpleDropdown>
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
              onSelect={() => handleStatusChange(key as UserStatus | "ALL")}
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

const ManageUsersPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [filters, setFilters] = useState<UserFilterValues>({
    role: (searchParams.get("role") as Role) || "ALL",
    status: (searchParams.get("status") as UserStatus) || "ALL",
  });
  const [sortBy, setSortBy] = useState(
    searchParams.get("sortBy") || "createdAt"
  );
  const [sortOrder] = useState(searchParams.get("sortOrder") || "desc");
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  const debouncedQuery = useDebounce(query, 500);
  const debouncedFilters = useDebounce(filters, 500);

  const fetchUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (debouncedFilters.role !== "ALL") params.set("role", debouncedFilters.role);
    if (debouncedFilters.status !== "ALL") params.set("status", debouncedFilters.status);
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    return `/admin/users?${params.toString()}`;
  }, [debouncedQuery, debouncedFilters, sortBy, sortOrder]);
  const { data: users, isLoading, error, refetch } = useFetch<User[]>(fetchUrl);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (filters.role !== "ALL") params.set("role", filters.role);
    if (filters.status !== "ALL") params.set("status", filters.status);
    if (sortBy !== "createdAt") params.set("sortBy", sortBy);
    if (sortOrder !== "desc") params.set("sortOrder", sortOrder);
    setSearchParams(params, { replace: true });
  }, [query, filters, sortBy, sortOrder, setSearchParams]);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    user: User | null;
    action: "SUSPENDED" | "ACTIVE" | null;
  }>({ isOpen: false, user: null, action: null });
  const openConfirmationModal = (user: User, action: "SUSPENDED" | "ACTIVE") =>
    setModalState({ isOpen: true, user, action });
  const closeConfirmationModal = () =>
    setModalState({ isOpen: false, user: null, action: null });

  const handleUpdateStatus = async () => {
    if (!modalState.user || !modalState.action) return;
    const updatePromise = adminService.updateUserStatus(
      modalState.user.id,
      modalState.action
    );
    await toast.promise(updatePromise, {
      loading: "Updating user status...",
      success: () => {
        refetch();
        closeConfirmationModal();
        return `User has been ${
          modalState.action === "SUSPENDED" ? "suspended" : "activated"
        }.`;
      },
      error: (err) => {
        closeConfirmationModal();
        return err.response?.data?.message || "Failed to update user status.";
      },
    });
  };

  const sortOptions: { [key: string]: string } = {
    createdAt: "Date Joined",
    email: "Email",
  };

  const handleFilterChange = (newFilters: UserFilterValues) => {
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
  }, [handleMouseMove, handleMouseUp, users]);

  return (
    <>
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={closeConfirmationModal}
        onConfirm={handleUpdateStatus}
        title={
          modalState.action === "SUSPENDED" ? "Suspend User" : "Activate User"
        }
        description={`Are you sure you want to ${
          modalState.action?.toLowerCase()
        } the account for ${modalState.user?.email}?`}
        confirmButtonText={
          modalState.action === "SUSPENDED" ? "Suspend" : "Activate"
        }
        isDestructive={modalState.action === "SUSPENDED"}
      />
      <div className="space-y-5">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
            Manage Users
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
              <UsersFilterSidebar
                onFilterChange={handleFilterChange}
                currentFilters={filters}
              />
            </div>
          </aside>

          {/* Main */}
          <main className="lg:col-span-3">
            <div className="pb-5">
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Search by name, agency, or email..."
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
                Could not load users.
              </div>
            )}
            {!isLoading && !error && users && (
              <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
                    Platform Users ({users.length})
                  </h2>
                  <div className="flex items-center gap-2 min-w-0 whitespace-nowrap">
                    <SimpleDropdown
                      trigger={
                        <Button variant="ghost" size="sm">
                          {sortOptions[sortBy]}
                          <ChevronDown className="ml-2 h-4 w-4 text-gray-500 dark:text-zinc-400" />
                        </Button>
                      }
                    >
                      {Object.entries(sortOptions).map(([key, value]) => (
                        <SimpleDropdownItem
                          key={key}
                          onSelect={() => setSortBy(key)}
                        >
                          {value}
                        </SimpleDropdownItem>
                      ))}
                    </SimpleDropdown>
                  </div>
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
                            Name
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400 select-none cursor-grab"
                          >
                            Role
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
                            Joined On
                          </th>
                          <th
                            scope="col"
                            className="relative px-6 py-3 select-none cursor-grab"
                          >
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white dark:bg-zinc-900">
                        {users.length === 0 ? (
                          <tr>
                            <td
                              colSpan={6}
                              className="text-center p-8 text-gray-500 dark:text-zinc-400"
                            >
                              No users found matching your criteria.
                            </td>
                          </tr>
                        ) : (
                          users.map((user) => {
                            const name = user.candidateProfile
                              ? `${user.candidateProfile.firstName} ${user.candidateProfile.lastName}`
                              : user.ownedAgencies?.[0]?.name || user.email;
                            return (
                              <tr
                                key={user.id}
                                className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                                onClick={() => navigate(`/admin/users/${user.id}`)}
                              >
                                <td className="px-6 py-4">
                                  <div className="flex items-center">
                                    <Avatar user={user} name={name} size="md" />
                                    <div className="ml-4">
                                      <div className="font-semibold text-gray-900 dark:text-zinc-100">
                                        {name}
                                      </div>
                                      <div className="text-sm text-gray-500 dark:text-zinc-400">
                                        {user.email}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm">
                                  <UserRoleBadge role={user.role} />
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm">
                                  <UserStatusIcon status={user.status} />
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-zinc-400">
                                  {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td
                                  className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {user.role !== "ADMIN" &&
                                    user.role !== "SUPER_ADMIN" && (
                                      <SimpleDropdown
                                        trigger={
                                          <button className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 dark:text-zinc-400 transition-colors hover:bg-gray-200 dark:hover:bg-zinc-700 hover:text-gray-800 dark:hover:text-zinc-200">
                                            <MoreHorizontal className="h-5 w-5" />
                                          </button>
                                        }
                                      >
                                        {user.status === "ACTIVE" ? (
                                          <SimpleDropdownItem
                                            onSelect={() =>
                                              openConfirmationModal(
                                                user,
                                                "SUSPENDED"
                                              )
                                            }
                                            className="group text-yellow-700 hover:bg-yellow-50 hover:text-yellow-800 dark:hover:text-yellow-100"
                                          >
                                            <UserX className="mr-2 h-4 w-4" />{" "}
                                            <span>Suspend Account</span>
                                          </SimpleDropdownItem>
                                        ) : (
                                          <SimpleDropdownItem
                                            onSelect={() =>
                                              openConfirmationModal(user, "ACTIVE")
                                            }
                                            className="group text-green-700 dark:text-green-300 hover:bg-green-50 hover:text-green-800"
                                          >
                                            <UserCheck className="mr-2 h-4 w-4" />{" "}
                                            <span>Reactivate Account</span>
                                          </SimpleDropdownItem>
                                        )}
                                      </SimpleDropdown>
                                    )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="md:hidden">
                  {users.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-zinc-400">
                      No users found matching your criteria.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                      {users.map((user) => {
                        const name = user.candidateProfile
                          ? `${user.candidateProfile.firstName} ${user.candidateProfile.lastName}`
                          : user.ownedAgencies?.[0]?.name || user.email;
                        const joinedDate = new Date(
                          user.createdAt
                        ).toLocaleDateString();
                        return (
                          <div
                            key={user.id}
                            className="p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                            onClick={() => navigate(`/admin/users/${user.id}`)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center">
                                <Avatar user={user} name={name} size="md" />
                                <div className="ml-3 flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-medium text-gray-900 dark:text-zinc-50 text-base">
                                      {name}
                                    </h3>
                                    <UserStatusIcon status={user.status} />
                                  </div>
                                  <UserRoleBadge role={user.role} />
                                  <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2">
                                    Joined on {joinedDate}
                                  </p>
                                </div>
                              </div>
                              <div
                                className="ml-4 flex-shrink-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {user.role !== "ADMIN" &&
                                  user.role !== "SUPER_ADMIN" && (
                                    <SimpleDropdown
                                      trigger={
                                        <button className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 dark:text-zinc-400 transition-colors hover:bg-gray-200 dark:hover:bg-zinc-700 hover:text-gray-800 dark:hover:text-zinc-200">
                                          <MoreHorizontal className="h-5 w-5" />
                                        </button>
                                      }
                                    >
                                      {user.status === "ACTIVE" ? (
                                        <SimpleDropdownItem
                                          onSelect={() =>
                                            openConfirmationModal(user, "SUSPENDED")
                                          }
                                          className="group text-yellow-700 hover:bg-yellow-50 hover:text-yellow-800 dark:hover:text-yellow-100"
                                        >
                                          <UserX className="mr-2 h-4 w-4" />{" "}
                                          <span>Suspend Account</span>
                                        </SimpleDropdownItem>
                                      ) : (
                                        <SimpleDropdownItem
                                          onSelect={() =>
                                            openConfirmationModal(user, "ACTIVE")
                                          }
                                          className="group text-green-700 dark:text-green-300 hover:bg-green-50 hover:text-green-800"
                                        >
                                          <UserCheck className="mr-2 h-4 w-4" />{" "}
                                          <span>Reactivate Account</span>
                                        </SimpleDropdownItem>
                                      )}
                                    </SimpleDropdown>
                                  )}
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
                <UsersFilterSidebar
                  onFilterChange={handleFilterChange}
                  currentFilters={filters}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ManageUsersPage;