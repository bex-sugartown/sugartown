/**
 * Shared icon / platform option lists for Sanity schemas.
 *
 * Single source of truth — every schema that offers an icon or platform
 * picker imports from here. Adding or removing a platform only needs
 * one edit in this file.
 *
 * Consumed by:
 *   - link.ts           → icon field (social links on siteSettings, CTA buttons)
 *   - socialLink.ts     → platform field
 *   - person.ts         → socialLinks[].platform, links[].kind
 *
 * Frontend mapping lives in:
 *   - SocialLink.jsx    → SOCIAL_ICONS (brand → Simple Icons, utility → Lucide)
 *   - PersonProfilePage → PLATFORM_CONFIG (same convention)
 */

// ── Social / brand platforms ─────────────────────────────────────────────────
// Each entry is a Sanity options.list item: { title, value }
// Order: alphabetical by brand, utility items last.

export const SOCIAL_PLATFORMS = [
  {title: 'Behance', value: 'behance'},
  {title: 'Bluesky', value: 'bluesky'},
  {title: 'Dribbble', value: 'dribbble'},
  {title: 'Facebook', value: 'facebook'},
  {title: 'GitHub', value: 'github'},
  {title: 'Instagram', value: 'instagram'},
  {title: 'LinkedIn', value: 'linkedin'},
  {title: 'Mastodon', value: 'mastodon'},
  {title: 'X (Twitter)', value: 'x'},
  {title: 'Twitter (legacy)', value: 'twitter'},
  {title: 'YouTube', value: 'youtube'},
] as const

// ── Utility / generic icons ──────────────────────────────────────────────────

export const UTILITY_ICONS = [
  {title: 'Website', value: 'website'},
  {title: 'Email', value: 'email'},
  {title: 'RSS', value: 'rss'},
  {title: 'External Link', value: 'external'},
  {title: 'Other / Generic', value: 'other'},
] as const

// ── Composed lists for specific schema contexts ──────────────────────────────

/** Full icon list — used by link.ts (icon field on CTA buttons, social links, etc.) */
export const LINK_ICON_OPTIONS = [
  ...SOCIAL_PLATFORMS,
  ...UTILITY_ICONS.filter(i => i.value !== 'other'), // link.ts uses 'external' not 'other'
]

/** Social platform list — used by socialLink.ts and person.ts socialLinks[].platform */
export const SOCIAL_PLATFORM_OPTIONS = [
  ...SOCIAL_PLATFORMS,
  ...UTILITY_ICONS,
]

/** Link kind list — used by person.ts legacy links[].kind (no rss/external) */
export const LINK_KIND_OPTIONS = [
  ...SOCIAL_PLATFORMS,
  {title: 'Website', value: 'website'},
  {title: 'Other', value: 'other'},
]

// ── Studio preview labels ────────────────────────────────────────────────────
// Used by socialLink.ts preview.prepare() to show human-readable platform names.

export const PLATFORM_LABELS: Record<string, string> = Object.fromEntries([
  ...SOCIAL_PLATFORMS,
  ...UTILITY_ICONS,
].map(({title, value}) => [value, title]))
