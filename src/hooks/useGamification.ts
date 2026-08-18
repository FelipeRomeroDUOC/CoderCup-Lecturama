"use client";

import { useState, useEffect, useCallback } from "react";
import { Chapter } from "@/types/pdf";

interface UseGamificationProps {
  chapters: Chapter[];
  bookTitle?: string;
}

export function useGamification({ chapters, bookTitle = "default_book" }: UseGamificationProps) {
  const storageKey = `codercup_progress_${bookTitle.replace(/\s+/g, "_")}`;

  const [completedChapterIds, setCompletedChapterIds] = useState<string[]>([]);
  const [maxUnlockedIndex, setMaxUnlockedIndex] = useState<number>(0);

  // Load saved progress from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.completedChapterIds)) {
          setCompletedChapterIds(parsed.completedChapterIds);
        }
        if (typeof parsed.maxUnlockedIndex === "number") {
          setMaxUnlockedIndex(parsed.maxUnlockedIndex);
        }
      }
    } catch {
      // Ignore storage read errors
    }
  }, [storageKey]);

  // Persist progress changes to localStorage
  const saveProgress = useCallback(
    (completedIds: string[], unlockedIndex: number) => {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            completedChapterIds: completedIds,
            maxUnlockedIndex: unlockedIndex,
          })
        );
      } catch {
        // Ignore storage write errors
      }
    },
    [storageKey]
  );

  const isChapterCompleted = useCallback(
    (chapterId: string): boolean => {
      return completedChapterIds.includes(chapterId);
    },
    [completedChapterIds]
  );

  const isChapterUnlocked = useCallback(
    (chapterId: string, index: number): boolean => {
      // If no outline exists, everything is open
      if (chapters.length === 0) return true;

      // Chapter is unlocked if index <= maxUnlockedIndex or already marked completed
      return index <= maxUnlockedIndex || completedChapterIds.includes(chapterId);
    },
    [chapters.length, maxUnlockedIndex, completedChapterIds]
  );

  const markChapterCompleted = useCallback(
    (chapterId: string, currentIdx: number) => {
      const nextUnlocked = Math.max(maxUnlockedIndex, currentIdx + 1);
      const updatedCompleted = completedChapterIds.includes(chapterId)
        ? completedChapterIds
        : [...completedChapterIds, chapterId];

      setCompletedChapterIds(updatedCompleted);
      setMaxUnlockedIndex(nextUnlocked);
      saveProgress(updatedCompleted, nextUnlocked);
    },
    [completedChapterIds, maxUnlockedIndex, saveProgress]
  );

  const resetProgress = useCallback(() => {
    setCompletedChapterIds([]);
    setMaxUnlockedIndex(0);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Ignore
    }
  }, [storageKey]);

  return {
    completedChapterIds,
    maxUnlockedIndex,
    isChapterCompleted,
    isChapterUnlocked,
    markChapterCompleted,
    resetProgress,
  };
}
