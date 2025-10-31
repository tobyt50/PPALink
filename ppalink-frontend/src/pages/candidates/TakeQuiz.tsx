import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  ChevronLeft,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Button } from "../../components/ui/Button";
import useFetch from "../../hooks/useFetch";
import quizService from "../../services/quiz.service";
import type {
  QuizForTaking,
  AnswerPayload,
  QuizResult,
} from "../../types/quiz";
import { motion } from "framer-motion";
import { useSWRConfig } from "swr";

const QuizResultView = ({
  result,
  onRetry,
}: {
  result: QuizResult;
  onRetry: () => void;
}) => {
  const isPass = result.passed;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 p-8 select-none"
    >
      {isPass ? (
        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
      ) : (
        <XCircle className="mx-auto h-16 w-16 text-red-500" />
      )}
      <h1 className="mt-4 text-xl md:text-2xl font-extrabold select-none">
        {isPass ? "Congratulations, you passed!" : "Better luck next time."}
      </h1>
      <p className="mt-2 text-lg text-gray-600 dark:text-zinc-300 select-none">
        Your Score:{" "}
        <span
          className={`font-bold ${isPass ? "text-green-500" : "text-red-500"}`}
        >
          {result.score}%
        </span>
      </p>
      <p className="text-sm text-gray-500 dark:text-zinc-400 select-none">
        ({result.correctAnswers} out of {result.totalQuestions} correct)
      </p>
      <div className="mt-8 flex justify-center space-x-2">
        <Button onClick={onRetry} variant="outline" size="lg">
          <RefreshCw className="mr-2 h-4 w-4" /> Back to Assessments
        </Button>
      </div>
    </motion.div>
  );
};

const TakeQuizPage = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const {
    data: quiz,
    isLoading,
    error,
  } = useFetch<QuizForTaking>(quizId ? `/quizzes/${quizId}/take` : null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerPayload[]>([]);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const TIME_PER_QUESTION = 45; // 45 seconds
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);

  // Disable text selection and copying
  useEffect(() => {
    const disableCopy = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    const disableSelect = (e: any) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "c" ||
          e.key === "C" ||
          e.key === "a" ||
          e.key === "A" ||
          e.key === "p" ||
          e.key === "P" ||
          e.key === "s" ||
          e.key === "S")
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("copy", disableCopy);
    document.addEventListener("cut", disableCopy);
    document.addEventListener("selectstart", disableSelect);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("copy", disableCopy);
      document.removeEventListener("cut", disableCopy);
      document.removeEventListener("selectstart", disableSelect);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    // Reset the timer whenever the question changes
    setTimeLeft(TIME_PER_QUESTION);
  }, [currentQuestionIndex]);

  useEffect(() => {
    // If time is up, or quiz is done, stop the timer
    if (timeLeft <= 0 || quizResult) return;

    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    // Cleanup the interval on component unmount or when dependencies change
    return () => clearInterval(timerId);
  }, [timeLeft, quizResult]);

  const goToNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((p) => p + 1);
    } else {
      handleSubmit();
    }
  };

  // If the timer runs out, automatically go to the next question
  useEffect(() => {
    if (timeLeft === 0) {
      toast.error("Time's up for this question!");
      goToNextQuestion();
    }
  }, [timeLeft]);

  const { mutate } = useSWRConfig();

  const handleAnswerSelect = (questionId: string, answerText: string) => {
    setAnswers((prev) => {
      const filtered = prev.filter((a) => a.questionId !== questionId);
      return [...filtered, { questionId, answerText }];
    });
    // setTimeout(() => goToNextQuestion(), 300);
  };

  const handleSubmit = async () => {
    if (!quizId || !quiz) return;
    setIsSubmitting(true);
    try {
      const result = await quizService.submitQuiz(quizId, answers);
      await mutate("/candidates/me");
      setQuizResult(result);
    } catch (err) {
      toast.error("Failed to submit quiz.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12 select-none">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }
  if (error || !quiz) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-800 shadow-md select-none">
        Could not load the quiz.
      </div>
    );
  }
  if (quizResult) {
    return (
      <QuizResultView
        result={quizResult}
        onRetry={() => navigate("/dashboard/candidate/assessments")}
      />
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const selectedAnswerText = answers.find(
    (a) => a.questionId === currentQuestion.id
  )?.answerText;
  const timerPercentage = (timeLeft / TIME_PER_QUESTION) * 100;

  return (
    <motion.div
      key={currentQuestionIndex}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="mx-auto max-w-3xl rounded-2xl bg-white dark:bg-zinc-900 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 p-8 select-none"
    >
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-sm font-semibold text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200 mb-4 select-none"
      >
        <ChevronLeft className="h-5 w-5 mr-1" />
        Back to Assessments
      </button>
      <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-zinc-50 select-none">
        {quiz.title}
      </h1>
      <p className="text-center text-gray-500 dark:text-zinc-400 text-sm select-none">
        Question {currentQuestionIndex + 1} of {quiz.questions.length}
      </p>

      {/* --- TIMER UI --- */}
      <div className="mt-6 flex items-center gap-x-3">
        <div className="w-full bg-gray-200 dark:bg-zinc-800 rounded-full h-1.5">
          <div
            className="bg-primary-600 h-1.5 rounded-full transition-all duration-1000 linear"
            style={{ width: `${timerPercentage}%` }}
          />
        </div>
        <span className="font-semibold text-gray-700 dark:text-zinc-200 text-sm select-none">
          {timeLeft}s
        </span>
      </div>

      <div className="my-8 border-t border-gray-100 dark:border-zinc-800 pt-8">
        <p className="font-semibold text-lg text-gray-800 dark:text-zinc-100 whitespace-pre-line select-none">
          {currentQuestion.text}
        </p>
        <div className="mt-4 space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(currentQuestion.id, option)}
              className={`w-full text-left p-4 border rounded-xl transition-all duration-150 select-none ${
                selectedAnswerText === option
                  ? "bg-primary-50 dark:bg-primary-950/60 border-primary-500 ring-2 ring-primary-500 text-primary-700 dark:text-primary-300"
                  : "border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50 text-gray-700 dark:text-zinc-200"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestionIndex((p) => p - 1)}
          disabled={currentQuestionIndex === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        {currentQuestionIndex < quiz.questions.length - 1 ? (
          <Button onClick={goToNextQuestion}>
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} isLoading={isSubmitting}>
            Submit Quiz
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default TakeQuizPage;