# Tarea 101: Sanitización de Secciones Preliminares en Progreso de Gamificación

## Descripción
Corrección del conteo `1/8 Quizes` cuando solo la portada está desbloqueada sin haber resuelto ningún quiz:
- Se añadió sanitización automática en `src/hooks/useGamification.ts` para excluir IDs de secciones preliminares/informativas (portadas, dedicatorias, notas) tanto al cargar desde `localStorage` como al persistir `completedChapterIds`.
- Se implementó purga automática de IDs residuales de secciones no jugables para sincronizar la estantería con los quizes reales superados.

## Componentes y Cambios
1. **`src/hooks/useGamification.ts`**

## Rama
- `dev` -> `main` (desplegado a producción)
