/**
 * Keywords typically associated with introductory / non-playable front-matter sections.
 */
const PRELIMINARY_KEYWORDS = [
  "portada",
  "cover",
  "caratula",
  "carátula",
  "indice",
  "índice",
  "index",
  "tabla de contenido",
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
  "acknowledgements",
  "prefacio",
  "preface",
  "prologo",
  "prólogo",
  "prologue",
  "nota del editor",
  "nota de los editores",
  "editor's note",
  "advertencia",
  "sinopsis",
  "synopsis",
  "sobre el autor",
  "about the author",
];

/**
 * Checks if a chapter title corresponds to a preliminary / front-matter section
 * that should be free to read without triggering a quiz.
 */
export function isPreliminarySection(title?: string): boolean {
  if (!title) return false;

  const normalized = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  return PRELIMINARY_KEYWORDS.some((keyword) => {
    const normalizedKeyword = keyword
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    // Exact match or contains as full word/phrase
    return (
      normalized === normalizedKeyword ||
      normalized.startsWith(`${normalizedKeyword} `) ||
      normalized.endsWith(` ${normalizedKeyword}`) ||
      normalized.includes(` ${normalizedKeyword} `) ||
      normalized.includes(normalizedKeyword)
    );
  });
}
