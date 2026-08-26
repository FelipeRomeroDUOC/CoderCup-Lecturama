# Tarea 106: Generación Rationale-First, Validación Cruzada y Sanitización de Explicaciones

## Descripción
Corrección del error de desalineación entre la respuesta correcta y la explicación formativa generada por el LLM:
1. **Esquema Rationale-First**:
   - Se reestructuró el esquema JSON para que el modelo genere `explanation` (razonamiento pedagógico) **antes** de formular las opciones, el índice y el texto de la respuesta correcta. Esto elimina la deriva de tokens (*hallucination drift*).
2. **Validación Cruzada Multi-Capa**:
   - `resolveCorrectOptionIndex`: Verifica concordancia entre texto exacto, índice numérico y solapamiento semántico de términos clave con la explicación formativa.
3. **Sanitizador de Explicaciones**:
   - `sanitizeExplanation`: Purga prefijos residuales de metanotas del prompt (*"Nota: ...", "Regla: ..."*) asegurando que el estudiante reciba explicaciones limpias y educativas.

## Componentes y Cambios
1. **`src/lib/gemini.ts`**

## Rama
- `dev` -> `main`
