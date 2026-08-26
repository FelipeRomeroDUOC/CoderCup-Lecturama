import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
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

// Permissive safety settings for literary and pedagogical analysis (avoids false-positive content blocking)
const EDUCATIONAL_SAFETY_SETTINGS = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

// Fixed model configurations
const QUESTIONS_PRIMARY_MODEL = "gemini-3.5-flash-lite";
const QUESTIONS_FALLBACK_MODEL = "gemini-3.1-flash-lite";
const QUESTIONS_CANDIDATE_MODELS = [QUESTIONS_PRIMARY_MODEL, QUESTIONS_FALLBACK_MODEL];

const CLASSIFY_PRIMARY_MODEL = "gemma-4-31b-it";
const CLASSIFY_FALLBACK_MODEL = "gemini-3.1-flash-lite";
const CLASSIFY_CANDIDATE_MODELS = [CLASSIFY_PRIMARY_MODEL, CLASSIFY_FALLBACK_MODEL];

// Calibrated timeouts per task
const QUIZ_PRIMARY_TIMEOUT_MS = 20000; // 20 seconds for fast lite model (takes ~2.8s)
const QUIZ_FALLBACK_TIMEOUT_MS = 30000; // 30 seconds for deep fallback model
const CLASSIFY_TIMEOUT_MS = 6000; // 6 seconds for binary classification

interface RawGeminiQuestion {
  id?: string;
  question: string;
  explanation: string;
  options: string[];
  correctOptionIndex?: number;
  correctAnswerText: string;
}

// JSON Schema definition for structured outputs using Rationale-First (Chain-of-Thought) ordering
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
      explanation: {
        type: Type.STRING,
        description:
          "Razonamiento pedagógico previo: analiza por qué la respuesta correcta es la adecuada y fundamenta la idea en el texto, sin incluir notas de formato ni metainstrucciones.",
      },
      options: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Exactamente 4 opciones de respuesta distintas y verosímiles donde una es la correcta descrita en tu explicación",
      },
      correctOptionIndex: {
        type: Type.INTEGER,
        description: "Índice numérico (0, 1, 2 o 3) de la opción correcta dentro del arreglo options",
      },
      correctAnswerText: {
        type: Type.STRING,
        description: "Copia literal y exacta del texto de la opción correcta",
      },
    },
    required: ["id", "question", "explanation", "options", "correctAnswerText"],
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
 * Filters out internal thought chunks, inspects all candidates and extracts non-thought JSON content.
 */
function extractResponseText(response: unknown): string {
  if (!response || typeof response !== "object") return "";

  const resp = response as any;

  // 1. Direct text property or getter function with error protection
  try {
    const directText = typeof resp.text === "function" ? resp.text() : resp.text;
    if (typeof directText === "string" && directText.trim().length > 0) {
      return directText.trim();
    }
  } catch {
    // Ignore getter invocation issues
  }

  // 2. Iterate through candidates and parts
  const candidate = resp.candidates?.[0];
  if (!candidate) {
    if (resp.promptFeedback?.blockReason) {
      throw new Error(
        `Contenido bloqueado por filtro de seguridad de Gemini: ${resp.promptFeedback.blockReason}`
      );
    }
    return "";
  }

  if (candidate.finishReason && candidate.finishReason !== "STOP") {
    console.warn(`[GEMINI] Finish reason no estándar: ${candidate.finishReason}`);
  }

  const parts = candidate.content?.parts;
  if (Array.isArray(parts) && parts.length > 0) {
    // 2.1 Search for non-thought text parts first
    const nonThoughtParts = parts.filter(
      (p: any) => !p.thought && typeof p.text === "string" && p.text.trim().length > 0
    );
    if (nonThoughtParts.length > 0) {
      return nonThoughtParts.map((p: any) => p.text).join("\n").trim();
    }

    // 2.2 Fallback to any text part
    const anyTextParts = parts.filter(
      (p: any) => typeof p.text === "string" && p.text.trim().length > 0
    );
    if (anyTextParts.length > 0) {
      return anyTextParts.map((p: any) => p.text).join("\n").trim();
    }
  }

  return "";
}

/**
 * Resilient JSON parser that strips markdown code fences and extracts raw JSON objects/arrays.
 * Prioritizes array matching for quiz question sets.
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
    // 3. Extract outermost JSON array [ ... ] first for question lists
    const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[0]) as T;
      } catch {
        // Continue
      }
    }

    // 4. Extract outermost JSON object { ... }
    const objectMatch = cleaned.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]) as T;
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
 * Sanitizes explanation string to remove leaked prompt rules, meta-notes, or JSON references.
 */
function sanitizeExplanation(rawExplanation?: string): string {
  if (!rawExplanation) return "";
  let clean = rawExplanation.trim();

  // Strip leading meta-rules like "Nota: ...", "Nota formativa: ...", "Regla: ...", "Instrucción: ..."
  clean = clean.replace(
    /^(nota(\s+formativa)?|regla|instrucci[oó]n|importante|aviso|atenci[oó]n)\s*:\s*.*?(?=(\.|\n|$))/i,
    ""
  );

  // Strip references to prompt internal rules if leaked
  clean = clean.replace(
    /^(la\s+opci[oó]n\s+correcta\s+debe\s+coincidir.*?(?=(\.|\n|$)))/i,
    ""
  );
  clean = clean.replace(/^(\.\s*|\n+)+/, "");

  return clean.trim() || rawExplanation.trim();
}

