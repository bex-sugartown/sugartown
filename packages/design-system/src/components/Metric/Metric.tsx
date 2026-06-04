import React from 'react';
import styles from './Metric.module.css';

export type MetricTrend = 'up' | 'down' | 'neutral';

export interface MetricProps {
  /** Displayed value — a number, percentage, or formatted string */
  value: string | number;
  /** Descriptive label below the value */
  label: string;
  /** Optional trend direction */
  trend?: MetricTrend;
  className?: string;
}

const TREND_SYMBOL: Record<MetricTrend, string> = {
  up: '↑',
  down: '↓',
  neutral: '→',
};

export function Metric({ value, label, trend, className }: MetricProps) {
  return (
    <div className={[styles.metric, className].filter(Boolean).join(' ')}>
      <span className={styles.value}>{value}</span>
      {trend && (
        <span className={[styles.trend, styles[`trend--${trend}`]].join(' ')} aria-hidden="true">
          {TREND_SYMBOL[trend]}
        </span>
      )}
      <span className={styles.label}>{label}</span>
    </div>
  );
}
