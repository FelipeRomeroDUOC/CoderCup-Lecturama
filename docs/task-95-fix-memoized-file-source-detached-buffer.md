# Tarea 95: Corrección de Memoización de FileSource para Evitar Detached ArrayBuffer

## Descripción
Corrección del error `TypeError: attempting to access detached ArrayBuffer` y advertencias de prop `file` duplicada en `<Document />`:
- Se reemplazó el objeto inline `{ data: pdfData }` por un estado memoizado y estable `fileSource: { data: Uint8Array } | null`.
- `react-pdf` mantiene igualdad referencial entre re-renders y no recarga el PDF ni accede a buffers desasociados tras la transferencia al Web Worker.

## Componentes y Cambios
1. **`src/components/PdfReader.tsx`**

## Rama
- `dev` (en pruebas locales)