/**
 * Calculates lexical term overlap between an option and the pedagogical explanation.
 * Used as a deterministic fallback cross-check to resolve discrepancies.
 */
function calculateSemanticOverlap(optionText: string, explanationText: string): number {
  const stopWords = new Set([
    "el", "la", "los", "las", "un", "una", "unos", "unas", "de", "del", "a", "al",
    "en", "con", "por", "para", "que", "se", "su", "sus", "es", "son", "fue", "eran",
    "y", "e", "o", "u", "pero", "como", "más", "este", "esta", "estos", "estas"
  ]);

  const extractTokens = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter((word) => word.length > 3 && !stopWords.has(word));

  const optionTokens = new Set(extractTokens(optionText));
  const explanationTokens = extractTokens(explanationText);

  if (optionTokens.size === 0 || explanationTokens.length === 0) return 0;

  let matches = 0;
  for (const token of explanationTokens) {
    if (optionTokens.has(token)) {
      matches++;
    }
  }

  return matches / Math.max(optionTokens.size, 1);
}

/**
 * Resolves the definitive correct option index via multi-layer cross-validation:
 * 1. Exact textual match between correctAnswerText and options.
 * 2. Exact index match if options[correctOptionIndex] matches correctAnswerText.
 * 3. Substring/partial match.
 * 4. Semantic term overlap with explanation to resolve any discrepancy.
 */
