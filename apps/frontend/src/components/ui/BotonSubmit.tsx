import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

type BotonSubmitProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading?: boolean;
  loadingText?: string;
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
};

const variantClasses: Record<Variant, string> = {
  primary:
    'border border-[#D57642]/40 bg-[linear-gradient(135deg,#D57642_0%,#BE5A2A_48%,#A94B2B_100%)] text-white shadow-[0_18px_35px_rgba(213,118,66,0.28)] hover:-translate-y-0.5 hover:shadow-[0_22px_38px_rgba(213,118,66,0.34)] active:scale-[0.99]',
  secondary:
    'border border-[#500824]/40 bg-[linear-gradient(135deg,#500824_0%,#590209_100%)] text-[#f7d7c2] shadow-[0_18px_35px_rgba(89,2,9,0.26)] hover:-translate-y-0.5 hover:shadow-[0_22px_38px_rgba(89,2,9,0.32)] active:scale-[0.99]',
  ghost:
    'border border-[#D57642]/25 bg-white/60 text-[#240103] hover:bg-[#f7d7c2] active:scale-[0.99]',
};

const sizeClasses: Record<Size, string> = {
  sm: 'min-h-[2.8rem] px-4 py-2 text-xs',
  md: 'min-h-[3.2rem] px-5 py-2.5 text-sm',
  lg: 'min-h-[3.6rem] px-6 py-3 text-base',
};

export default function BotonSubmit({
  children,
  className = '',
  disabled = false,
  isLoading = false,
  loadingText = 'Procesando...',
  type = 'submit',
  variant = 'primary',
  size = 'md',
  icon,
  ...buttonProps
}: BotonSubmitProps) {
  return (
    <button
      {...buttonProps}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={`group relative inline-flex w-full items-center justify-center overflow-hidden rounded-xl font-semibold tracking-wide transition-all duration-300 ease-out disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      <span className="absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.3),transparent_34%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <span className="absolute -inset-x-8 bottom-0 top-0 my-auto h-16 w-16 -translate-x-20 rotate-12 bg-white/15 blur-xl transition-transform duration-700 group-hover:translate-x-44" />

      <span className="relative z-10 flex items-center justify-center gap-2">
        {isLoading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" aria-hidden="true" />
            <span>{loadingText}</span>
          </>
        ) : (
          <>
            <span>{children}</span>
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-white/10 text-base leading-none transition-transform duration-300 group-hover:translate-x-0.5 group-hover:scale-105">
              {icon ?? '→'}
            </span>
          </>
        )}
      </span>
    </button>
  );
}