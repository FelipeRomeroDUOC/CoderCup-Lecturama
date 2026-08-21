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

// Fixed model configurations
const QUESTIONS_PRIMARY_MODEL = "gemini-3.6-flash";
const QUESTIONS_FALLBACK_MODEL = "gemini-3.5-flash-lite";
const QUESTIONS_CANDIDATE_MODELS = [QUESTIONS_PRIMARY_MODEL, QUESTIONS_FALLBACK_MODEL];

const CLASSIFY_PRIMARY_MODEL = "gemma-4-31b-it";
const CLASSIFY_FALLBACK_MODEL = "gemini-3.5-flash-lite";
const CLASSIFY_CANDIDATE_MODELS = [CLASSIFY_PRIMARY_MODEL, CLASSIFY_FALLBACK_MODEL];

// Calibrated timeouts per task
const QUIZ_PRIMARY_TIMEOUT_MS = 25000; // 25 seconds for deep pedagogical reasoning with 8 questions
const QUIZ_FALLBACK_TIMEOUT_MS = 15000; // 15 seconds for fallback model
const CLASSIFY_TIMEOUT_MS = 6000; // 6 seconds for binary classification

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
  description: "Lista de exactamente 8 preguntas de opción múltiple sobre el capítulo",
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

// Schema for rapid playability classification of ambiguous sections
const playabilityResponseSchema = {
  type: Type.OBJECT,
  description: "Clasificación de si el fragmento es contenido jugable del libro o relleno/paratexto",
  properties: {
    isPlayable: {
      type: Type.BOOLEAN,
      description: "true si es contenido narrativo de la obra que amerita quiz, false si es relleno/paratexto editorial",
    },
  },
  required: ["isPlayable"],
};

/**
 * Executes a promise with a hard timeout to protect against slow LLM reasoning or server delays.
 */
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string
): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

/**
 * Safely extracts raw text from a Gemini API response.
 * Filters out internal thought chunks and extracts non-thought JSON content parts.
 */
function extractResponseText(response: unknown): string {
  if (!response || typeof response !== "object") return "";

  const resp = response as {
    text?: string;
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string; thought?: boolean }>;
      };
    }>;
  };

  if (typeof resp.text === "string" && resp.text.trim().length > 0) {
    return resp.text.trim();
  }

  const parts = resp.candidates?.[0]?.content?.parts;
  if (Array.isArray(parts)) {
    // 1. Search for non-thought text parts first
    const nonThoughtParts = parts.filter(
      (p) => !p.thought && typeof p.text === "string" && p.text.trim().length > 0
    );
    if (nonThoughtParts.length > 0) {
      return nonThoughtParts.map((p) => p.text).join("\n").trim();
    }

    // 2. Fallback to any text part
    const anyTextParts = parts.filter(
      (p) => typeof p.text === "string" && p.text.trim().length > 0
    );
    if (anyTextParts.length > 0) {
      return anyTextParts.map((p) => p.text).join("\n").trim();
    }
  }

  return "";
}

/**
 * Resilient JSON parser that strips markdown code fences and extracts raw JSON objects/arrays.
 */
