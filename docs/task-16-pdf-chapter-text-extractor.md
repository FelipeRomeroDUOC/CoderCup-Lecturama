# Tarea 16: Extractor Automático de Texto de Capítulos desde PDF

## Descripción
Implementación de la utilidad `extractChapterText` para extraer de forma asíncrona el contenido textual plano de un rango de páginas de un PDF utilizando las APIs internas de `pdfjs-dist`.

## Propósito
- Permitir al cliente obtener el texto completo de cualquier capítulo leído y enviarlo automáticamente al backend (`/api/chapters/[id]/questions`) para generar las preguntas de comprensión con Gemini AI.

## Componentes y Cambios
1. **`src/lib/pdfTextExtractor.ts`**:
   - Función `extractChapterText(pdf, startPage, endPage)` que itera las páginas solicitadas, extrae los ítems de texto con `page.getTextContent()`, normaliza espacios y saltos de línea, y devuelve el texto consolidado.

## Rama
- `dev`
