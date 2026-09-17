import type { ButtonHTMLAttributes } from 'react';
import styles from './BotonSubmit.module.css';

type BotonSubmitProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading?: boolean;
  loadingText?: string;
};

export default function BotonSubmit({
  children,
  className = '',
  disabled = false,
  isLoading = false,
  loadingText = 'Procesando...',
  type = 'submit',
  ...buttonProps
}: BotonSubmitProps) {
  const buttonClassName = [
    styles.button,
    isLoading ? styles.loading : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      {...buttonProps}
      className={buttonClassName}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
    >
      <span className={styles.content}>
        {isLoading && <span className={styles.spinner} aria-hidden="true" />}
        <span>{isLoading ? loadingText : children}</span>
      </span>
      {!isLoading && <span className={styles.arrow} aria-hidden="true">→</span>}
    </button>
  );
}