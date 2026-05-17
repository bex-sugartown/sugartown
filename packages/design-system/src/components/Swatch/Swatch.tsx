import React from 'react';
import styles from './Swatch.module.css';

export interface SwatchProps {
  /** CSS color value for the swatch dot and label. null = outlined empty square. */
  color: string | null;
  /** Text label rendered beside the swatch. */
  label: string;
  /** Swatch square size in px. Default: 8. */
  size?: number;
  className?: string;
}

export const Swatch: React.FC<SwatchProps> = ({ color, label, size = 8, className }) => {
  const dotStyle: React.CSSProperties = {
    width: size,
    height: size,
    ...(color ? { background: color } : {}),
  }

  return (
    <span className={[styles.swatch, className].filter(Boolean).join(' ')}>
      <span
        className={color ? styles.dot : `${styles.dot} ${styles.dotOutlined}`}
        style={dotStyle}
        aria-hidden="true"
      />
      {label}
    </span>
  )
}
