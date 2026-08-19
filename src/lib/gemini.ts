import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion, QuizDifficulty } from "@/types/quiz";

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

interface RawGeminiQuestion {
  id?: string;
  question: string;
  options: string[];
  correctAnswerText: string;
  explanation?: string;
}

// JSON Schema definition for structured outputs using exact text matching
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
      correctAnswerText: {
        type: Type.STRING,
        description: "El texto exacto de la opción que es la respuesta correcta (debe coincidir con una de las 4 opciones)",
      },
      explanation: {
        type: Type.STRING,
        description: "Breve explicación de por qué esta opción es la correcta según el texto",
      },
    },
    required: ["id", "question", "options", "correctAnswerText"],
  },
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generic Fisher-Yates array shuffle.
 */
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

/**
 * Finds the index of the option that matches the correct answer text.
 * Prevents LLM off-by-one numeric indexing errors.
 */
function findCorrectIndex(options: string[], targetText?: string): number {
  if (!targetText) return 0;
  const normalizedTarget = targetText.trim().toLowerCase();

  // 1. Exact match
  const exactIndex = options.findIndex(
    (opt) => opt.trim().toLowerCase() === normalizedTarget
  );
  if (exactIndex >= 0) return exactIndex;

  // 2. Contains / Substring match
  const partialIndex = options.findIndex((opt) => {
    const normOpt = opt.trim().toLowerCase();
    return normOpt.includes(normalizedTarget) || normalizedTarget.includes(normOpt);
  });
  if (partialIndex >= 0) return partialIndex;

  return 0;
}

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
  const shuffledPaired = shuffleArray(paired);

  const shuffledOptions = shuffledPaired.map((p) => p.text);
  const newCorrectIndex = shuffledPaired.findIndex((p) => p.isCorrect);

  return {
    options: shuffledOptions,
    correctOptionIndex: newCorrectIndex >= 0 ? newCorrectIndex : 0,
  };
}

/**
 * Builds calibrated prompt tailored to the selected target audience / difficulty level.
 */
function buildCalibratedPrompt(
  chapterText: string,
  chapterTitle?: string,
  difficulty: QuizDifficulty = "medium"
): string {
  let audienceGuidelines = "";

  if (difficulty === "basic") {
    audienceGuidelines = `PÚBLICO OBJETIVO: Niños y escolares de Educación Básica / Primaria (8 a 12 años).
- LENGUAJE: Muy claro, directo, sencillo y amigable. No uses vocabulario rebuscado ni palabras difíciles.
- OPCIONES: Breves (1 sola línea corta por opción). Fáciles y rápidas de leer.
- ENFOQUE DE LAS 5 PREGUNTAS:
  1. Sentimientos y Emociones: ¿Cómo se sentía el personaje y por qué?
  2. Motivo evidente: ¿Por qué ocurrió un acontecimiento clave en la historia?
  3. Causa y consecuencia: ¿Qué pasó después de que un personaje tomó una decisión?
  4. Moraleja o Idea Central: ¿Qué enseñanza o mensaje importante nos deja este capítulo?
  5. Acción y desenlace: ¿Cómo se resolvió el momento más importante del capítulo?`;
  } else if (difficulty === "advanced") {
    audienceGuidelines = `PÚBLICO OBJETIVO: Lectores avanzados y adultos.
- LENGUAJE: Maduro, analítico y preciso.
- ENFOQUE DE LAS 5 PREGUNTAS:
  1. Dilema moral y psicología: ¿Qué conflicto ético o contradicción interna define a los personajes?
  2. Subtexto e inferencia: ¿Qué simbolismos, atmósfera o intenciones ocultas subyacen en la narrativa?
  3. Estructura y causalidad: ¿Qué cadena de causa-efecto altera la trama?
  4. Crítica y tema universal: ¿Qué reflexión profunda plantea este pasaje?
  5. Transformación del punto de vista: ¿Cómo cambia el tono o la perspectiva al concluir el capítulo?`;
  } else {
    // medium (default)
    audienceGuidelines = `PÚBLICO OBJETIVO: Jóvenes y estudiantes de Educación Media / Secundaria (13 a 17 años).
- LENGUAJE: Natural, dinámico y comprensible. Evita tecnicismos innecesarios.
- OPCIONES: Claramente redactadas, verosímiles y enfocadas en la trama.
- ENFOQUE DE LAS 5 PREGUNTAS:
  1. Motivación y conflicto: ¿Por qué un personaje toma cierta decisión o qué problema enfrenta?
  2. Inferencia y contexto: ¿Qué se puede deducir sobre la situación que no esté dicho con palabras literales?
  3. Causa y efecto: ¿Qué consecuencias directas tienen las acciones principales de este capítulo?
  4. Idea principal: ¿Cuál es el acontecimiento o tema central de este fragmento?
  5. Cambio de situación: ¿Cómo cambia la relación entre los personajes o el estado de las cosas a lo largo del capítulo?`;
  }

  return `Eres un docente y pedagogo experto en comprensión lectora y gamificación.
Tu objetivo es formular un desafío de COMPRENSIÓN LECTORA adaptado para el siguiente capítulo${
    chapterTitle ? ` titulado "${chapterTitle}"` : ""
  }.

${audienceGuidelines}

Prohibiciones estrictas en todas las dificultades:
- NUNCA formules preguntas de memorización de datos aislados (fechas, cifras numéricas secundarias, nombres propios de objetos o sustantivos sueltos que se puedan responder escaneando una sola frase).
- Cada pregunta debe requerir haber entendido el significado del pasaje.
- El campo "correctAnswerText" DEBE ser una copia literal y exacta de una de las 4 opciones del arreglo "options".

Texto del capítulo:
"""
${chapterText}
"""`;
}

/**
 * Generates 5 multiple-choice questions for a book chapter using Gemini AI.
 * Tailored to basic, medium, or advanced difficulty levels.
 */
export async function generateChapterQuiz(
  chapterText: string,
  chapterTitle?: string,
  difficulty: QuizDifficulty = "medium"
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

  const prompt = buildCalibratedPrompt(truncatedText, chapterTitle, difficulty);

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
          temperature: difficulty === "basic" ? 0.6 : 0.75,
          thinkingConfig: {
            thinkingBudget: 512,
          },
        },
      });

      const rawJson = response.text?.trim();
      if (!rawJson) {
        throw new Error("Gemini devolvió una respuesta vacía.");
      }

      const parsed = JSON.parse(rawJson) as RawGeminiQuestion[];

      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error("El formato de preguntas devuelto no es válido.");
      }

      // Match correct answer by text and shuffle options
      const validatedQuestions: QuizQuestion[] = parsed.slice(0, 5).map((q, index) => {
        const correctIndex = findCorrectIndex(q.options, q.correctAnswerText);
        const { options: shuffledOptions, correctOptionIndex: shuffledIndex } =
          shuffleOptionsAndIndex(q.options, correctIndex);

        return {
          id: q.id || `q${index + 1}`,
          question: q.question,
          options: shuffledOptions,
          correctOptionIndex: shuffledIndex,
          explanation: q.explanation || "",
        };
      });

      // Also shuffle the order of the 5 questions
      return shuffleArray(validatedQuestions);
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
