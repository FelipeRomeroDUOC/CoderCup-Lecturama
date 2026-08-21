# Tarea 56: Carga Estable de Archivos PDF y Prevención de Concurrencia en React 19

## Descripción
Corrección del ciclo de concurrencia en la carga inicial de PDFs mediante `Blob URL` y control de ciclo de vida en `PdfReader.tsx`:
1. **Blob URL Nativo para `react-pdf`**:
   - Se crea un `URL.createObjectURL(file)` estable al recibir el archivo PDF y se libera con `URL.revokeObjectURL` al desmontar el componente.
   - Elimina la sobrecarga de `FileReader` en `react-pdf` que generaba múltiples `ArrayBuffers` y disparos de estado en `useResolver`.
2. **Guarda de Extracción Única (`extractedPdfRef`)**:
   - Asegura que `extractChapters` solo se ejecute una vez por documento.
3. **Estabilización de Clasificación Asíncrona**:
   - Las evaluaciones de secciones se ejecutan de manera diferida sin interferir en la fase inicial de montaje del visor.

## Propósito
- Eliminar de raíz cualquier advertencia o error de profundidad máxima de actualización durante la apertura y navegación del PDF.

## Componentes y Cambios
1. **`src/components/PdfReader.tsx`**: Integración de Blob URL y guardas de extracción.

## Rama
- `dev` (en pruebas locales)
