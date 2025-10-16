import {
  ArrowUpDown,
  Edit,
  Loader2,
  PlusCircle,
  Search,
  Trash2,
  ChevronDown,
  MoreHorizontal,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
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

const ManageQuizzesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { skills: allSkills } = useDataStore();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [levelFilter, setLevelFilter] = useState(searchParams.get("level") || "ALL");
  const [skillFilter, setSkillFilter] = useState(searchParams.get("skillId") || "ALL");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || 'title');
  const [sortOrder, setSortOrder] = useState(searchParams.get("sortOrder") || 'asc');

  const debouncedQuery = useDebounce(query, 500);

  const fetchUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (levelFilter !== "ALL") params.set("level", levelFilter);
    if (skillFilter !== "ALL") params.set("skillId", skillFilter);
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    return `/admin/quizzes?${params.toString()}`;
  }, [debouncedQuery, levelFilter, skillFilter, sortBy, sortOrder]);

  const {
    data: quizzes,
    isLoading,
    error,
    refetch,
  } = useFetch<AdminQuiz[]>(fetchUrl);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (levelFilter !== "ALL") params.set("level", levelFilter);
    if (skillFilter !== "ALL") params.set("skillId", skillFilter);
    if (sortBy !== 'title') params.set("sortBy", sortBy);
    if (sortOrder !== 'asc') params.set("sortOrder", sortOrder);
    setSearchParams(params, { replace: true });
  }, [query, levelFilter, skillFilter, sortBy, sortOrder, setSearchParams]);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<AdminQuiz | null>(null);
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    quiz: AdminQuiz | null;
  }>({ isOpen: false, quiz: null });

  const levelOptions: { [key: string]: string } = {
    ALL: "All Levels",
    BEGINNER: "Beginner",
    INTERMEDIATE: "Intermediate",
    ADVANCED: "Advanced",
  };
  const selectedSkillName =
    allSkills.find((s) => s.id === Number(skillFilter))?.name || "All Skills";

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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
              Quiz Management
            </h1>
            <p className="mt-2 text-gray-600 dark:text-zinc-300">
              Create and manage skill assessments for candidates.
            </p>
          </div>
          <Button size="sm"
            onClick={handleCreate}
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            New Quiz
          </Button>
        </div>

        <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <Input
                icon={Search}
                type="search"
                placeholder="Search by title..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="md:col-span-1">
              <SimpleDropdown
                trigger={
                  <DropdownTrigger>
                    {selectedSkillName}
                    <ChevronDown className="h-4 w-4 text-gray-500 dark:text-zinc-400" />
                  </DropdownTrigger>
                }
              >
                <SimpleDropdownItem onSelect={() => setSkillFilter("ALL")}>
                  All Skills
                </SimpleDropdownItem>
                {allSkills.map((s) => (
                  <SimpleDropdownItem
                    key={s.id}
                    onSelect={() => setSkillFilter(String(s.id))}
                  >
                    {s.name}
                  </SimpleDropdownItem>
                ))}
              </SimpleDropdown>
            </div>
            <div className="md:col-span-1">
              <SimpleDropdown
                trigger={
                  <DropdownTrigger>
                    {levelOptions[levelFilter]}
                    <ChevronDown className="h-4 w-4 text-gray-500 dark:text-zinc-400" />
                  </DropdownTrigger>
                }
              >
                {Object.entries(levelOptions).map(([key, value]) => (
                  <SimpleDropdownItem
                    key={key}
                    onSelect={() => setLevelFilter(key)}
                  >
                    {value}
                  </SimpleDropdownItem>
                ))}
              </SimpleDropdown>
            </div>
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
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100 dark:divide-zinc-800">
                  <thead className="bg-gray-50 dark:bg-zinc-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                        <button
                          onClick={() => handleSort("title")}
                          className="flex items-center group"
                        >
                          TITLE
                          <ArrowUpDown className="ml-2 h-4 w-4 text-gray-400 dark:text-zinc-500 group-hover:text-gray-600" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                        <button
                          onClick={() => handleSort("skill")}
                          className="flex items-center group"
                        >
                          LINKED SKILL
                          <ArrowUpDown className="ml-2 h-4 w-4 text-gray-400 dark:text-zinc-500 group-hover:text-gray-600" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                        <button
                          onClick={() => handleSort("level")}
                          className="flex items-center group"
                        >
                          LEVEL
                          <ArrowUpDown className="ml-2 h-4 w-4 text-gray-400 dark:text-zinc-500 group-hover:text-gray-600" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                        QUESTIONS
                      </th>
                      <th className="relative px-6 py-3">
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
      </div>
    </>
  );
};

export default ManageQuizzesPage;