function resolveCorrectOptionIndex(
  options: string[],
  correctAnswerText?: string,
  rawCorrectIndex?: number,
  explanation?: string
): number {
  if (!Array.isArray(options) || options.length === 0) return 0;

  const normalizedOptions = options.map((opt) => opt.trim().toLowerCase());
  const normalizedTarget = (correctAnswerText || "").trim().toLowerCase();

  // 1. Check exact textual match
  if (normalizedTarget) {
    const exactMatchIndex = normalizedOptions.indexOf(normalizedTarget);
    if (exactMatchIndex >= 0) {
      return exactMatchIndex;
    }
  }

  // 2. Check if rawCorrectIndex is valid and points to a plausible match
  if (
    typeof rawCorrectIndex === "number" &&
    rawCorrectIndex >= 0 &&
    rawCorrectIndex < options.length
  ) {
    const optionAtIndex = normalizedOptions[rawCorrectIndex];
    if (
      normalizedTarget &&
      (optionAtIndex.includes(normalizedTarget) || normalizedTarget.includes(optionAtIndex))
    ) {
      return rawCorrectIndex;
    }
  }

  // 3. Substring / partial text search
  if (normalizedTarget.length > 3) {
    const partialMatchIndex = normalizedOptions.findIndex(
      (opt) => opt.includes(normalizedTarget) || normalizedTarget.includes(opt)
    );
    if (partialMatchIndex >= 0) {
      return partialMatchIndex;
    }
  }

  // 4. Cross-validation fallback: Semantic overlap with explanation
  if (explanation && explanation.length > 10) {
    let bestIndex = 0;
    let highestScore = -1;

    options.forEach((opt, idx) => {
      const score = calculateSemanticOverlap(opt, explanation);
      if (score > highestScore) {
        highestScore = score;
        bestIndex = idx;
      }
    });

    if (highestScore > 0) {
      return bestIndex;
    }
  }

  // Safe fallback if rawCorrectIndex is within range
  if (
    typeof rawCorrectIndex === "number" &&
    rawCorrectIndex >= 0 &&
    rawCorrectIndex < options.length
  ) {
    return rawCorrectIndex;
  }

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
 * Builds calibrated system instruction tailored to the selected target audience / difficulty level.
 */
function buildCalibratedSystemInstruction(
  difficulty: QuizDifficulty = "medium",
  chapterTitle?: string
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
Tu objetivo es formular un desafío de COMPRENSIÓN LECTORA de exactamente 8 preguntas adaptado para el capítulo${chapterTitle ? ` titulado "${chapterTitle}"` : ""
    }.

Antes de generar las preguntas, determina si el texto es de tipo NARRATIVO/DRAMÁTICO (tiene personajes, trama, diálogos) o EXPOSITIVO/ARGUMENTATIVO (desarrolla ideas, datos, una postura o argumento). Si es expositivo/argumentativo, adapta el enfoque de cada pregunta reemplazando referencias a "personajes" y "trama" por "ideas", "argumentos" y "postura del autor", manteniendo el mismo tipo de razonamiento exigido por cada punto del nivel.

${audienceGuidelines}

Pautas estrictas para todas las dificultades:
- Cada pregunta debe exigir comprensión profunda del significado del pasaje y evitar memorización de cifras o datos aislados sin relevancia temática.
- Orden secuencial obligatorio de generación:
  1. Redacta primero el campo "explanation" analizando pedagógicamente el pasaje y explicando cuál es la respuesta correcta y por qué los distractores fallan.
  2. Luego redacta las 4 opciones en el arreglo "options".
  3. Finalmente asigna "correctOptionIndex" (0, 1, 2 o 3) y copia exactamente el texto en "correctAnswerText".
- La "explanation" debe ser 100% pedagógica para el estudiante. NUNCA incluyas la palabra "Nota:", avisos de formato ni referencias al JSON.
- Evita opciones extremas con palabras como "nunca" o "siempre" que permitan descartar respuestas fácilmente.

Directrices psicométricas para las opciones y distractores:
1. HOMOGENEIDAD TOTAL: Las 4 opciones de cada pregunta deben tener una longitud casi idéntica (mismo número aproximado de palabras y nivel de detalle) y comenzar con la misma estructura gramatical. Evita que la respuesta correcta sea más larga o más detallada que las demás.
2. DISTRACTORES DE ALTA VEROSIMILITUD: Cada una de las 3 alternativas incorrectas debe sonar totalmente convincente y legítima para quien leyó con rapidez:
   - Distractor A (Lectura Rápida): Emplea palabras clave reales del capítulo, pero atribuidas a otro momento, a una causa errónea o a otro personaje/idea.
   - Distractor B (Causalidad Alterada): Plantea una consecuencia muy razonable, pero invierte la relación causa-efecto o confunde motivos.
   - Distractor C (Sentido Común / Sobre-generalización): Afirma algo que parece lógico en la vida real, pero que no está respaldado directamente por el texto del capítulo.
3. SUTILEZA DE LA RESPUESTA CORRECTA: La opción correcta debe responder al núcleo de la pregunta de manera directa, precisa y sobria.`;
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

  const systemInstruction = `Eres un editor literario y clasificador pedagógico.
Tu tarea es determinar si el siguiente fragmento corresponde al CONTENIDO NARRATIVO/TEMÁTICO REAL de la obra (capítulo jugable con quiz) o si es simplemente PARATEXTO EDITORIAL / RELLENO (portada, dedicatoria, nota biográfica, advertencia editorial, agradecimientos, colofón, índice o anexo).
Devuelve un JSON estrictamente con { "isPlayable": boolean }.`;

  const payload = `Título de la sección: "${sectionTitle}"\nTexto inicial:\n"""\n${snippetText.slice(0, 1500)}\n"""`;

  for (const modelName of CLASSIFY_CANDIDATE_MODELS) {
    try {
      const config: Record<string, unknown> = {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: playabilityResponseSchema,
        temperature: 0.1,
        maxOutputTokens: 1024,
        safetySettings: EDUCATIONAL_SAFETY_SETTINGS,
      };

      const response = await withTimeout(
        ai.models.generateContent({
          model: modelName,
          contents: payload,
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
 * Primary model: gemini-3.5-flash-lite (2.8s), Fallback model: gemini-3.6-flash.
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

  const systemInstruction = buildCalibratedSystemInstruction(difficulty, chapterTitle);
  const chapterPayload = `Texto del capítulo a evaluar:\n"""\n${truncatedText}\n"""`;

  let lastError: unknown = null;

  for (const modelName of QUESTIONS_CANDIDATE_MODELS) {
    try {
      const supportsThinking = modelName.toLowerCase().startsWith("gemini");
      const config: Record<string, unknown> = {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: quizResponseSchema,
        temperature: difficulty === "basic" ? 0.6 : 0.75,
        maxOutputTokens: 8192,
        safetySettings: EDUCATIONAL_SAFETY_SETTINGS,
      };

      if (supportsThinking) {
        config.thinkingConfig = { thinkingBudget: 512 };
      }

      const timeoutMs =
        modelName === QUESTIONS_PRIMARY_MODEL
          ? QUIZ_PRIMARY_TIMEOUT_MS
          : QUIZ_FALLBACK_TIMEOUT_MS;

      const response = await withTimeout(
        ai.models.generateContent({
          model: modelName,
          contents: chapterPayload,
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

      // Multi-layer cross-validation of correct answer and option shuffling
      const validatedQuestions: QuizQuestion[] = parsed.slice(0, 8).map((q, index) => {
        const cleanExplanation = sanitizeExplanation(q.explanation);
        const correctIndex = resolveCorrectOptionIndex(
          q.options,
          q.correctAnswerText,
          q.correctOptionIndex,
          cleanExplanation
        );
        const { options: shuffledOptions, correctOptionIndex: shuffledIndex } =
          shuffleOptionsAndIndex(q.options, correctIndex);

        return {
          id: q.id || `q${index + 1}`,
          question: q.question,
          options: shuffledOptions,
          correctOptionIndex: shuffledIndex,
          explanation: cleanExplanation,
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

  console.error("Todos los modelos de generación de preguntas fallaron:", lastError);
  throw new Error(
    "Gemini ha tardado demasiado en responder, intenta generar el quiz nuevamente."
  );
}
