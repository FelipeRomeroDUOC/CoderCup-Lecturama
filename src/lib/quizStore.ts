import { QuizQuestion, ChapterProgress } from "@/types/quiz";

interface StoredQuiz {
  chapterId: string;
  chapterTitle?: string;
  questions: QuizQuestion[];
  createdAt: string;
}

interface QuizStorageState {
  quizzes: Map<string, StoredQuiz>;
  progress: Map<string, ChapterProgress>; // key: `${sessionId}:${chapterId}`
}

declare global {
  // eslint-disable-next-line no-var
  var __quizStorage: QuizStorageState | undefined;
}

// Preserve in-memory storage across hot reloads in development
const storage: QuizStorageState = global.__quizStorage || {
  quizzes: new Map(),
  progress: new Map(),
};

if (process.env.NODE_ENV !== "production") {
  global.__quizStorage = storage;
}

/**
 * Retrieves the cached 5 questions for a chapter if already generated, or null otherwise.
 */
export async function getChapterQuiz(
  chapterId: string
): Promise<QuizQuestion[] | null> {
  const stored = storage.quizzes.get(chapterId);
  return stored ? stored.questions : null;
}

/**
 * Saves the generated 5 questions for a chapter.
 */
export async function saveChapterQuiz(
  chapterId: string,
  questions: QuizQuestion[],
  chapterTitle?: string
): Promise<void> {
  storage.quizzes.set(chapterId, {
    chapterId,
    chapterTitle,
    questions,
    createdAt: new Date().toISOString(),
  });
}

/**
 * Deletes cached questions for a specific chapter/difficulty cache key,
 * or all difficulties starting with chapterId.
 */
export async function deleteChapterQuiz(
  cacheKeyOrChapterId: string
): Promise<void> {
  // Delete exact match
  storage.quizzes.delete(cacheKeyOrChapterId);

  // Delete all keys prefixed with chapterId (e.g. `${chapterId}_basic`, `${chapterId}_medium`, etc.)
  for (const key of storage.quizzes.keys()) {
    if (key.startsWith(`${cacheKeyOrChapterId}_`)) {
      storage.quizzes.delete(key);
    }
  }
}

/**
 * Retrieves or initializes the user progress for a chapter (defaults to 3 lives).
 */
export async function getUserChapterProgress(
  sessionId: string,
  chapterId: string
): Promise<ChapterProgress> {
  const key = `${sessionId}:${chapterId}`;
  let userProgress = storage.progress.get(key);

  if (!userProgress) {
    userProgress = {
      sessionId,
      chapterId,
      remainingLives: 3,
      isCompleted: false,
    };
    storage.progress.set(key, userProgress);
  }

  return userProgress;
}

/**
 * Updates remaining lives for a specific user and chapter (clamped between 0 and 3).
 */
export async function updateUserLives(
  sessionId: string,
  chapterId: string,
  remainingLives: number
): Promise<ChapterProgress> {
  const progress = await getUserChapterProgress(sessionId, chapterId);
  progress.remainingLives = Math.max(0, Math.min(3, remainingLives));
  return progress;
}

/**
 * Marks a chapter as completed/approved for the user session.
 */
export async function completeChapter(
  sessionId: string,
  chapterId: string,
  score?: number
): Promise<ChapterProgress> {
  const progress = await getUserChapterProgress(sessionId, chapterId);
  progress.isCompleted = true;
  if (typeof score === "number") {
    progress.score = score;
  }
  return progress;
}

/**
 * Developer helper: Clears all cached quizzes and user progress in memory.
 */
export async function clearQuizStore(): Promise<void> {
  storage.quizzes.clear();
  storage.progress.clear();
}
