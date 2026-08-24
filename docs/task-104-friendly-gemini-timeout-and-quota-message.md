# Tarea 104: Mensaje Amigable de Timeout y Cuota en Generación de Quizzes con Gemini

## Descripción
Unificación de mensajes de error de la API de IA (timeouts, cuotas 429, sobrecarga 503 o respuestas fallidas) bajo un mensaje transparente y amigable:
- *"Gemini ha tardado demasiado en responder, intenta generar el quiz nuevamente."*
- Se configuró `gemini-3.1-flash-lite` como modelo de respaldo de alta disponibilidad (500 RPD).
- Se encapsularon los errores en `src/lib/gemini.ts` y en el Route Handler de `/api/chapters/[id]/questions`.

## Componentes y Cambios
1. **`src/lib/gemini.ts`**
2. **`src/app/api/chapters/[id]/questions/route.ts`**

## Rama
- `dev` -> `main` (desplegado a producción)
