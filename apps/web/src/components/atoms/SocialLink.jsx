import styles from './SocialLink.module.css'

const icons = {
  linkedin: '💼',
  github: '🐙',
  twitter: '🐦',
  instagram: '📷',
  youtube: '▶️',
  facebook: '👥',
  dribbble: '🏀',
  behance: '🎨',
}

export default function SocialLink({ platform, url, label }) {
  const icon = icons[platform] || '🔗'
  
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.socialLink}
      aria-label={label}
      title={label}
    >
      <span className={styles.icon}>{icon}</span>
    </a>
  )
}
