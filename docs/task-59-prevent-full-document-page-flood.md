# Tarea 59: Prevención de Inundación de Páginas y Espera de Capítulos

## Descripción
Corrección definitiva de la causa de `Maximum update depth exceeded` identificada mediante el tracing de consola:
1. **Prevención de Montaje Masivo de Páginas**:
   - Anteriormente, mientras `extractChapters` se ejecutaba (primeros 50ms), `activeChapter` era `null` y `PdfReader` asignaba el rango de páginas de todo el libro (ej. 138 páginas), montando 138 componentes `<Page />` a la vez en React 19.
   - Ahora, mientras `isLoadingChapters === true` o hasta que la detección de capítulos termine, se muestra un indicador de carga elegante (*"Analizando capítulos y niveles..."*), impidiendo el renderizado simultáneo de cientos de páginas.
2. **Rango Seguro de Páginas**:
   - `startPage` y `endPage` solo renderizan las páginas del capítulo activo, asegurando que nunca se monten más páginas que las correspondientes al nivel actual.

## Propósito
- Erradicar la sobrecarga de despachos concurrentes en el dispatcher de React 19 durante la carga inicial del PDF.

## Componentes y Cambios
1. **`src/components/PdfReader.tsx`**: Guarda de espera para extracción de capítulos.

## Rama
- `dev` (en pruebas locales)
