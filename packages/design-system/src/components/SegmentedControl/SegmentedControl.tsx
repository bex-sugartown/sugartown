import React, { useCallback } from 'react';
import styles from './SegmentedControl.module.css';

export interface SegmentOption {
  /** Text label — required for "pill" variant, optional for "icon" variant */
  label?: string;
  /** Icon element — rendered instead of / alongside label */
  icon?: React.ReactNode;
  value: string;
  /** Accessible label when icon has no visible text */
  ariaLabel?: string;
}

export interface SegmentedControlProps {
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
  /**
   * "pill" — connected pill track with text labels (default; CWV mobile/desktop toggle)
   * "icon" — spaced individual icon buttons (archive grid/list/graph toggle)
   */
  variant?: 'pill' | 'icon';
  /** Accessible label for the control group */
  'aria-label'?: string;
  className?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  variant = 'pill',
  'aria-label': ariaLabel = 'View options',
  className,
}) => {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const idx = options.findIndex((o) => o.value === value);
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        onChange(options[(idx + 1) % options.length].value);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        onChange(options[(idx - 1 + options.length) % options.length].value);
      }
    },
    [options, value, onChange]
  );

  const groupClass = [
    variant === 'pill' ? styles.pill : styles.iconGroup,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={groupClass}
      onKeyDown={handleKeyDown}
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        const btnClass = [
          variant === 'pill' ? styles.pillSegment : styles.iconBtn,
          isActive && (variant === 'pill' ? styles.pillActive : styles.iconBtnActive),
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={opt.ariaLabel ?? opt.label}
            tabIndex={isActive ? 0 : -1}
            className={btnClass}
            onClick={() => onChange(opt.value)}
          >
            {opt.icon}
            {opt.label && <span>{opt.label}</span>}
          </button>
        );
      })}
    </div>
  );
};
