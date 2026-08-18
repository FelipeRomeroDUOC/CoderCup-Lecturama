export interface QuizQuestion {
  id: string;
  question: string;
  options: string[]; // exactly 4 options
  correctOptionIndex: number; // 0, 1, 2, or 3
  explanation?: string;
}

export interface ChapterQuiz {
  chapterId: string;
  chapterTitle?: string;
  questions: QuizQuestion[]; // exactly 5 questions
}

export interface ChapterProgress {
  sessionId: string;
  chapterId: string;
  remainingLives: number; // starts at 3
  isCompleted: boolean;
  score?: number;
}
