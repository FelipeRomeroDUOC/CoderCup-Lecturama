# Tarea 41: Persistencia de Progreso al Pausar el Quiz

## Descripción
Modificación del ciclo de vida del estado en `QuizModal.tsx` para preservar el avance del cuestionario (pregunta actual, vidas restantes y aciertos acumulados) al presionar "Pausar y salir" o cerrar el modal temporalmente, reanudando la partida exactamente donde el usuario la dejó.

## Propósito
- Permitir al usuario pausar el quiz para revisar páginas del libro sin perder su progreso ni sus vidas actuales.

## Reglas de Reinicio
- **Se mantiene el estado**: al cerrar o reabrir el modal en el mismo capítulo.
- **Se reinicia a la Pregunta 1 y 3 vidas**:
  - Al hacer clic en "🔄 Reintentar Desafío" tras perder las 3 vidas.
  - Al completar el quiz con éxito (Victoria).
  - Al cambiar a un capítulo o libro distinto.
  - Al usar la herramienta `[DEV] Reset`.

## Componentes y Cambios
1. **`src/components/QuizModal.tsx`**:
   - Seguimiento del capítulo activo mediante `lastChapterRef` para no reiniciar al reabrir el mismo desafío.

## Rama
- `dev`
