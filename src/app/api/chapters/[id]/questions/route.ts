import { NextRequest, NextResponse } from "next/server";
import { getOrCreateSessionId } from "@/lib/session";
import { generateChapterQuiz } from "@/lib/gemini";
import {
  getChapterQuiz,
  saveChapterQuiz,
  deleteChapterQuiz,
  getUserChapterProgress,
} from "@/lib/quizStore";
import { QuizDifficulty } from "@/types/quiz";

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

    const body = await request.json();
    const {
      chapterText,
      chapterTitle,
      difficulty = "medium",
      forceFresh = false,
    } = body;
    const validatedDifficulty: QuizDifficulty =
      difficulty === "basic" || difficulty === "advanced" ? difficulty : "medium";

    const sessionId = await getOrCreateSessionId();
    const userProgress = await getUserChapterProgress(sessionId, chapterId);

    const cacheKey = `${chapterId}_${validatedDifficulty}`;

    // 1. Check if questions for this chapter and difficulty level are already cached (unless forceFresh is requested)
    if (!forceFresh) {
      const existingQuestions = await getChapterQuiz(cacheKey);
      if (existingQuestions && existingQuestions.length > 0) {
        return NextResponse.json({
          sessionId,
          chapterId,
          difficulty: validatedDifficulty,
          isCached: true,
          remainingLives: userProgress.remainingLives,
          isCompleted: userProgress.isCompleted,
          questions: existingQuestions,
        });
      }
    }

    // 2. Validate input chapterText
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

    // 3. Generate 5 structured questions with Gemini AI calibrated for the selected difficulty
    const questions = await generateChapterQuiz(
      chapterText,
      chapterTitle,
      validatedDifficulty
    );

    // 4. Save questions in store for subsequent requests/retries
    await saveChapterQuiz(cacheKey, questions, chapterTitle);

    return NextResponse.json({
      sessionId,
      chapterId,
      chapterTitle: chapterTitle || `Capítulo ${chapterId}`,
      difficulty: validatedDifficulty,
      isCached: false,
      remainingLives: userProgress.remainingLives,
      isCompleted: userProgress.isCompleted,
      questions,
    });
  } catch (error) {
    let errorMessage =
      "Gemini ha tardado demasiado en responder, intenta generar el quiz nuevamente.";

    if (error instanceof Error && error.message) {
      if (
        error.message.includes("identificador") ||
        error.message.includes("texto del capítulo")
      ) {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    await deleteChapterQuiz(chapterId);

    return NextResponse.json({
      success: true,
      message: `Caché de quiz eliminada para el capítulo ${chapterId}`,
    });
  } catch (error) {
    console.error("Error en DELETE /api/chapters/[id]/questions:", error);
    return NextResponse.json(
      { error: "Error al eliminar la caché del quiz." },
      { status: 500 }
    );
  }
}
