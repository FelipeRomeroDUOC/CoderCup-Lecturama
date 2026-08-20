# Tarea 35: Detección Intra-Página y Subdivisión de Capítulos Extensos

## Descripción
Implementación de un detector de subcapítulos de precisión que escanea las páginas a cualquier altura vertical (no solo cabeceras) para identificar patrones como `"2. Las Cátedras de Virtudes"` y subdividir automáticamente capítulos macroscópicos del outline (de más de 4 páginas) en sub-niveles ágiles de 2 a 3 páginas.

## Propósito
- Evitar niveles excesivamente largos (de 50 a 80 páginas) que saturan el contexto de la IA y fatigan al lector.
- Brindar una experiencia de gamificación con quizzes frecuentes y relevantes en cada escena o subcapítulo.

## Componentes y Cambios
1. **`src/lib/visualChapterDetector.ts`**:
   - Escaneo de líneas en toda la altura de la página.
   - Detección de patrones numerados tipo `^\s*(\d{1,3})[\.\-\–\—\:]\s+([A-ZÁÉÍÓÚÑ].+)$`.
   - Función `detectSubchaptersInRange(pdfDocument, startPage, endPage)`.
2. **`src/hooks/useChapters.ts`**:
   - Subdivisión de capítulos extensos del outline en sus sub-niveles correspondientes.

## Rama
- `dev`
