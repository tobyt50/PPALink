import apiClient from '../config/axios';
import type { AvailableQuiz, QuizForTaking, QuizResult, AnswerPayload } from '../types/quiz';

class QuizService {
  /**
   * Fetches the list of quizzes available for the logged-in candidate.
   */
  async getAvailableQuizzes(): Promise<AvailableQuiz[]> {
    const response = await apiClient.get('/quizzes/available');
    return response.data.data;
  }

  /**
   * Fetches the full details of a single quiz for the user to take.
   * @param quizId The ID of the quiz to fetch.
   */
  async getQuizForTaking(quizId: string): Promise<QuizForTaking> {
    const response = await apiClient.get(`/quizzes/${quizId}/take`);
    return response.data.data;
  }

  /**
   * Submits the candidate's answers and returns the score.
   * @param quizId The ID of the quiz being submitted.
   * @param answers An array of the user's answers.
   */
  async submitQuiz(quizId: string, answers: AnswerPayload[]): Promise<QuizResult> {
    const response = await apiClient.post(`/quizzes/${quizId}/submit`, { answers });
    return response.data.data;
  }
}

export default new QuizService();