import { QuizQuestion } from "@/types/quiz";

export interface ActiveQuizSession {
  chapterId: string;
  chapterTitle: string;
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  lives: number;
  correctAnswersCount: number;
  selectedOptionIndex: number | null;
  isAnswerSubmitted: boolean;
  timestamp: number;
}

function getSessionKey(userId: string, bookTitle: string, chapterId: string): string {
  const cleanTitle = bookTitle.replace(/\s+/g, "_");
  const cleanChapter = chapterId.replace(/\s+/g, "_");
  return `codercup_quiz_${userId}_${cleanTitle}_${cleanChapter}`;
}

export function getQuizSession(
  userId: string,
  bookTitle: string,
  chapterId: string
): ActiveQuizSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(getSessionKey(userId, bookTitle, chapterId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ActiveQuizSession;
    if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.warn("Error reading saved quiz session:", err);
  }
  return null;
}

export function saveQuizSession(
  userId: string,
  bookTitle: string,
  session: ActiveQuizSession
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      getSessionKey(userId, bookTitle, session.chapterId),
      JSON.stringify(session)
    );
  } catch (err) {
    console.warn("Error saving quiz session:", err);
  }
}

export function clearQuizSession(
  userId: string,
  bookTitle: string,
  chapterId: string
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(getSessionKey(userId, bookTitle, chapterId));
  } catch (err) {
    console.warn("Error clearing quiz session:", err);
  }
}

export function clearAllBookSessions(userId: string, bookTitle: string): void {
  if (typeof window === "undefined") return;
  try {
    const cleanTitle = bookTitle.replace(/\s+/g, "_");
    const prefix = `codercup_quiz_${userId}_${cleanTitle}_`;
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }

    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }
  } catch (err) {
    console.warn("Error clearing all book sessions:", err);
  }
}
