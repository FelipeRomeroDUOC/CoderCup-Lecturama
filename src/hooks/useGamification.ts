"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Chapter } from "@/types/pdf";
import { isPreliminarySection } from "@/lib/chapterClassifier";

interface UseGamificationProps {
  chapters: Chapter[];
  bookTitle?: string;
  nonPlayableChapterIds?: string[];
}

export function useGamification({
  chapters,
  bookTitle = "default_book",
  nonPlayableChapterIds = [],
}: UseGamificationProps) {
  const storageKey = `codercup_progress_${bookTitle.replace(/\s+/g, "_")}`;

  const isFiller = useCallback(
    (chapter?: Chapter): boolean => {
      if (!chapter) return false;
      return (
        isPreliminarySection(chapter.title) ||
        nonPlayableChapterIds.includes(chapter.id)
      );
    },
    [nonPlayableChapterIds]
  );

  // Find index of the first real playable chapter
  const firstPlayableIndex = useMemo(() => {
    const idx = chapters.findIndex((c) => !isFiller(c));
    return idx >= 0 ? idx : 0;
  }, [chapters, isFiller]);

  const [completedChapterIds, setCompletedChapterIds] = useState<string[]>([]);
  const [maxUnlockedIndex, setMaxUnlockedIndex] = useState<number>(firstPlayableIndex);

  // Update initial unlocked index when chapters load
  useEffect(() => {
    setMaxUnlockedIndex((prev) => Math.max(prev, firstPlayableIndex));
  }, [firstPlayableIndex]);

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
          setMaxUnlockedIndex((prev) => Math.max(prev, parsed.maxUnlockedIndex));
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

      const chapter = chapters[index];
      // Preliminary/filler sections are always unlocked for free reading
      if (isFiller(chapter)) {
        return true;
      }

      // Playable chapters unlock in sequence or if completed
      return index <= maxUnlockedIndex || completedChapterIds.includes(chapterId);
    },
    [chapters, maxUnlockedIndex, completedChapterIds, isFiller]
  );

  const markChapterCompleted = useCallback(
    (chapterId: string, currentIdx: number) => {
      // Advance to next index
      const nextUnlocked = Math.max(maxUnlockedIndex, currentIdx + 1);
      const updatedCompleted = completedChapterIds.includes(chapterId)
        ? completedChapterIds
        : [...completedChapterIds, chapterId];

      setCompletedChapterIds(updatedCompleted);
      setMaxUnlockedIndex(nextUnlocked);
      saveProgress(updatedCompleted, nextUnlocked);
    },
    [maxUnlockedIndex, completedChapterIds, saveProgress]
  );

  const resetProgress = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Ignore
    }
    setCompletedChapterIds([]);
    setMaxUnlockedIndex(firstPlayableIndex);
  }, [storageKey, firstPlayableIndex]);

  return {
    completedChapterIds,
    maxUnlockedIndex,
    isChapterCompleted,
    isChapterUnlocked,
    markChapterCompleted,
    resetProgress,
    firstPlayableIndex,
  };
}
