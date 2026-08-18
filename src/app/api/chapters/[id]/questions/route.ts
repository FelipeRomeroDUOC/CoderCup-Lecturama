import { NextRequest, NextResponse } from "next/server";
import { getOrCreateSessionId } from "@/lib/session";
import { generateChapterQuiz } from "@/lib/gemini";

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
    const { chapterText, chapterTitle } = body;

    if (
      !chapterText ||
      typeof chapterText !== "string" ||
      chapterText.trim().length < 50
    ) {
      return NextResponse.json(
        {
          error:
            "Se requiere un texto de capítulo válido con al menos 50 caracteres.",
        },
        { status: 400 }
      );
    }

    // Get or create anonymous session ID
    const sessionId = await getOrCreateSessionId();

    // Generate 5 structured questions with Gemini AI
    const questions = await generateChapterQuiz(chapterText, chapterTitle);

    return NextResponse.json({
      sessionId,
      chapterId,
      chapterTitle: chapterTitle || `Capítulo ${chapterId}`,
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
