# Tarea 94: Corrección de Carga de PDF mediante Buffer en Memoria (ArrayBuffer)

## Descripción
Corrección del error intermitente `Error while reading a file: File not found.`:
- Se convirtió la lectura del archivo a un `ArrayBuffer` directo cargado en memoria (`file.arrayBuffer()`).
- `<Document file={pdfData ? { data: pdfData } : null}>` recibe directamente la estructura de datos en RAM `{ data: Uint8Array/ArrayBuffer }`.
- PDF.js ya no intenta recurrir a peticiones HTTP locales por nombre de archivo, eliminando de forma definitiva cualquier fallo de red local o `404 File not found`.

## Componentes y Cambios
1. **`src/components/PdfReader.tsx`**

## Rama
- `dev` (en pruebas locales)
