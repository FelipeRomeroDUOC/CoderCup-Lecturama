# Tarea 109: Preparación y Despliegue del Release v1.0.0-beta.8

## Descripción
Actualización general y empaquetado de la versión `v1.0.0-beta.8`:
- Reestructuración del esquema de IA a *Rationale-First* (análisis previo en `explanation`) y validación cruzada multi-capa en `src/lib/gemini.ts` para eliminar contradicciones en la selección de opciones.
- Sanitización de explicaciones para purgar metanotas residuales del prompt.
- Incorporación de directiva oficial `darkreader-lock` y `suppressHydrationWarning` en la raíz de la app y la portada, erradicando advertencias de hidratación provocadas por extensiones de navegador.

## Archivos Afectados
1. **`package.json`**
2. **`README.md`**
3. **`CHANGELOG.md`**

## Rama
- `dev` -> `main` (etiquetado como `v1.0.0-beta.8`)
