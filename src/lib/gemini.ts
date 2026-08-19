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
 * Randomly shuffles options and recalculates the correctOptionIndex using Fisher-Yates algorithm.
 * Guarantees a 100% uniform 25% distribution across all 4 option positions (A, B, C, D).
 */
function shuffleOptionsAndIndex(
  options: string[],
  correctIndex: number
): { options: string[]; correctOptionIndex: number } {
  const safeOptions = Array.isArray(options) && options.length === 4 ? options : options.slice(0, 4);
  const safeCorrectIndex =
    typeof correctIndex === "number" && correctIndex >= 0 && correctIndex < safeOptions.length
      ? correctIndex
      : 0;

  const paired = safeOptions.map((text, idx) => ({
    text,
    isCorrect: idx === safeCorrectIndex,
  }));

  // Fisher-Yates shuffle
  for (let i = paired.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = paired[i];
    paired[i] = paired[j];
    paired[j] = temp;
  }

  const shuffledOptions = paired.map((p) => p.text);
  const newCorrectIndex = paired.findIndex((p) => p.isCorrect);

  return {
    options: shuffledOptions,
    correctOptionIndex: newCorrectIndex >= 0 ? newCorrectIndex : 0,
  };
}

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

  const prompt = `Eres un docente experto en análisis literario y comprensión crítica profunda.
Tu objetivo es formular un desafío de ALTO NIVEL DE COMPRENSIÓN para el lector sobre el siguiente capítulo${
    chapterTitle ? ` titulado "${chapterTitle}"` : ""
  }.

Prohibiciones estrictas:
- NUNCA formules preguntas fácticas o de memoria superficial, como "¿Qué objeto/animal tenía...?", "¿Cómo se llama...?", "¿Dónde ocurrió...?", "¿Qué comió...?".
- NUNCA hagas preguntas cuya respuesta sea un dato puntual que se pueda encontrar escaneando una sola frase sin entender el contexto.

Tipos de preguntas obligatorias (exactamente 5 en total):
1. Conflicto y Motivación: ¿Por qué un personaje toma cierta decisión o qué dilema emocional/moral enfrenta?
2. Inferencia y Subtexto: ¿Qué revela el comportamiento de los personajes, el tono o la atmósfera de la escena que no se dice explícitamente?
3. Causa y Efecto: ¿Qué consecuencias directas o indirectas desatan las acciones principales ocurridas en el capítulo?
4. Tema e Idea Central: ¿Cuál es el mensaje, crítica o significado más profundo de los acontecimientos de este fragmento?
5. Cambio o Transformación: ¿Cómo evoluciona la situación, el conflicto o la perspectiva de los personajes a lo largo de este pasaje?

Requisitos de las opciones:
- Las 4 opciones deben ser análisis profundos, matizados y verosímiles; ninguna debe descartarse por ser absurda o ridícula.
- Solo una opción debe ser la interpretación correcta basada en los hechos del texto.

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
          temperature: 0.75,
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

      // Format, validate, and randomly shuffle options to eliminate letter biases
      const validatedQuestions: QuizQuestion[] = parsed.slice(0, 5).map((q, index) => {
        const { options: shuffledOptions, correctOptionIndex: shuffledIndex } =
          shuffleOptionsAndIndex(q.options, q.correctOptionIndex);

        return {
          id: q.id || `q${index + 1}`,
          question: q.question,
          options: shuffledOptions,
          correctOptionIndex: shuffledIndex,
          explanation: q.explanation || "",
        };
      });

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
