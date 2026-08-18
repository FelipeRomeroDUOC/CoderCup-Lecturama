export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="max-w-xl space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">
          ¿Quién Quiere Ser Lector?
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Herramienta para leer libros con elementos de gamificación
        </p>
        <div>
          <button
            type="button"
            className="rounded-md bg-zinc-900 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Subir PDF
          </button>
        </div>
      </div>
    </main>
  );
}
