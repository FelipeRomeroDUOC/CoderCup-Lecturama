# Tarea 30: Detección Híbrida Inteligente de Contenido y Relleno (A + B)

## Descripción
Implementación de un sistema de detección en dos fases (Heurísticas locales extendidas + Clasificación semántica ligera con IA para ambigüedades) que identifica automáticamente páginas de relleno (portada, índice, prólogo, copyright, notas editoriales, glosario, anexos y bibliografía).

## Propósito
- Evitar que el lector sea evaluado en secciones de paratexto editorial o relleno.
- Desbloquear automáticamente estas secciones para lectura libre continua.

## Componentes y Cambios
1. **`src/lib/chapterClassifier.ts`**:
   - Diccionario ampliado de *Front-Matter* y *Back-Matter*.
   - Detector de metadatos editoriales (ISBN, Depósito Legal, Copyright).
   - Identificador de ambigüedad posicional y de densidad.
2. **`src/lib/gemini.ts`**:
   - Función `classifyChapterPlayability`: Clasificación ultrarrápida (JSON `{ "isPlayable": boolean }`) para resolver títulos o secciones ambiguas.
3. **`src/app/api/chapters/[id]/classify/route.ts`**:
   - Endpoint `POST /api/chapters/[id]/classify` para resolver ambigüedades desde el cliente.
4. **`src/hooks/useGamification.ts` & `src/components/PdfReader.tsx`**:
   - Integración para reconocer secciones de relleno clasificadas dinámicamente.

## Rama
- `dev`
