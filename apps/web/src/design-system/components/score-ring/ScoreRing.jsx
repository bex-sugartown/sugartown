/**
 * ScoreRing — web adapter
 *
 * Mirrors: packages/design-system/src/components/ScoreRing/ScoreRing.tsx
 *
 * Animated SVG arc ring showing a 0–100 Lighthouse score.
 * Animates on IntersectionObserver entry (count-up + arc fill).
 * Color category derived from score: ≥90 good, ≥50 warn, <50 poor.
 */
import { useEffect, useRef, useState } from 'react'
import styles from './ScoreRing.module.css'

const RADIUS_RATIO = 0.38
const GAP_DEGREES = 60

// eslint-disable-next-line react-refresh/only-export-components
export function scoreCategory(score) {
  if (score >= 90) return 'good'
  if (score >= 50) return 'warn'
  return 'poor'
}

export default function ScoreRing({
  score,
  label,
  size = 96,
  strokeWidth = 8,
  category: categoryProp,
  className,
}) {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)))
  const cat = categoryProp ?? scoreCategory(clampedScore)

  const radius = size * RADIUS_RATIO
  const cx = size / 2
  const cy = size / 2

  const arcDegrees = 360 - GAP_DEGREES
  const circumference = 2 * Math.PI * radius
  const arcLength = (arcDegrees / 360) * circumference
  const gapLength = circumference - arcLength

  const startAngle = 90 + GAP_DEGREES / 2

  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const [displayScore, setDisplayScore] = useState(reducedMotion ? clampedScore : 0)
  const [animated, setAnimated] = useState(reducedMotion)
  const ringRef = useRef(null)

  useEffect(() => {
    if (reducedMotion) return
    if (!('IntersectionObserver' in window)) {
      setDisplayScore(clampedScore)
      setAnimated(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated) {
          setAnimated(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    if (ringRef.current) observer.observe(ringRef.current)
    return () => observer.disconnect()
  }, [animated, clampedScore])

  useEffect(() => {
    if (!animated) return
    const duration = 600
    const steps = 30
    const stepTime = duration / steps
    let step = 0
    const id = setInterval(() => {
      step++
      setDisplayScore(Math.round((clampedScore * step) / steps))
      if (step >= steps) clearInterval(id)
    }, stepTime)
    return () => clearInterval(id)
  }, [animated, clampedScore])

  const fillRatio = animated ? clampedScore / 100 : 0
  const fillLength = fillRatio * arcLength
  const dashArray = `${fillLength} ${arcLength - fillLength} ${gapLength}`
  const trackDashArray = `${arcLength} ${gapLength}`
  const transform = `rotate(${startAngle} ${cx} ${cy})`

  const arcClass = `${styles.arc} ${styles[cat]}`
  const trackClass = `${styles.track} ${styles[`${cat}Track`]}`
  const scoreClass = `${styles.scoreValue} ${styles[`${cat}Fg`]}`

  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(' ')}>
      {/* Ring wrap — relative container so score overlay can be absolute */}
      <div className={styles.ringWrap} style={{ width: size, height: size }}>
        <svg
          ref={ringRef}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          aria-hidden="true"
          className={animated ? styles.svgReady : styles.svgIdle}
        >
          <circle
            cx={cx} cy={cy} r={radius}
            fill="none" strokeWidth={strokeWidth}
            strokeDasharray={trackDashArray}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={transform}
            className={trackClass}
          />
          <circle
            cx={cx} cy={cy} r={radius}
            fill="none" strokeWidth={strokeWidth}
            strokeDasharray={dashArray}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={transform}
            className={arcClass}
            style={{ transition: animated ? 'stroke-dasharray 0.6s ease-out' : 'none' }}
          />
        </svg>
        {/* Score centered inside ring — absolute so it doesn't affect wrapper height */}
        <div className={styles.inner}>
          <span className={scoreClass}>{displayScore}</span>
        </div>
      </div>
      {/* Label sits below the ring as a flex sibling */}
      {label && <span className={styles.label}>{label}</span>}
    </div>
  )
}
