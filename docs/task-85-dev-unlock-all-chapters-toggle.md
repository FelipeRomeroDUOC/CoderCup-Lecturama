# Tarea 85: Switch Exclusivo de Desarrollador para Desbloqueo Libre de Capítulos

## Descripción
Implementación de una herramienta de conveniencia para pruebas en entorno local (`process.env.NODE_ENV === "development"`):
1. **Switch Toggle en Cabecera**:
   - `🔓 Desbloquear Todos [DEV]` / `🔒 Bloqueo Normal [DEV]` en la barra superior de `PdfReader.tsx`.
2. **Comportamiento**:
   - Al activarse, permite navegar y saltar libremente a cualquier capítulo del libro sin importar el progreso (`isChapterUnlocked` retorna siempre `true`).
   - Mantiene intacto el estado real de los quizes (`isChapterCompleted`), de modo que cada capítulo sigue mostrando su desafío pendiente para ser probado cuando se desee.
   - Oculto automáticamente en producción.

## Propósito
- Facilitar el testeo rápido y la inspección de quizes en cualquier capítulo del libro sin tener que responder todos los niveles previos de forma obligatoria durante el desarrollo.

## Componentes y Cambios
1. **`src/components/PdfReader.tsx`**
2. **`src/hooks/useGamification.ts`**

## Rama
- `dev` (en pruebas locales)
