import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import styles from './ScoreRing.module.css';

export type ScoreCategory = 'good' | 'warn' | 'poor';

/** Derive Lighthouse score category from a 0–100 score */
export function scoreCategory(score: number): ScoreCategory {
  if (score >= 90) return 'good';
  if (score >= 50) return 'warn';
  return 'poor';
}

export interface ScoreRingProps {
  /** 0–100 Lighthouse score */
  score: number;
  /** Metric label rendered below the score (e.g. "Performance") */
  label?: string;
  /** Visual size in px. Controls SVG viewport and font sizes. Default: 96 */
  size?: number;
  /** Stroke width of the arc. Default: 8 */
  strokeWidth?: number;
  /** Override the derived color category */
  category?: ScoreCategory;
  className?: string;
}

const RADIUS_RATIO = 0.38; // radius as fraction of size
const GAP_DEGREES = 60;     // bottom gap in degrees (ring is not a full circle)

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeReducedMotion(onChange: () => void) {
  const mql = window.matchMedia(REDUCED_MOTION_QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

/** Live `prefers-reduced-motion`: re-renders when the OS preference changes mid-session */
function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false
  );
}

export const ScoreRing: React.FC<ScoreRingProps> = ({
  score,
  label,
  size = 96,
  strokeWidth = 8,
  category: categoryProp,
  className,
}) => {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  const cat = categoryProp ?? scoreCategory(clampedScore);

  const radius = size * RADIUS_RATIO;
  const cx = size / 2;
  const cy = size / 2;

  // Arc spans (360 - GAP_DEGREES) of the circle
  const arcDegrees = 360 - GAP_DEGREES;
  const circumference = 2 * Math.PI * radius;
  const arcLength = (arcDegrees / 360) * circumference;
  const gapLength = circumference - arcLength;

  // Rotation: start arc at bottom-left of the gap
  const startAngle = 90 + GAP_DEGREES / 2; // degrees; 0° = 3 o'clock in SVG

  const reducedMotion = usePrefersReducedMotion();

  // Animated score
  const [displayScore, setDisplayScore] = useState(reducedMotion ? clampedScore : 0);
  const [animated, setAnimated] = useState(reducedMotion);
  // Score the count-up last finished at, so a reducedMotion flip does not replay it
  const countedTo = useRef<number | null>(reducedMotion ? clampedScore : null);
  const ringRef = useRef<SVGSVGElement>(null);

  // Reveal on first intersection; reduced motion (at mount or later) reveals at once
  useEffect(() => {
    if (animated) return;
    if (reducedMotion || !('IntersectionObserver' in window)) {
      setAnimated(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ringRef.current) observer.observe(ringRef.current);
    return () => observer.disconnect();
  }, [animated, reducedMotion]);

  // Count-up animation when `animated` flips to true or the score changes
  useEffect(() => {
    if (!animated || countedTo.current === clampedScore) return;
    if (reducedMotion) {
      setDisplayScore(clampedScore);
      countedTo.current = clampedScore;
      return;
    }
    const duration = 600;
    const steps = 30;
    const stepTime = duration / steps;
    let step = 0;
    const id = setInterval(() => {
      step++;
      setDisplayScore(Math.round((clampedScore * step) / steps));
      if (step >= steps) {
        clearInterval(id);
        countedTo.current = clampedScore;
      }
    }, stepTime);
    return () => clearInterval(id);
  }, [animated, clampedScore, reducedMotion]);

  const fillRatio = animated ? clampedScore / 100 : 0;
  const fillLength = fillRatio * arcLength;

  // dasharray: fill portion, then gap to complete the arc, then gapLength to close the circle
  const dashArray = `${fillLength} ${arcLength - fillLength} ${gapLength}`;
  const trackDashArray = `${arcLength} ${gapLength}`;

  // SVG transform: rotate to start at the gap's left edge
  const transform = `rotate(${startAngle} ${cx} ${cy})`;

  const arcClass = `${styles.arc} ${styles[cat]}`;
  const trackClass = `${styles.track} ${styles[`${cat}Track`]}`;
  const scoreClass = `${styles.scoreValue} ${styles[`${cat}Fg`]}`;

  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(' ')}>
      <div className={styles.ringWrap} style={{ width: size, height: size }}>
        <svg
          ref={ringRef}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          aria-hidden="true"
          className={animated ? styles.svgReady : styles.svgIdle}
        >
          {/* Track */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeDasharray={trackDashArray}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={transform}
            className={trackClass}
          />
          {/* Fill arc */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeDasharray={dashArray}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={transform}
            className={arcClass}
            style={{ transition: animated ? 'stroke-dasharray 0.6s ease-out' : 'none' }}
          />
        </svg>
        <div className={styles.inner}>
          <span className={scoreClass}>{displayScore}</span>
        </div>
      </div>
      {label && <span className={styles.label}>{label}</span>}
    </div>
  );
};
