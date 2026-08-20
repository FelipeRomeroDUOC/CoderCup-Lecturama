# Tarea 42: Persistencia Unificada con UUID y Botón Dinámico de Continuación

## Descripción
Implementación de un sistema de persistencia completo en el cliente ligado al UUID del usuario:
1. **Identidad de Usuario (`src/lib/clientSession.ts`)**: Genera o recupera el UUID único de sesión del cliente (`codercup_user_id`).
2. **Persistencia del Progreso del Libro (`useGamification.ts` & `PdfReader.tsx`)**:
   - Clave: `codercup_${userId}_${bookTitle}_progress`
   - Almacena niveles desbloqueados, niveles completados y última página leída.
3. **Persistencia del Quiz en Pausa (`QuizModal.tsx` & `PdfReader.tsx`)**:
   - Clave: `codercup_${userId}_${bookTitle}_${chapterId}_quiz_session`
   - Almacena preguntas, vidas restantes, pregunta en curso y aciertos.
4. **Botón Dinámico de Continuación**:
   - Muestra **"▶️ Continuar quiz del nivel (Pregunta X/5 - ❤️ Vidas)"** cuando hay un cuestionario pausado.
   - Muestra **"🎯 Comenzar quiz del nivel"** cuando no hay partida en curso.
5. **Limpieza y Resiliencia**:
   - Limpieza automática al ganar el quiz o al presionar `[DEV] Reset`.

## Propósito
- Garantizar que nunca se pierda el progreso de preguntas ni las vidas al pausar, salir o recargar la página en local o en Vercel.

## Rama
- `dev`
