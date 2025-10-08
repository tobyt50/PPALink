export type QuizLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface AvailableQuiz {
  id: string;
  title: string;
  description: string | null;
  level: QuizLevel;
  _count: {
    questions: number;
  };
}

export interface Question {
    id: string;
    text: string;
    options: string[];
}

export interface QuizForTaking {
    id: string;
    title: string;
    description: string | null;
    level: QuizLevel;
    questions: Question[];
}

export interface AdminQuiz extends QuizForTaking {
    questions: (Question & { correctAnswer: string; })[];
    skillId: number | null;
    level: QuizLevel;
    skill?: {
        name: string;
    };
    _count?: {
        questions: number;
    };
}

export interface QuizResult {
    score: number;
    passed: boolean;
    correctAnswers: number;
    totalQuestions: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  skillId: number | null;
  skill?: {
      id: number;
      name: string;
      slug: string;
  };
  score: number;
  passed: boolean;
  completedAt: string | null;
  nextRetryAvailableAt: string | null;
  quiz: {
      title: string;
  };
}

export interface AnswerPayload {
    questionId: string;
    answerText: string;
}