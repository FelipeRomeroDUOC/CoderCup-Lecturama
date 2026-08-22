# Tarea 98: Limpieza de Advertencias AbortError en Doble Montaje de React StrictMode

## Descripción
Corrección del registro de advertencias `AbortError: The operation was aborted`:
- Se optimizó `readBlobToUint8Array` para rechazar limpiamente con `AbortError` en `reader.onabort` sin generar llamadas secundarias redundantes.
- Se filtraron las advertencias en `useEffect` de `src/components/PdfReader.tsx`, evitando registrar logs cuando el componente se desmonta o cuando el error corresponde a una cancelación normal de React StrictMode.

## Componentes y Cambios
1. **`src/components/PdfReader.tsx`**

## Rama
- `dev` (en pruebas locales)
