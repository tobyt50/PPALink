import {
  ArrowUpDown,
  Edit,
  Loader2,
  PlusCircle,
  Search,
  Trash2,
  ChevronDown,
  MoreHorizontal,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { toast } from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import { ConfirmationModal } from "../../components/ui/Modal";
import { useDebounce } from "../../hooks/useDebounce";
import { SimpleDropdown, SimpleDropdownItem } from "../../components/ui/SimpleDropdown";
import { DropdownTrigger } from "../../components/ui/DropdownTrigger";
import { Input } from "../../components/forms/Input";
import useFetch from "../../hooks/useFetch";
import adminService from "../../services/admin.service";
import type { AdminQuiz } from "../../types/quiz";
import { useDataStore } from "../../context/DataStore";
import { QuizFormModal } from "./forms/QuizForm";
import { Button } from "../../components/ui/Button";

const LevelBadge = ({ level }: { level: AdminQuiz['level'] }) => {
  const levelStyles: Record<AdminQuiz['level'], string> = {
    BEGINNER: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200',
    INTERMEDIATE: 'bg-yellow-100 dark:bg-yellow-950/60 text-yellow-800 dark:text-yellow-300',
    ADVANCED: 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-200',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${levelStyles[level]}`}>
      {level}
    </span>
  );
};

type QuizFilterValues = {
  skillId: string | "ALL";
  level: AdminQuiz['level'] | "ALL";
};

const QuizzesFilterSidebar = ({
  onFilterChange,
  currentFilters,
  allSkills,
}: {
  onFilterChange: (filters: QuizFilterValues) => void;
  currentFilters: QuizFilterValues;
  allSkills: any[]; // Adjust type based on your Skill type
}) => {
  const [localFilters, setLocalFilters] = useState(currentFilters);
  const levelOptions: { [key: string]: string } = {
    ALL: "All Levels",
    BEGINNER: "Beginner",
    INTERMEDIATE: "Intermediate",
    ADVANCED: "Advanced",
  };
  const selectedSkillName =
    allSkills.find((s) => s.id === Number(localFilters.skillId))?.name ||
    "All Skills";

  useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters]);

  const handleSkillChange = (skillId: string) => {
    setLocalFilters({ ...localFilters, skillId });
  };

  const handleLevelChange = (level: AdminQuiz['level'] | "ALL") => {
    setLocalFilters({ ...localFilters, level });
  };

  const handleApply = () => {
    onFilterChange(localFilters);
  };

  const handleClear = () => {
    const clearedFilters = { skillId: "ALL" as const, level: "ALL" as const };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-50 mb-2">
          Skill
        </h3>
        <SimpleDropdown
          trigger={
            <DropdownTrigger>
              {selectedSkillName}
              <ChevronDown className="h-4 w-4 text-gray-500 dark:text-zinc-400" />
            </DropdownTrigger>
          }
        >
          <SimpleDropdownItem onSelect={() => handleSkillChange("ALL")}>
            All Skills
          </SimpleDropdownItem>
          {allSkills.map((s) => (
            <SimpleDropdownItem
              key={s.id}
              onSelect={() => handleSkillChange(String(s.id))}
            >
              {s.name}
            </SimpleDropdownItem>
          ))}
        </SimpleDropdown>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-50 mb-2">
          Level
        </h3>
        <SimpleDropdown
          trigger={
            <DropdownTrigger>
              {levelOptions[localFilters.level]}
              <ChevronDown className="h-4 w-4 text-gray-500 dark:text-zinc-400" />
            </DropdownTrigger>
          }
        >
          {Object.entries(levelOptions).map(([key, value]) => (
            <SimpleDropdownItem
              key={key}
              onSelect={() => handleLevelChange(key as AdminQuiz['level'] | "ALL")}
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

const ManageQuizzesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { skills: allSkills } = useDataStore();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [filters, setFilters] = useState<QuizFilterValues>({
    skillId: searchParams.get("skillId") || "ALL",
    level: (searchParams.get("level") as AdminQuiz['level']) || "ALL",
  });
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || 'title');
  const [sortOrder, setSortOrder] = useState(searchParams.get("sortOrder") || 'asc');
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  const debouncedQuery = useDebounce(query, 500);
  const debouncedFilters = useDebounce(filters, 500);

  const fetchUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (debouncedFilters.skillId !== "ALL") params.set("skillId", debouncedFilters.skillId);
    if (debouncedFilters.level !== "ALL") params.set("level", debouncedFilters.level);
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    return `/admin/quizzes?${params.toString()}`;
  }, [debouncedQuery, debouncedFilters, sortBy, sortOrder]);

  const {
    data: quizzes,
    isLoading,
    error,
    refetch,
  } = useFetch<AdminQuiz[]>(fetchUrl);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (filters.skillId !== "ALL") params.set("skillId", filters.skillId);
    if (filters.level !== "ALL") params.set("level", filters.level);
    if (sortBy !== 'title') params.set("sortBy", sortBy);
    if (sortOrder !== 'asc') params.set("sortOrder", sortOrder);
    setSearchParams(params, { replace: true });
  }, [query, filters, sortBy, sortOrder, setSearchParams]);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<AdminQuiz | null>(null);
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    quiz: AdminQuiz | null;
  }>({ isOpen: false, quiz: null });

  const handleSort = (column: string) => {
    setSortBy(column);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleCreate = () => {
    setEditingQuiz(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (quiz: AdminQuiz) => {
    setEditingQuiz(quiz);
    setIsFormModalOpen(true);
  };

  const handleDelete = (quiz: AdminQuiz) => {
    setDeleteModalState({ isOpen: true, quiz });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalState.quiz) return;
    await toast.promise(adminService.deleteQuiz(deleteModalState.quiz.id), {
      loading: "Deleting quiz...",
      success: () => {
        refetch();
        setDeleteModalState({ isOpen: false, quiz: null });
        return "Quiz deleted successfully.";
      },
      error: "Failed to delete quiz.",
    });
  };

  const handleCloseForm = () => {
    setIsFormModalOpen(false);
    setEditingQuiz(null);
  };

  const handleFilterChange = (newFilters: QuizFilterValues) => {
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
  }, [handleMouseMove, handleMouseUp, quizzes]);

  return (
    <>
      <QuizFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseForm}
        refetch={refetch}
        initialQuizId={editingQuiz?.id}
      />

      <ConfirmationModal
        isOpen={deleteModalState.isOpen}
        onClose={() =>
          setDeleteModalState({ isOpen: false, quiz: null })
        }
        onConfirm={handleDeleteConfirm}
        title={`Delete Quiz: "${deleteModalState.quiz?.title}"`}
        description="Are you sure? Deleting this quiz will also delete all associated questions and attempts. This action is irreversible."
        isDestructive
        confirmButtonText="Delete"
      />

      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
              Quiz Management
            </h1>
          </div>
          <Button size="sm"
            onClick={handleCreate}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Quiz
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
              <QuizzesFilterSidebar
                onFilterChange={handleFilterChange}
                currentFilters={filters}
                allSkills={allSkills}
              />
            </div>
          </aside>

          {/* Main */}
          <main className="lg:col-span-3">
            <div className="pb-5">
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Search by title..."
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
                Could not load quizzes.
              </div>
            )}

            {!isLoading && !error && quizzes && (
              <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 dark:border-zinc-800">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">Quizzes ({quizzes.length})</h2>
                </div>
                <div className="hidden md:block">
                  <div className="overflow-x-auto" ref={scrollRef}>
                    <table className="min-w-full divide-y divide-gray-100 dark:divide-zinc-800">
                      <thead className="bg-gray-50 dark:bg-zinc-800/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400 select-none cursor-grab">
                            <button
                              onClick={() => handleSort("title")}
                              className="flex items-center group"
                            >
                              TITLE
                              <ArrowUpDown className="ml-2 h-4 w-4 text-gray-400 dark:text-zinc-500 group-hover:text-gray-600" />
                            </button>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400 select-none cursor-grab">
                            <button
                              onClick={() => handleSort("skill")}
                              className="flex items-center group"
                            >
                              LINKED SKILL
                              <ArrowUpDown className="ml-2 h-4 w-4 text-gray-400 dark:text-zinc-500 group-hover:text-gray-600" />
                            </button>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400 select-none cursor-grab">
                            <button
                              onClick={() => handleSort("level")}
                              className="flex items-center group"
                            >
                              LEVEL
                              <ArrowUpDown className="ml-2 h-4 w-4 text-gray-400 dark:text-zinc-500 group-hover:text-gray-600" />
                            </button>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400 select-none cursor-grab">
                            QUESTIONS
                          </th>
                          <th className="relative px-6 py-3 select-none cursor-grab">
                            <span className="sr-only">ACTIONS</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                        {quizzes.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="text-center p-8 text-gray-500 dark:text-zinc-400"
                            >
                              No quizzes found matching your criteria.
                            </td>
                          </tr>
                        ) : (
                          quizzes.map((quiz) => (
                            <tr
                              key={quiz.id}
                              className="hover:bg-gray-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-zinc-50">
                                {quiz.title}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-zinc-400">
                                {quiz.skill?.name || "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <LevelBadge level={quiz.level} />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-zinc-400">
                                {quiz._count?.questions}
                              </td>
                              <td
                                className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
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
                                    onSelect={() => handleEdit(quiz)}
                                    className="group text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800"
                                  >
                                    <Edit className="mr-2 h-4 w-4" />{" "}
                                    <span>Edit Quiz</span>
                                  </SimpleDropdownItem>
                                  <SimpleDropdownItem
                                    onSelect={() => handleDelete(quiz)}
                                    className="group text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-800"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />{" "}
                                    <span>Delete Quiz</span>
                                  </SimpleDropdownItem>
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
                  {quizzes.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-zinc-400">No quizzes found matching your criteria.</div>
                  ) : (
                    <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                      {quizzes.map((quiz) => (
                        <div key={quiz.id} className="p-4 hover:bg-gray-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium text-gray-900 dark:text-zinc-50 text-base">{quiz.title}</h3>
                                <LevelBadge level={quiz.level} />
                              </div>
                              <p className="text-sm text-gray-500 dark:text-zinc-400 mb-1">{quiz.skill?.name || 'N/A'}</p>
                              <p className="text-sm text-gray-500 dark:text-zinc-400">Questions: {quiz._count?.questions}</p>
                            </div>
                            <div className="ml-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                              <SimpleDropdown
                                trigger={
                                  <button className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 dark:text-zinc-400 transition-colors hover:bg-gray-200 dark:hover:bg-zinc-700 hover:text-gray-800 dark:hover:text-zinc-200">
                                    <MoreHorizontal className="h-5 w-5" />
                                  </button>
                                }
                              >
                                <SimpleDropdownItem
                                  onSelect={() => handleEdit(quiz)}
                                  className="group text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800"
                                >
                                  <Edit className="mr-2 h-4 w-4" />{" "}
                                  <span>Edit Quiz</span>
                                </SimpleDropdownItem>
                                <SimpleDropdownItem
                                  onSelect={() => handleDelete(quiz)}
                                  className="group text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-800"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />{" "}
                                  <span>Delete Quiz</span>
                                </SimpleDropdownItem>
                              </SimpleDropdown>
                            </div>
                          </div>
                        </div>
                      ))}
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
            <div className="fixed top-14 bottom-14 right-0 w-full max-w-md bg-white dark:bg-zinc-900 shadow-lg overflow-hidden flex flex-col">
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
                <QuizzesFilterSidebar
                  onFilterChange={handleFilterChange}
                  currentFilters={filters}
                  allSkills={allSkills}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ManageQuizzesPage;