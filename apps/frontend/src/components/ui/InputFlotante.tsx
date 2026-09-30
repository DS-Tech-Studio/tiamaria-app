import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

type InputSize = 'sm' | 'md';

type InputFlotanteProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  icon?: ReactNode;
  inputSize?: InputSize;
};

const sizeClasses: Record<InputSize, string> = {
  sm: 'pb-2 pt-5 text-sm',
  md: 'pb-3 pt-6 text-[0.95rem]',
};

export default function InputFlotante({
  label,
  id,
  error,
  icon,
  inputSize = 'md',
  className = '',
  ...inputProps
}: InputFlotanteProps) {
  const generatedId = useId();
  const inputId = id ?? `input-flotante-${generatedId}`;

  return (
    <div className="w-full">
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-[#D57642]">
            {icon}
          </span>
        )}

        <input
          {...inputProps}
          id={inputId}
          placeholder=" "
          className={`peer w-full rounded-xl border bg-[#f8efe9] text-[#240103] outline-none transition-all placeholder:text-transparent focus:border-[#D57642] focus:ring-2 focus:ring-[#D57642]/25 ${sizeClasses[inputSize]} ${
            icon ? 'pl-11' : 'pl-3.5'
          } ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/25' : 'border-[#e4d3ca]'} ${className}`.trim()}
        />

        <label
          htmlFor={inputId}
          className="pointer-events-none absolute left-3.5 top-2 z-10 origin-[0] -translate-y-2 scale-75 transform text-xs text-gray-400 duration-150 peer-placeholder-shown:translate-y-1.5 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-sm peer-focus:-translate-y-2 peer-focus:scale-75 peer-focus:text-[#D57642]"
          style={icon ? { left: '2.75rem' } : undefined}
        >
          {label}
        </label>
      </div>

      {error && <span className="mt-1 block text-xs text-red-400">{error}</span>}
    </div>
  );
}