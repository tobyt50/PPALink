import {
  Book,
  CheckCircle,
  ChevronRight,
  FileQuestion,
  History,
  Loader2,
  RotateCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import useFetch from "../../hooks/useFetch";
import type { AvailableQuiz } from "../../types/quiz";
import type { CandidateProfile } from "../../types/candidate";
import { format, isFuture } from "date-fns";

const AssessmentsPage = () => {
  const {
    data: quizzes,
    isLoading: isLoadingQuizzes,
    error: errorQuizzes,
  } = useFetch<AvailableQuiz[]>("/quizzes/available");
  const {
    data: profile,
    isLoading: isLoadingProfile,
    error: errorProfile,
  } = useFetch<CandidateProfile>("/candidates/me");

  const isLoading = isLoadingQuizzes || isLoadingProfile;
  const error = errorQuizzes || errorProfile;

  const completedAttempts = profile?.quizAttempts || [];

  const levelColorMap = {
    BEGINNER:
      "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
    INTERMEDIATE:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
    ADVANCED: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-400 bg-clip-text text-transparent">
          Skill Assessments
        </h1>
        <p className="mt-2 text-gray-600 dark:text-zinc-300">
          Prove your expertise and earn badges for your profile by passing these
          quizzes.
        </p>
      </div>

      {isLoading && (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-800 shadow-md">
          Could not load available assessments.
        </div>
      )}

      {!isLoading && !error && (
        <>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-50">
              Available to Take
            </h2>
            {quizzes?.length === 0 && (
              <div className="p-12 text-center rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <h2 className="mt-2 font-semibold text-gray-900 dark:text-zinc-50">
                  All Caught Up!
                </h2>
                <p className="text-sm text-gray-500 dark:text-zinc-400">
                  You have no new quizzes to take. Check back later!
                </p>
              </div>
            )}
            {quizzes?.map((quiz) => (
              <div
                key={quiz.id}
                className="p-4 bg-white dark:bg-zinc-900 border dark:border-zinc-800 border-gray-100 rounded-2xl flex items-center justify-between shadow-md dark:shadow-none"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-950/60">
                    <Book className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-zinc-100">
                      {quiz.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-zinc-400">
                      {quiz.description}
                    </p>
                    <div className="text-xs text-gray-400 dark:text-zinc-500 mt-2 flex items-center gap-x-3">
                      <span className="flex items-center">
                        <FileQuestion className="h-3 w-3 mr-1" />
                        {quiz._count.questions} questions
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-medium ${
                          levelColorMap[quiz.level] || "bg-gray-100"
                        }`}
                      >
                        {quiz.level}
                      </span>
                    </div>
                  </div>
                </div>
                <Link to={`/dashboard/candidate/assessments/${quiz.id}`}>
                  <Button variant="outline">
                    Start <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          {completedAttempts.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-50 flex items-center">
                <History className="mr-2 h-5 w-5" />
                Attempt History
              </h2>
              {completedAttempts.map((attempt) => {
                const canRetry = attempt.nextRetryAvailableAt
                  ? !isFuture(new Date(attempt.nextRetryAvailableAt))
                  : false;
                return (
                  <div
                    key={attempt.id}
                    className={`p-4 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl flex items-center justify-between shadow-md dark:shadow-none ${
                      attempt.passed
                        ? "border-green-200 dark:border-green-900"
                        : "border-orange-200 dark:border-orange-900"
                    }`}
                  >
                    <div className="flex items-center">
                      {attempt.passed ? (
                        <CheckCircle className="h-10 w-10 text-green-500 mr-4" />
                      ) : (
                        <RotateCw className="h-10 w-10 text-orange-500 mr-4" />
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-zinc-100">
                          {attempt.quiz.title}
                        </h3>
                        <p
                          className={`text-sm font-bold ${
                            attempt.passed
                              ? "text-green-600 dark:text-green-400"
                              : "text-orange-600 dark:text-orange-400"
                          }`}
                        >
                          Score: {attempt.score}%
                        </p>
                        <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
                          Completed on{" "}
                          {format(
                            new Date(attempt.completedAt!),
                            "MMM d, yyyy"
                          )}
                        </p>
                      </div>
                    </div>
                    {!attempt.passed &&
                      (canRetry ? (
                        <Link
                          to={`/dashboard/candidate/assessments/${attempt.quizId}`}
                        >
                          <Button>Retake Quiz</Button>
                        </Link>
                      ) : (
                        <Button variant="outline" disabled>
                          Retry on{" "}
                          {format(
                            new Date(attempt.nextRetryAvailableAt!),
                            "MMM d"
                          )}
                        </Button>
                      ))}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AssessmentsPage;
