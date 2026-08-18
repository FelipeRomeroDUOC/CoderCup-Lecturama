# Tarea 2: Componente de Carga de PDF (Botón + Drag & Drop)

## Descripción
Implementación del componente de subida de archivos PDF con soporte para selección mediante botón y arrastrar y soltar (drag & drop).

## Propósito
- Cumplir con el Punto 1 del alcance de la interfaz del lector establecido en `AGENTS.md`.
- Permitir al usuario ingresar un archivo PDF local para su posterior visualización en memoria.

## Componentes y Cambios
1. **`src/components/PdfUploader.tsx`**:
   - Componente interactivo (`'use client'`).
   - Zona de dropzone con estados visuales (`isDragging`).
   - Input de archivo oculto accesible mediante botón o clic en la zona de dropzone (`accept="application/pdf"`).
   - Validación de tipo MIME y extensión (`application/pdf`, `.pdf`).
   - Notificación de archivo seleccionado mediante prop `onFileSelect: (file: File) => void`.
2. **`src/app/page.tsx`**:
   - Integración de `PdfUploader` en la landing page.
   - Manejo de estado del archivo seleccionado (`selectedFile`).

## Rama
- `dev`
