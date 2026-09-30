import { useEffect, useRef, useState } from 'react';

export interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  ariaLabel: string;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
}

export function Dropdown({
  value,
  options,
  onChange,
  placeholder = 'Seleccionar',
  disabled = false,
  ariaLabel,
  className = '',
  triggerClassName = '',
  menuClassName = '',
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className={`flex w-full items-center justify-between gap-3 text-left disabled:cursor-not-allowed disabled:opacity-50 ${triggerClassName}`}
      >
        <span className="min-w-0 truncate">{selectedOption?.label ?? placeholder}</span>
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <path fillRule="evenodd" d="M5.25 7.5a.75.75 0 011.06.03L10 11.46l3.69-3.93a.75.75 0 111.09 1.03l-4.24 4.5a.75.75 0 01-1.09 0l-4.24-4.5a.75.75 0 01-.04-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div role="listbox" aria-label={ariaLabel} className={`absolute left-0 top-[calc(100%+0.35rem)] z-50 max-h-60 w-full overflow-y-auto rounded-lg border border-white/15 bg-[#1a070b] p-1 shadow-2xl ${menuClassName}`}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-white/80 transition hover:bg-caramelo/15 hover:text-white ${option.value === value ? 'bg-caramelo/10 text-caramelo' : ''}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}