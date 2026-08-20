import { NextRequest, NextResponse } from "next/server";
import { classifyChapterPlayability } from "@/lib/gemini";
import { classifySectionLocally } from "@/lib/chapterClassifier";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: chapterId } = await params;
    const body = await request.json();
    const { sectionTitle, snippetText, index, totalSections } = body;

    // 1. Evaluate local heuristics first (0ms)
    const localResult = classifySectionLocally(
      sectionTitle,
      snippetText,
      index,
      totalSections
    );

    if (!localResult.isAmbiguous) {
      return NextResponse.json({
        chapterId,
        isPlayable: localResult.isKnownPlayable,
        source: "local",
      });
    }

    // 2. If ambiguous, evaluate with Gemini AI
    const isPlayable = await classifyChapterPlayability(
      sectionTitle || `Capítulo ${chapterId}`,
      snippetText || ""
    );

    return NextResponse.json({
      chapterId,
      isPlayable,
      source: "ai",
    });
  } catch (error) {
    console.error("Error en POST /api/chapters/[id]/classify:", error);
    return NextResponse.json({ isPlayable: true, source: "fallback" });
  }
}
