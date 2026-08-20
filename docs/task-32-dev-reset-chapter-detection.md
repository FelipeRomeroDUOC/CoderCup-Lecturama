# Tarea 32: Reinicio Completo de Detección de Capítulos y Clasificación en Botón Dev

## Descripción
Ampliación de la acción del botón `🛠️ Reset [DEV]` para que, además de bloquear los niveles y limpiar preguntas en caché, vacíe el estado de capítulos de relleno detectados (`nonPlayableChapterIds`) y re-ejecute la extracción y clasificación del índice del PDF desde cero.

## Propósito
- Permitir probar iterativamente las reglas de clasificación y extracción de capítulos en el mismo PDF sin necesidad de recargar la página o volver a subir el archivo.

## Componentes y Cambios
1. **`src/components/PdfReader.tsx`**:
   - `handleDevReset`: Limpia `nonPlayableChapterIds`, ejecuta `extractChapters(pdfDocument, numPages)`, reinicia el progreso y navega a la página 1.

## Rama
- `dev`
