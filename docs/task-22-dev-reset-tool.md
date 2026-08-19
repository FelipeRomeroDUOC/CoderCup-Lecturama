# Tarea 22: Herramienta de Desarrollador para Reinicio Completo de Progreso y Caché

## Descripción
Implementación de un botón y endpoint de desarrollo para reiniciar en un solo clic el progreso de los niveles (volviéndolos a bloquear) y borrar las preguntas en caché del servidor, permitiendo probar la generación y flujo desde cero.

## Propósito
- Facilitar pruebas continuas e iterativas del flujo de lectura y gamificación en la rama `dev`.

## Componentes y Cambios
1. **`src/lib/quizStore.ts`**:
   - Función `clearQuizStore()` para vaciar las preguntas y vidas almacenadas en memoria.
2. **`src/app/api/dev/reset/route.ts`**:
   - Endpoint `POST /api/dev/reset` que ejecuta `clearQuizStore()`.
3. **`src/components/PdfReader.tsx`**:
   - Botón `🛠️ Reset (Dev)` en la barra superior que invoca el reseteo del servidor, limpia el `localStorage` y posiciona el lector en el inicio.

## Rama
- `dev`
