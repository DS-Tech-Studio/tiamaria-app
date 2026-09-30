import React, { type ReactNode, type TextareaHTMLAttributes } from 'react';

interface NotesInputProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  compact?: boolean;
}

export const NotesInput: React.FC<NotesInputProps> = ({
  label = 'Notas u observaciones',
  id = 'notes',
  error,
  rows = 3,
  icon,
  compact = false,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-gray-300">
          {label}
        </label>
      )}

      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-3 text-[#D57642]">
            {icon}
          </span>
        )}

        <textarea
          id={id}
          rows={rows}
          className={`w-full rounded-xl border bg-[#240103] text-white placeholder-gray-500 outline-none transition-all focus:border-[#D57642] focus:ring-2 focus:ring-[#D57642]/30 ${
            compact ? 'p-2.5 text-sm' : 'p-3 text-sm'
          } ${icon ? 'pl-11' : 'pl-3'} ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : 'border-white/15'} ${className}`}
          {...props}
        />
      </div>

      {error && <span className="mt-1 block text-xs text-red-400">{error}</span>}
    </div>
  );
};