function extractJsonFromText<T>(rawText?: string): T {
  if (!rawText) {
    throw new Error("Respuesta de IA vacía.");
  }

  let cleaned = rawText.trim();

  // 1. Remove markdown code blocks if wrapped in ```json ... ``` or ``` ... ```
  if (cleaned.includes("```")) {
    cleaned = cleaned.replace(/```(?:json)?\s*([\s\S]*?)\s*```/gi, "$1").trim();
  }

  // 2. Attempt standard JSON.parse
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // 3. Extract outermost JSON object { ... } or array [ ... ]
    const objectMatch = cleaned.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]) as T;
      } catch {
        // Continue
      }
    }

    const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[0]) as T;
      } catch {
        // Continue
      }
    }

    throw new Error(`No se pudo parsear el JSON de la respuesta: ${cleaned.slice(0, 100)}...`);
  }
}

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
- ENFOQUE DE LAS 8 PREGUNTAS:
  1. Sentimientos y Emociones: ¿Cómo se sentía el personaje y por qué?
  2. Motivo evidente: ¿Por qué ocurrió un acontecimiento clave en la historia?
  3. Causa y consecuencia: ¿Qué pasó después de que un personaje tomó una decisión?
  4. Vocabulario en contexto: elige una palabra del capítulo y pregunta qué significa TAL COMO se usa en esa parte de la historia (no su definición de diccionario). Las opciones deben ser palabras parecidas, pero solo una debe calzar con el sentido exacto de esa frase.
  5. Ir y volver en la historia: ¿Cómo se relaciona algo que pasó al principio del capítulo con algo que pasó más adelante?
  6. Moraleja o Idea Central: ¿Qué enseñanza o mensaje importante nos deja este capítulo?
  7. Acción y desenlace: ¿Cómo se resolvió el momento más importante del capítulo?
  8. Cómo es el personaje: ¿Cómo nos damos cuenta de cómo es un personaje: por lo que el cuento nos dice directamente sobre él, o por lo que hace y dice? (En texto no narrativo: ¿cómo nos explica el autor las cosas para que las entendamos bien — con ejemplos, comparaciones o datos?)`;
  } else if (difficulty === "advanced") {
    audienceGuidelines = `PÚBLICO OBJETIVO: Lectores avanzados y adultos.
- LENGUAJE: Maduro, analítico y preciso.
- ENFOQUE DE LAS 8 PREGUNTAS:
  1. Dilema moral y psicología: ¿Qué conflicto ético o contradicción interna define a los personajes? (En texto no narrativo: ¿qué tensión o contradicción interna atraviesa el argumento del autor?)
  2. Subtexto e inferencia: ¿Qué simbolismos, atmósfera o intenciones ocultas subyacen en la narrativa? (En texto no narrativo: ¿qué supuestos no explicitados sostienen el argumento?)
  3. Vocabulario en contexto: elige un término con matices o connotación específica en el pasaje, y pregunta su sentido preciso tal como se usa ahí, no su acepción general.
  4. Estructura y causalidad: ¿Qué cadena de causa-efecto altera la trama o el desarrollo del argumento?
  5. Relación entre partes del texto: ¿cómo se conecta, contrasta o se construye sobre sí misma una idea o escena presentada al inicio del capítulo respecto a cómo se desarrolla o resuelve hacia el final?
  6. Crítica y tema universal: ¿Qué reflexión profunda plantea este pasaje?
  7. Evaluación crítica: ¿qué tan confiable, sesgada o parcial es la perspectiva del narrador o autor? ¿qué evidencia dentro del texto sostiene o pone en duda esa perspectiva?
  8. Caracterización y construcción de mundo: ¿el personaje se construye mediante caracterización directa (el narrador lo describe explícitamente) o indirecta (se revela mediante sus acciones, diálogos o la percepción de otros personajes)? ¿Qué elementos de ambientación, atmósfera o simbolismo contribuyen a construir el mundo narrativo? (En texto no narrativo: ¿qué recursos retóricos, tipo de evidencia o modalizadores discursivos usa el autor para construir y sostener su argumento, y qué revelan sobre su postura?)`;
  } else {
    // medium (default)
    audienceGuidelines = `PÚBLICO OBJETIVO: Jóvenes y estudiantes de Educación Media / Secundaria (13 a 17 años).
