# Tarea 88: Corrección de Carga de PDF eliminando Revocación Prematura de Blob URL

## Descripción
Corrección del error `ResponseException: Unexpected server response (0) while retrieving PDF blob:...`:
- Se eliminó el uso de `URL.createObjectURL(file)` y su revocación en `useEffect` dentro de `src/components/PdfReader.tsx`.
- Ahora el componente `<Document file={file} />` de `react-pdf` recibe directamente el objeto `File` nativo en memoria, eliminando fallos de red local, revocaciones tempranas por StrictMode o race conditions.

## Propósito
- Garantizar que los PDFs subidos o abiertos desde la biblioteca se carguen y rendericen instantáneamente y sin errores.

## Componentes y Cambios
1. **`src/components/PdfReader.tsx`**

## Rama
- `dev` (en pruebas locales)
