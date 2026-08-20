/**
 * Comprehensive list of Front-Matter (introductory) keywords.
 */
const FRONT_MATTER_KEYWORDS = [
  "portada",
  "cover",
  "caratula",
  "carátula",
  "indice",
  "índice",
  "index",
  "tabla de contenido",
  "tabla de materias",
  "table of contents",
  "sumario",
  "copyright",
  "derechos",
  "creditos",
  "créditos",
  "pagina legal",
  "página legal",
  "dedicatoria",
  "dedication",
  "agradecimiento",
  "agradecimientos",
  "acknowledgment",
  "acknowledgments",
  "prefacio",
  "preface",
  "prologo",
  "prólogo",
  "prologue",
  "nota del editor",
  "nota de los editores",
  "nota preliminar",
  "editor's note",
  "advertencia",
  "al lector",
  "a los lectores",
  "presentacion",
  "presentación",
  "introduccion editorial",
  "introducción editorial",
  "epigrafe",
  "epígrafe",
  "sinopsis",
  "synopsis",
  "sobre el autor",
  "sobre la autora",
  "about the author",
  "semblanza",
  "ilustraciones",
  "guia de lectura",
  "guía de lectura",
];

/**
 * Comprehensive list of Back-Matter (concluding / reference) keywords.
 */
const BACK_MATTER_KEYWORDS = [
  "epilogo",
  "epílogo",
  "epilogue",
  "apendice",
  "apéndice",
  "apendices",
  "apéndices",
  "appendix",
  "anexo",
  "anexos",
  "glosario",
  "glossary",
  "bibliografia",
  "bibliografía",
  "bibliography",
  "fuentes",
  "colofon",
  "colofón",
  "colophon",
  "indice analitico",
  "índice analítico",
  "indice onomastico",
  "índice onomástico",
  "notas finales",
  "notas al pie",
  "otras obras",
  "otros titulos",
  "otros títulos",
  "sobre esta edicion",
  "sobre esta edición",
  "acerca de esta obra",
];

/**
 * Regex patterns identifying legal / editorial metadata pages (ISBN, registry, printing, copyright).
 */
const LEGAL_METADATA_PATTERNS = [
  /\bisbn\b/i,
  /\bdep[oó]sito\s+legal\b/i,
  /\bderechos\s+reservados\b/i,
  /\ball\s+rights\s+reserved\b/i,
  /\bimpreso\s+en\b/i,
  /\bprinted\s+in\b/i,
  /\bprimera\s+edici[oó]n\b/i,
  /\btalleres\s+gr[aá]ficos\b/i,
  /\beditorial\b/i,
];

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Checks if a title matches front-matter or back-matter dictionary keywords.
 */
export function isPreliminarySection(title?: string): boolean {
  if (!title) return false;

  const normalized = normalizeString(title);
  const allKeywords = [...FRONT_MATTER_KEYWORDS, ...BACK_MATTER_KEYWORDS];

  return allKeywords.some((keyword) => {
    const normKey = normalizeString(keyword);
    return (
      normalized === normKey ||
      normalized.startsWith(`${normKey} `) ||
      normalized.endsWith(` ${normKey}`) ||
      normalized.includes(` ${normKey} `) ||
      normalized.includes(normKey)
    );
  });
}

/**
 * Checks if text contains explicit legal / publication metadata signatures.
 */
export function hasLegalMetadata(text?: string): boolean {
  if (!text) return false;
  return LEGAL_METADATA_PATTERNS.some((pattern) => pattern.test(text));
}

/**
 * Checks if text content has very low word density (< 60 words).
 */
export function isShortFillerContent(text?: string): boolean {
  if (!text) return true;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return wordCount < 60;
}

/**
 * Determines if a chapter/section is locally known as filler, clearly playable, or ambiguous.
 */
export function classifySectionLocally(
  title?: string,
  textSnippet?: string,
  index?: number,
  totalSections?: number
): { isKnownFiller: boolean; isKnownPlayable: boolean; isAmbiguous: boolean } {
  // 1. Clearly Filler by dictionary or legal metadata
  if (isPreliminarySection(title) || hasLegalMetadata(textSnippet)) {
    return { isKnownFiller: true, isKnownPlayable: false, isAmbiguous: false };
  }

  const wordCount = textSnippet
    ? textSnippet.trim().split(/\s+/).filter(Boolean).length
    : 0;

  // 2. Ultra-short content without explicit chapter title
  if (wordCount > 0 && wordCount < 60) {
    return { isKnownFiller: true, isKnownPlayable: false, isAmbiguous: false };
  }

  const normTitle = title ? normalizeString(title) : "";
  const isExplicitChapter =
    /^cap[ií]tulo\s+(\d+|[ivxlcdm]+)/i.test(normTitle) ||
    /^acto\s+(\d+|[ivxlcdm]+)/i.test(normTitle) ||
    /^parte\s+(\d+|[ivxlcdm]+)/i.test(normTitle);

  // 3. Clearly playable if explicit chapter numbering with sufficient content
  if (isExplicitChapter && wordCount >= 200) {
    return { isKnownFiller: false, isKnownPlayable: true, isAmbiguous: false };
  }

  // 4. Ambiguous check: first 2 or last 2 sections without standard chapter numbering
  const isBoundaryPosition =
    typeof index === "number" &&
    typeof totalSections === "number" &&
    (index <= 1 || index >= totalSections - 2);

  if (isBoundaryPosition || (wordCount >= 60 && wordCount <= 250)) {
    return { isKnownFiller: false, isKnownPlayable: false, isAmbiguous: true };
  }

  // Default assumption for general mid-book chapters
  return { isKnownFiller: false, isKnownPlayable: true, isAmbiguous: false };
}
