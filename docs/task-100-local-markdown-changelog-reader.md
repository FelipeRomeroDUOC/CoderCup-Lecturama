# Tarea 100: Visualizador de Changelog Basado en CHANGELOG.md en Español

## Descripción
Actualización de la ruta `/changelog`:
- Se reemplazó la consulta de commits crudos en inglés de la API de GitHub por el procesamiento directo del archivo `CHANGELOG.md`.
- Se implementó un parser estructurado que extrae versiones, fechas, descripciones y secciones clasificadas (`✨ Añadido`, `🛡️ Corregido`, `🎨 Mejorado`) con formato visual enriquecido en español.

## Componentes y Cambios
1. **`src/lib/changelogParser.ts`** (Nuevo parser de Markdown)
2. **`src/app/changelog/page.tsx`** (Renderizado enriquecido de versiones oficiales)

## Rama
- `dev` -> `main` (desplegado a producción)
