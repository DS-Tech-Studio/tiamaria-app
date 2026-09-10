
export default function App() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6 sm:p-10">
      <div className="surface w-full max-w-lg overflow-hidden">
        <div className="bg-ink-950 px-7 py-8 text-white sm:px-10">
          <p className="eyebrow text-brand-100">Panel de gestión</p>
          <h1 className="mt-3 font-display text-4xl leading-tight font-bold tracking-tight sm:text-5xl">
            Tía María App
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-6 text-orange-100/80">
            Una base clara para administrar pedidos, productos y clientes desde un mismo lugar.
          </p>
        </div>
        <div className="space-y-6 px-7 py-8 sm:px-10">
          <div>
            <p className="eyebrow">Estado del sistema</p>
            <p className="mt-2 text-lg font-bold text-ink-900">Todo listo para comenzar</p>
            <p className="mt-1 text-sm leading-6 text-ink-700">
              La interfaz y la configuración de estilos están preparadas para crecer por módulos.
            </p>
          </div>
          <button className="w-full rounded-xl bg-brand-600 px-4 py-3 font-bold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">
            Probar navegación
          </button>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-brand-100 px-3 py-1.5 text-xs font-bold text-brand-700">Notificaciones</span>
            <span className="rounded-full bg-ink-900 px-3 py-1.5 text-xs font-bold text-white">Nuevo pedido</span>
          </div>
        </div>
      </div>
    </main>
  );
}