# Tarea 14: Actualización del Modelo Gemini a `gemini-3.6-flash`

## Descripción
Actualización del modelo de IA en el cliente de Google AI Studio a `gemini-3.6-flash` para resolver el error 404 de modelo no disponible reportado por la API.

## Propósito
- Utilizar la versión activa y recomendada por Google AI Studio para la generación estructurada de preguntas.
- Proveer soporte para sobrescribir el modelo opcionalmente a través de la variable de entorno `GEMINI_MODEL`.

## Componentes y Cambios
1. **`src/lib/gemini.ts`**:
   - Actualización del identificador de modelo por defecto a `gemini-3.6-flash`.
   - Soporte para `process.env.GEMINI_MODEL || "gemini-3.6-flash"`.
2. **`.env.example`**:
   - Inclusión opcional de `GEMINI_MODEL`.

## Rama
- `dev`
