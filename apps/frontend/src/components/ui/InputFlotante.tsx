import { useId } from 'react';
import type { InputHTMLAttributes } from 'react';
import styles from './InputFlotante.module.css';

type InputFlotanteProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export default function InputFlotante({ label, id, className = '', ...inputProps }: InputFlotanteProps) {
  const generatedId = useId();
  const inputId = id ?? `input-flotante-${generatedId}`;

  return (
    <div className={styles.container}>
      <input
        {...inputProps}
        id={inputId}
        className={`${styles.input} ${className}`.trim()}
        placeholder=" "
      />
      <label className={styles.label} htmlFor={inputId}>
        {label}
      </label>
    </div>
  );
}