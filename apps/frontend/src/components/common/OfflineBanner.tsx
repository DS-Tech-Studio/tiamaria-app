// src/components/common/OfflineBanner.tsx
import { useOffline } from '../../hooks/useOffline';

export const OfflineBanner = () => {
  const isOffline = useOffline();

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-950/90 px-4 py-3 text-amber-200 shadow-2xl backdrop-blur-md transition-all animate-bounce">
      <span className="flex h-3 w-3 relative">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
      </span>
      <div className="flex flex-col text-xs font-medium">
        <span className="font-bold text-amber-100">Sin conexión a Internet</span>
        <span className="text-amber-300/80">Modo offline activo</span>
      </div>
    </div>
  );
};