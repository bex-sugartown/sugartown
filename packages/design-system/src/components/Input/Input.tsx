import React from 'react';
import styles from './Input.module.css';

export type InputType = 'text' | 'email' | 'password' | 'search' | 'url' | 'tel' | 'number';

export interface InputProps {
  type?: InputType;
  id: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  /** Error state — applies error border colour */
  hasError?: boolean;
  autoComplete?: string;
  'aria-describedby'?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  className?: string;
}

export function Input({
  type = 'text',
  id,
  name,
  value,
  defaultValue,
  placeholder,
  disabled = false,
  hasError = false,
  autoComplete,
  'aria-describedby': ariaDescribedby,
  onChange,
  onBlur,
  className,
}: InputProps) {
  return (
    <input
      type={type}
      id={id}
      name={name}
      value={value}
      defaultValue={defaultValue}
      placeholder={placeholder}
      disabled={disabled}
      autoComplete={autoComplete}
      aria-describedby={ariaDescribedby}
      aria-invalid={hasError || undefined}
      onChange={onChange}
      onBlur={onBlur}
      className={[styles.input, hasError && styles.error, disabled && styles.disabled, className]
        .filter(Boolean)
        .join(' ')}
    />
  );
}
