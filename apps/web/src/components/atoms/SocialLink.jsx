import { SiGithub, SiX, SiInstagram, SiYoutube, SiFacebook, SiDribbble, SiBehance, SiBluesky, SiMastodon } from '@icons-pack/react-simple-icons'
import { Linkedin, Mail, Rss, ExternalLink } from 'lucide-react'
import styles from './SocialLink.module.css'

/**
 * Icon map: link.icon schema value → SVG component
 *
 * Brand icons: @icons-pack/react-simple-icons (CC0)
 * LinkedIn + utility icons: lucide-react (ISC) — Simple Icons v13 dropped LinkedIn
 *
 * Both `twitter` (legacy) and `x` (new) map to the X icon.
 */
const SOCIAL_ICONS = {
  linkedin:  Linkedin,
  github:    SiGithub,
  twitter:   SiX,
  x:         SiX,
  instagram: SiInstagram,
  youtube:   SiYoutube,
  facebook:  SiFacebook,
  dribbble:  SiDribbble,
  behance:   SiBehance,
  bluesky:   SiBluesky,
  mastodon:  SiMastodon,
  email:     Mail,
  rss:       Rss,
  external:  ExternalLink,
}

export default function SocialLink({ platform, url, label }) {
  const IconComponent = SOCIAL_ICONS[platform] || ExternalLink

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.socialLink}
      aria-label={label}
      title={label}
    >
      <IconComponent size={20} color="currentColor" className={styles.icon} />
    </a>
  )
}
