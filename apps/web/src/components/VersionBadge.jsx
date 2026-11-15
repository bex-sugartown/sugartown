import styles from './VersionBadge.module.css'

const KIND_CLASS = {
  minor: styles.versionBadgeMinor,
  major: styles.versionBadgeMajor,
  patch: styles.versionBadgePatch,
}

/**
 * VersionBadge — release kind (minor, major, patch) as a tinted mono label (ST-228).
 * One copy for the release tables in TrustReportSection and GovernancePage.
 * An unknown kind renders the untinted label.
 */
export default function VersionBadge({ kind }) {
  const key = kind?.toLowerCase()
  return (
    <span className={[styles.versionBadge, KIND_CLASS[key]].filter(Boolean).join(' ')}>
      {key}
    </span>
  )
}
