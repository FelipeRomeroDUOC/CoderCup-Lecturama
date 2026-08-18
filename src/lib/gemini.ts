import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion } from "@/types/quiz";

// Initialize client on demand
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY no está configurada. Por favor define tu API key en el archivo .env.local"
    );
  }
  return new GoogleGenAI({ apiKey });
}

// JSON Schema definition for structured outputs
const quizResponseSchema = {
  type: Type.ARRAY,
  description: "Lista de exactamente 5 preguntas de opción múltiple sobre el capítulo",
  items: {
    type: Type.OBJECT,
    properties: {
      id: {
        type: Type.STRING,
        description: "Identificador único de la pregunta (ej: q1, q2, ...)",
      },
      question: {
        type: Type.STRING,
        description: "Enunciado claro de la pregunta de comprensión",
      },
      options: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Exactamente 4 opciones de respuesta distintas y plausibles",
      },
      correctOptionIndex: {
        type: Type.INTEGER,
        description: "Índice entero (0, 1, 2 o 3) de la opción correcta",
      },
      explanation: {
        type: Type.STRING,
        description: "Breve explicación de por qué la opción es correcta según el texto",
      },
    },
    required: ["id", "question", "options", "correctOptionIndex"],
  },
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generates 5 multiple-choice questions for a book chapter using Gemini AI.
 * Includes bounded retries (max 2 retries, 1s & 2s backoff) compatible with Vercel Serverless.
 */
export async function generateChapterQuiz(
  chapterText: string,
  chapterTitle?: string
): Promise<QuizQuestion[]> {
  const ai = getGeminiClient();
  const modelName = process.env.GEMINI_MODEL || "gemini-3.6-flash";

  const cleanText = chapterText.trim().replace(/\s+/g, " ");
  if (!cleanText || cleanText.length < 50) {
    throw new Error(
      "El texto del capítulo es demasiado corto para generar preguntas de comprensión."
    );
  }

  // Truncate to ~40.000 characters if chapter is exceptionally large to maintain fast responses
  const truncatedText =
    cleanText.length > 40000 ? cleanText.slice(0, 40000) + "..." : cleanText;

  const prompt = `Eres un asistente pedagógico de lectura y gamificación.
Tu objetivo es evaluar la comprensión lectora del usuario sobre el siguiente capítulo${
    chapterTitle ? ` titulado "${chapterTitle}"` : ""
  }.

Genera exactamente 5 preguntas de opción múltiple basadas exclusivamente en los hechos, ideas o acontecimientos narrados en el texto.
Cada pregunta debe tener exactamente 4 opciones, donde solo una es la correcta.

Texto del capítulo:
"""
${truncatedText}
"""`;

  const maxRetries = 2;
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: quizResponseSchema,
          temperature: 0.3,
        },
      });

      const rawJson = response.text?.trim();
      if (!rawJson) {
        throw new Error("Gemini devolvió una respuesta vacía.");
      }

      const parsed = JSON.parse(rawJson) as QuizQuestion[];

      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error("El formato de preguntas devuelto no es válido.");
      }

      // Format and validate questions
      const validatedQuestions: QuizQuestion[] = parsed.slice(0, 5).map((q, index) => ({
        id: q.id || `q${index + 1}`,
        question: q.question,
        options: Array.isArray(q.options) && q.options.length === 4 ? q.options : q.options.slice(0, 4),
        correctOptionIndex:
          typeof q.correctOptionIndex === "number" &&
          q.correctOptionIndex >= 0 &&
          q.correctOptionIndex <= 3
            ? q.correctOptionIndex
            : 0,
        explanation: q.explanation || "",
      }));

      return validatedQuestions;
    } catch (err: unknown) {
      lastError = err;
      const isRateLimit =
        err instanceof Error &&
        (err.message.includes("429") ||
          err.message.includes("RESOURCE_EXHAUSTED") ||
          err.message.includes("rate limit"));

      if (attempt < maxRetries && isRateLimit) {
        const backoffMs = (attempt + 1) * 1000; // 1s, then 2s
        await delay(backoffMs);
        continue;
      }

      // If not rate limit or reached max retries, throw
      break;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Error desconocido al generar las preguntas con Gemini.");
}
