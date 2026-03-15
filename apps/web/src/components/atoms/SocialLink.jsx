import { SiGithub, SiX, SiInstagram, SiYoutube, SiFacebook, SiDribbble, SiBehance, SiBluesky, SiMastodon } from '@icons-pack/react-simple-icons'
import { Globe, Mail, Rss, ExternalLink } from 'lucide-react'
import styles from './SocialLink.module.css'

/**
 * Solid LinkedIn icon — Simple Icons v13 dropped SiLinkedin.
 * SVG path from Simple Icons (CC0 licence). Renders the filled "in" logotype.
 */
function LinkedInIcon({ size = 24, color = 'currentColor', className, ...props }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={color}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>LinkedIn</title>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

/**
 * Icon map: link.icon schema value → SVG component
 *
 * Brand icons: @icons-pack/react-simple-icons (CC0)
 * LinkedIn: custom solid SVG (Simple Icons CC0 path) — v13 dropped the export
 * Utility icons: lucide-react (ISC)
 *
 * Both `twitter` (legacy) and `x` (new) map to the X icon.
 */
const SOCIAL_ICONS = {
  linkedin:  LinkedInIcon,
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
  website:   Globe,
  email:     Mail,
  rss:       Rss,
  external:  ExternalLink,
}

export default function SocialLink({ platform, url, label }) {
  const IconComponent = SOCIAL_ICONS[platform] || ExternalLink
  const isExternal = url?.startsWith('http')

  return (
    <a
      href={url}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={styles.socialLink}
      aria-label={label}
      title={label}
    >
      <IconComponent size={20} color="currentColor" className={styles.icon} />
    </a>
  )
}
