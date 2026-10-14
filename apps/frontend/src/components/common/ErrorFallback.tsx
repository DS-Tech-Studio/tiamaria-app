import type { FallbackProps } from 'react-error-boundary';

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-6 text-white">
      <section className="w-full max-w-md rounded-2xl border border-red-500/30 bg-zinc-900 p-6 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 text-2xl text-red-400" aria-hidden="true">
          !
        </div>
        <h1 className="mb-2 text-xl font-bold text-zinc-100">¡Algo salió mal!</h1>
        <p className="mb-6 text-sm text-zinc-400">
          Ocurrió un error inesperado. Puedes volver a cargar la aplicación para continuar.
        </p>
        {import.meta.env.DEV && (
          <pre className="mb-6 max-h-40 overflow-auto rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-left text-xs text-red-300">
            {error instanceof Error ? error.message : String(error)}
          </pre>
        )}
        <button
          type="button"
          onClick={resetErrorBoundary}
          className="w-full rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-amber-700 active:scale-[0.98]"
        >
          Recargar aplicación
        </button>
      </section>
    </main>
  );
}
