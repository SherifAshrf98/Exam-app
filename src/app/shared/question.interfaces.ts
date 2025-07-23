export interface QuestionOption {
  text: string;
  isCorrect: boolean;
}

export interface CreateQuestionRequest {
  subjectId: number;
  text: string;
  difficulty: string;
  options: QuestionOption[];
} 