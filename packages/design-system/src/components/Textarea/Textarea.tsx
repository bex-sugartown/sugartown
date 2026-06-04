import React from 'react';
import styles from './Textarea.module.css';

export interface TextareaProps {
  id: string;
  name?: string;
  rows?: number;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  hasError?: boolean;
  'aria-describedby'?: string;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
  onBlur?: React.FocusEventHandler<HTMLTextAreaElement>;
  className?: string;
}

export function Textarea({
  id,
  name,
  rows = 4,
  value,
  defaultValue,
  placeholder,
  disabled = false,
  hasError = false,
  'aria-describedby': ariaDescribedby,
  onChange,
  onBlur,
  className,
}: TextareaProps) {
  return (
    <textarea
      id={id}
      name={name}
      rows={rows}
      value={value}
      defaultValue={defaultValue}
      placeholder={placeholder}
      disabled={disabled}
      aria-describedby={ariaDescribedby}
      aria-invalid={hasError || undefined}
      onChange={onChange}
      onBlur={onBlur}
      className={[styles.textarea, hasError && styles.error, disabled && styles.disabled, className]
        .filter(Boolean)
        .join(' ')}
    />
  );
}