- LENGUAJE: Natural, dinámico y comprensible. Evita tecnicismos innecesarios.
- OPCIONES: Claramente redactadas, verosímiles y enfocadas en la trama (o en las ideas, si el texto es expositivo/argumentativo).
- ENFOQUE DE LAS 8 PREGUNTAS:
  1. Motivación y conflicto: ¿Por qué un personaje toma cierta decisión o qué problema enfrenta? (En texto no narrativo: ¿qué motiva la postura o el argumento del autor?)
  2. Inferencia y contexto: ¿Qué se puede deducir sobre la situación que no esté dicho con palabras literales?
  3. Causa y efecto: ¿Qué consecuencias directas tienen las acciones o ideas principales de este capítulo?
  4. Vocabulario en contexto: elige un término del capítulo cuyo sentido dependa del contexto (no una palabra obvia) y pregunta su significado tal como se usa en ese pasaje específico.
  5. Relación entre partes del texto: ¿qué relación existe entre un fragmento puntual del capítulo (un párrafo, una escena, una idea) y el resto del capítulo? ¿Lo introduce, lo contradice, lo explica, lo resuelve?
  6. Idea principal: ¿Cuál es el acontecimiento, tema o argumento central de este fragmento?
  7. Evaluación: ¿qué tan sólida, coherente o verosímil es la actitud, decisión o argumento presentado? ¿hay algo que genere dudas o que no esté del todo justificado en el texto?
  8. Construcción de personajes y mundo: ¿Qué recursos usa el autor para mostrar cómo es un personaje o cómo es el lugar donde ocurre la historia (descripciones, acciones, diálogos, detalles del entorno)? ¿Nos lo dice directamente o lo deducimos nosotros? (En texto no narrativo: ¿qué recursos usa el autor para desarrollar y sostener su argumento — ejemplos, datos, comparaciones, tono?)`;
  }

  return `Eres un docente y pedagogo experto en comprensión lectora y gamificación.
Tu objetivo es formular un desafío de COMPRENSIÓN LECTORA adaptado para el siguiente capítulo${
    chapterTitle ? ` titulado "${chapterTitle}"` : ""
  }.

Antes de generar las preguntas, determina si el capítulo es de tipo NARRATIVO/DRAMÁTICO (tiene personajes, trama, diálogos) o EXPOSITIVO/ARGUMENTATIVO (desarrolla ideas, datos, una postura o argumento). Si es expositivo/argumentativo, adapta el enfoque de cada pregunta reemplazando referencias a "personajes" y "trama" por "ideas", "argumentos" y "postura del autor", manteniendo el mismo tipo de razonamiento exigido por cada punto del nivel.

${audienceGuidelines}

Prohibiciones estrictas en todas las dificultades:
- NUNCA formules preguntas de memorización de datos aislados (fechas, cifras numéricas secundarias, nombres propios de objetos o sustantivos sueltos que se puedan responder escaneando una sola frase).
- Cada pregunta debe exigir comprensión profunda del pasaje.
- El campo "correctAnswerText" DEBE ser una copia literal y exacta de una de las 4 opciones del arreglo "options".
- NUNCA uses términos absolutos fáciles de descartar en las opciones incorrectas (como "nunca", "siempre", "totalmente", "ninguno", "nadie").

Reglas psicométricas obligatorias para las opciones y distractores:
1. HOMOGENEIDAD TOTAL: Las 4 opciones de cada pregunta deben tener una longitud casi idéntica (mismo número aproximado de palabras y nivel de detalle) y comenzar con la misma estructura gramatical (mismo tiempo verbal o tipo de frase). Evita a toda costa que la respuesta correcta sea más larga, más elaborada, más matizada o más prudente que las demás.
2. TRAMPAS Y DISTRACTORES DE ALTA VEROSIMILITUD: Cada una de las 3 alternativas incorrectas debe sonar totalmente convincente y legítima para quien leyó superficialmente:
   - Distractor A (Trampa de Escaneo Literal): Emplea palabras clave o frases textuales reales del capítulo, pero atribuidas a otro momento, a una causa errónea o a otro personaje/idea.
   - Distractor B (Causalidad Invertida o Causa Falsa): Plantea una consecuencia muy razonable, pero invierte el orden de causa-efecto o sustituye la motivación real por una secundaria.
   - Distractor C (Sentido Común / Sobre-generalización): Afirma algo que parece moral o lógicamente verdadero en la vida real, pero que NO está respaldado por la evidencia específica del texto.
3. SUTILEZA DE LA RESPUESTA CORRECTA: La opción correcta debe responder al núcleo de la pregunta de manera directa, precisa y sobria, sin utilizar un lenguaje llamativo ni dar pistas sintácticas.

Texto del capítulo:
"""
${chapterText}
"""`;
}

/**
 * Classifies whether an ambiguous section is playable narrative content or filler/paratext.
 * Primary model: gemma-4-31b-it, Fast Fallback model: gemini-3.5-flash-lite.
 */
export async function classifyChapterPlayability(
  sectionTitle: string,
  snippetText: string
): Promise<boolean> {
  const ai = getGeminiClient();

  const prompt = `Eres un editor literario y clasificador pedagógico.
