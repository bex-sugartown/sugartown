/**
 * SiteSettingsContext
 *
 * Provides the Sanity siteSettings document (fetched once in App.jsx) to any
 * descendant component without prop drilling. Pages use useSiteSettings() to
 * access global SEO defaults for resolveSeo().
 */
import { createContext, useContext } from 'react'

export const SiteSettingsContext = createContext(null)

/**
 * useSiteSettings() → siteSettings object | null
 *
 * Returns the global siteSettings from Sanity, or null while loading / if
 * unavailable. Components should handle null gracefully.
 */
export function useSiteSettings() {
  return useContext(SiteSettingsContext)
}
