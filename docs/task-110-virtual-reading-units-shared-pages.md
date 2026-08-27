# Tarea 110: Unidades Virtuales de Lectura para Capítulos en Página Compartida

## Descripción
Implementación de partición visual y textual para capítulos que comparten una misma página física en el PDF:
1. **Extensión del Modelo `Chapter`**:
   - `startItemIndex?: number` (índice en `textContent.items` donde inicia el capítulo N+1).
   - `startSplitFractionY?: number` (fracción vertical para desplazar el canvas hacia arriba en la apertura de la Parte 2/2).
   - `endItemIndex?: number` (índice en `textContent.items` donde concluye el capítulo N).
   - `endSplitFractionY?: number` (fracción vertical para limitar la altura del contenedor en el cierre de la Parte 1/2).
2. **Detección y Post-procesamiento en `visualChapterDetector.ts` / `useChapters.ts`**:
   - Detección de colisiones donde `capituloN.endPage === capituloN1.startPage`.
   - Agrupación de fragmentos de texto en líneas horizontales ($\pm 6\text{px}$) para identificar títulos con fuentes mixtas o estilos itálicos (ej. *"6. El criminal pálido"*).
   - Calibración de cotas verticales con márgenes tipográficos de precisión:
     - Cierre del capítulo anterior: `headerTopY - 8px` (oculta el título del siguiente).
     - Apertura del nuevo capítulo: `headerTopY - 6px` (evita residuos del párrafo anterior).
3. **Extracción Quirúrgica de Texto en `pdfTextExtractor.ts`**:
   - Recorte de items con `slice(startItemIndex)` y `slice(0, endItemIndex + 1)` evitando la fuga de contexto entre capítulos al formular quizes con Gemini.
4. **Recorte Visual y Alineación en `PdfViewer.tsx`**:
   - Contenedor con `overflow: hidden` y desplazamiento vertical (`translateY`) para que el nuevo capítulo arranque en el tope (*top 0*) sin residuos ni espacios vacíos.
5. **Persistencia e Interfaz de Usuario**:
   - Persistencia de `lastReadChapterId` en `IndexedDB`.
   - Indicador de página compartida tipo `Pág. 20 (1/2)` y `Pág. 20 (2/2)`.

## Componentes y Cambios
1. **`src/types/pdf.ts`**
2. **`src/lib/visualChapterDetector.ts`**
3. **`src/hooks/useChapters.ts`**
4. **`src/lib/pdfTextExtractor.ts`**
5. **`src/components/PdfViewer.tsx`**
6. **`src/components/PdfReader.tsx`**
7. **`src/components/ChapterSidebar.tsx`**
8. **`src/components/PdfNavigation.tsx`**
9. **`src/lib/bookStorage.ts`**

## Rama
- `dev`