Tu tarea es determinar si el siguiente fragmento corresponde al CONTENIDO NARRATIVO/TEMÁTICO REAL de la obra (capítulo jugable con quiz) o si es simplemente PARATEXTO EDITORIAL / RELLENO (portada, dedicatoria, nota biográfica, advertencia editorial, agradecimientos, colofón, índice o anexo).

Título de la sección: "${sectionTitle}"
Texto inicial:
"""
${snippetText.slice(0, 1500)}
"""

Devuelve un JSON estrictamente con { "isPlayable": boolean }.`;

  for (const modelName of CLASSIFY_CANDIDATE_MODELS) {
    try {
      const config: Record<string, unknown> = {
        responseMimeType: "application/json",
        responseSchema: playabilityResponseSchema,
        temperature: 0.1,
        maxOutputTokens: 1024,
      };

      const response = await withTimeout(
        ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: config as any,
        }),
        CLASSIFY_TIMEOUT_MS,
        `Timeout de ${CLASSIFY_TIMEOUT_MS}ms en classify con modelo ${modelName}`
      );

      const rawText = extractResponseText(response);
      if (!rawText) return true;

      try {
        const parsed = extractJsonFromText<{ isPlayable?: boolean }>(rawText);
        if (typeof parsed.isPlayable === "boolean") {
          return parsed.isPlayable;
        }
      } catch {
        // Fallback to regex boolean extraction if JSON has markdown or trailing words
        const match = rawText.match(/"isPlayable"\s*:\s*(true|false)/i);
        if (match) {
          return match[1].toLowerCase() === "true";
        }
      }

      return true;
    } catch (error) {
      console.warn(
        `Modelo ${modelName} falló o excedió timeout en classify, conmutando al siguiente:`,
        error instanceof Error ? error.message : error
      );
      // Fast fallback to next model immediately
      continue;
    }
  }

  // Safe fallback if all models fail
  return true;
}

/**
 * Generates 8 multiple-choice questions for a book chapter using Gemini AI.
 * Primary model: gemini-3.5-flash (22s), Fast Fallback model: gemini-3.5-flash-lite (10s).
 */
export async function generateChapterQuiz(
  chapterText: string,
  chapterTitle?: string,
  difficulty: QuizDifficulty = "medium"
): Promise<QuizQuestion[]> {
  const ai = getGeminiClient();

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

  let lastError: unknown = null;

  for (const modelName of QUESTIONS_CANDIDATE_MODELS) {
    try {
      const config: Record<string, unknown> = {
        responseMimeType: "application/json",
        responseSchema: quizResponseSchema,
        temperature: difficulty === "basic" ? 0.6 : 0.75,
        maxOutputTokens: 4096,
      };

      const timeoutMs =
        modelName === QUESTIONS_PRIMARY_MODEL
          ? QUIZ_PRIMARY_TIMEOUT_MS
          : QUIZ_FALLBACK_TIMEOUT_MS;

      const response = await withTimeout(
        ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: config as any,
        }),
        timeoutMs,
        `Timeout de ${timeoutMs}ms en generateQuiz con modelo ${modelName}`
      );

      const rawText = extractResponseText(response);
      if (!rawText) {
        throw new Error("Gemini devolvió una respuesta vacía.");
      }

      const parsed = extractJsonFromText<RawGeminiQuestion[]>(rawText);

      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error("El formato de preguntas devuelto no es válido.");
      }

      // Match correct answer by text and shuffle options
      const validatedQuestions: QuizQuestion[] = parsed.slice(0, 8).map((q, index) => {
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

      // Also shuffle the order of the 8 questions
      return shuffleArray(validatedQuestions);
    } catch (err: unknown) {
      lastError = err;
      console.warn(
        `Modelo ${modelName} falló o tardó demasiado, conmutando inmediatamente al siguiente modelo:`,
        err instanceof Error ? err.message : err
      );
      // Fast fallback to next model immediately without waiting
      continue;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(
        "Los modelos de IA de Google están experimentando alta demanda temporal. Por favor reintenta en unos instantes."
      );
}
