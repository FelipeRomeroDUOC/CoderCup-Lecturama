import { NextResponse } from "next/server";
import { clearQuizStore } from "@/lib/quizStore";

export async function POST() {
  await clearQuizStore();

  return NextResponse.json({
    success: true,
    message: "Memoria caché de preguntas y progreso reiniciados correctamente.",
    timestamp: new Date().toISOString(),
  });
}
