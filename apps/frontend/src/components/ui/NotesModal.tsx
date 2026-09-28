interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  notes: string | null;
}

export function NotesModal({ isOpen, onClose, title, notes }: NotesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="presentation" onMouseDown={onClose}>
      <section className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#26080e] p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="notes-modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between gap-4"><h2 id="notes-modal-title" className="font-serif text-xl font-bold text-white">{title}</h2><button className="text-xl text-white/50 hover:text-white" type="button" onClick={onClose} aria-label="Cerrar notas">×</button></div>
        <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-white/75">{notes || 'Este cliente no tiene notas registradas.'}</p>
      </section>
    </div>
  );
}