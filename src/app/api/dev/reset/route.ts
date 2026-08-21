import { NextResponse } from "next/server";
import { clearQuizStore } from "@/lib/quizStore";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Endpoint no disponible en producción." },
      { status: 403 }
    );
  }

  await clearQuizStore();

  return NextResponse.json({
    success: true,
    message: "Memoria caché de preguntas y progreso reiniciados correctamente.",
    timestamp: new Date().toISOString(),
  });
}
