# Tarea 19: Filtro de Secciones Preliminares (Front Matter / Lectura Libre)

## Descripción
Implementación del clasificador de secciones preliminares para excluir portadas, índices, páginas legales y dedicatorias de las rondas de preguntas con IA, permitiendo su navegación libre y reservando los quizzes para los capítulos narrativos reales.

## Propósito
- Evitar formular quizzes artificiales sobre la portada o tabla de contenidos.
- Permitir al lector avanzar libremente desde la portada hasta el primer capítulo de la historia.

## Componentes y Cambios
1. **`src/lib/chapterClassifier.ts`**:
   - Función `isPreliminarySection(title)` con diccionario de términos normalizados (portada, índice, copyright, dedicatoria, etc.).
2. **`src/hooks/useGamification.ts`**:
   - Desbloqueo automático de secciones preliminares e inicio del primer nivel jugable en el primer capítulo narrativo.
3. **`src/components/PdfViewer.tsx`**:
   - Visualización de tarjeta adaptada para secciones introductorias con botón directo "Avanzar al siguiente capítulo / Comenzar lectura" sin quiz.
4. **`src/components/ChapterSidebar.tsx`**:
   - Icono `📄` para secciones preliminares.

## Rama
- `dev`
