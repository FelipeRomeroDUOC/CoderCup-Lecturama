"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Chapter } from "@/types/pdf";
import { isPreliminarySection } from "@/lib/chapterClassifier";
import { getClientUserId } from "@/lib/clientSession";

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
  const [userId, setUserId] = useState<string>("default_user");

  useEffect(() => {
    setUserId(getClientUserId());
  }, []);

  const storageKey = useMemo(() => {
    const cleanTitle = bookTitle.replace(/\s+/g, "_");
    return `codercup_${userId}_${cleanTitle}_progress`;
  }, [userId, bookTitle]);

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
    console.log(`[GAMIFICATION] chapters updated (count: ${chapters.length}), firstPlayableIndex: ${firstPlayableIndex}`);
    setMaxUnlockedIndex((prev) => (firstPlayableIndex > prev ? firstPlayableIndex : prev));
  }, [firstPlayableIndex, chapters.length]);

  // Load saved progress from localStorage on mount or when storageKey changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log(`[GAMIFICATION] Loaded progress from storage:`, parsed);
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
    (chapterId: string, index?: number): boolean => {
      // If no chapters, everything is open
      if (chapters.length === 0) return true;

      // Find global linear index of this chapter
      const globalIndex = chapters.findIndex((c) => c.id === chapterId);
      const targetIndex =
        globalIndex >= 0
          ? globalIndex
          : typeof index === "number"
          ? index
          : -1;
      const chapter = targetIndex >= 0 ? chapters[targetIndex] : null;

      // Preliminary/filler sections are always unlocked for free reading
      if (chapter && isFiller(chapter)) {
        return true;
      }

      // If chapter is already completed, it is unlocked
      if (completedChapterIds.includes(chapterId)) {
        return true;
      }

      // If found in global progression list
      if (targetIndex >= 0) {
        return targetIndex <= maxUnlockedIndex;
      }

      return false;
    },
    [chapters, maxUnlockedIndex, completedChapterIds, isFiller]
  );

  const markChapterCompleted = useCallback(
    (chapterId: string, currentIdx: number) => {
      // Idempotency guard: do nothing if already marked as completed
      if (completedChapterIds.includes(chapterId)) {
        return;
      }

      const nextUnlocked = Math.max(maxUnlockedIndex, currentIdx + 1);
      const updatedCompleted = [...completedChapterIds, chapterId];

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
    isChapterCompleted,
    isChapterUnlocked,
    markChapterCompleted,
    resetProgress,
    maxUnlockedIndex,
    completedChapterIds,
  };
}
