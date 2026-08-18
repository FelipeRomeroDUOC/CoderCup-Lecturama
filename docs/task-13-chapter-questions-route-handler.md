# Tarea 13: Route Handler de Generación de Preguntas (`POST /api/chapters/[id]/questions`)

## Descripción
Implementación del endpoint de servidor `POST /api/chapters/[id]/questions` para generar y devolver bajo demanda las 5 preguntas de comprensión del capítulo actual mediante la integración con Gemini AI y la gestión de la sesión anónima.

## Propósito
- Cumplir con la sección "Dónde vive el código" y el flujo bajo demanda de `AGENTS.md`.
- Exponer el endpoint HTTP que consumirá el cliente cuando el lector finalice un capítulo, asociando la petición a la sesión anónima del usuario.

## Componentes y Cambios
1. **`src/app/api/chapters/[id]/questions/route.ts`**:
   - Configuración de `maxDuration = 60` para compatibilidad con Vercel Serverless.
   - Extracción y validación del parámetro dinámico `id` y del cuerpo de la petición (`chapterText`, `chapterTitle`).
   - Identificación de usuario mediante `getOrCreateSessionId()`.
   - Invocación de `generateChapterQuiz(chapterText, chapterTitle)`.
   - Respuesta estructurada en JSON y manejo de errores HTTP (`400`, `500`).

## Rama
- `dev`
