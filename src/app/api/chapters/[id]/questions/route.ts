import { NextRequest, NextResponse } from "next/server";
import { getOrCreateSessionId } from "@/lib/session";
import { generateChapterQuiz } from "@/lib/gemini";
import {
  getChapterQuiz,
  saveChapterQuiz,
  getUserChapterProgress,
} from "@/lib/quizStore";

// Maximum execution duration allowed on Vercel Serverless (Hobby plan)
export const maxDuration = 60;

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id: chapterId } = await params;

    if (!chapterId) {
      return NextResponse.json(
        { error: "El identificador del capítulo es requerido." },
        { status: 400 }
      );
    }

    const sessionId = await getOrCreateSessionId();
    const userProgress = await getUserChapterProgress(sessionId, chapterId);

    // 1. Check if questions for this chapter are already cached
    const existingQuestions = await getChapterQuiz(chapterId);
    if (existingQuestions && existingQuestions.length > 0) {
      return NextResponse.json({
        sessionId,
        chapterId,
        isCached: true,
        remainingLives: userProgress.remainingLives,
        isCompleted: userProgress.isCompleted,
        questions: existingQuestions,
      });
    }

    // 2. If not cached yet, validate input chapterText
    const body = await request.json();
    const { chapterText, chapterTitle } = body;

    if (
      !chapterText ||
      typeof chapterText !== "string" ||
      chapterText.trim().length < 50
    ) {
      return NextResponse.json(
        {
          error:
            "Se requiere un texto de capítulo válido con al menos 50 caracteres para generar las preguntas.",
        },
        { status: 400 }
      );
    }

    // 3. Generate 5 structured questions with Gemini AI
    const questions = await generateChapterQuiz(chapterText, chapterTitle);

    // 4. Save questions in store for subsequent requests/retries
    await saveChapterQuiz(chapterId, questions, chapterTitle);

    return NextResponse.json({
      sessionId,
      chapterId,
      chapterTitle: chapterTitle || `Capítulo ${chapterId}`,
      isCached: false,
      remainingLives: userProgress.remainingLives,
      isCompleted: userProgress.isCompleted,
      questions,
    });
  } catch (error: unknown) {
    console.error("Error en POST /api/chapters/[id]/questions:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Error interno al generar las preguntas del capítulo.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
