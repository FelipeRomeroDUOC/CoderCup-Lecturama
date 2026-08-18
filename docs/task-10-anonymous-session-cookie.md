# Tarea 10: Identidad de Sesión Anónima con UUID por Cookie

## Descripción
Implementación de la utilidad del lado del servidor para gestionar identificadores de sesión anónimos únicos basados en cookies seguras (`httpOnly`).

## Propósito
- Cumplir con la sección "Identidad sin login" establecida en `AGENTS.md`.
- Permitir asociar el progreso de capítulos y vidas a un usuario anónimo sin requerir registro o autenticación previa.

## Componentes y Cambios
1. **`src/lib/session.ts`**:
   - Función `getOrCreateSessionId()` que recupera o genera un UUID v4 seguro mediante `crypto.randomUUID()` y lo establece en la cookie `session_id`.
   - Función `getSessionId()` para solo lectura de la sesión.

## Rama
- `dev`
