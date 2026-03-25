/**
 * heroUtils — shared lead-hero extraction for detail pages.
 *
 * All three detail page templates (CaseStudyPage, ArticlePage, NodePage)
 * extract the first section if it's a hero, render it full-bleed above the
 * detail container, and pass the remaining sections to PageSections.
 *
 * This utility DRYs that logic into a single function.
 *
 * SUG-33 — Detail Page Hero & Metadata Refinement
 */
import { urlFor } from './sanity'

/**
 * isHeroSection(section) → boolean
 * Returns true if the section is a hero section type.
 */
export function isHeroSection(section) {
  return section?._type === 'heroSection' || section?._type === 'hero'
}

/**
 * extractLeadHero(sections) → { leadHero, restSections, heroImageUrl }
 *
 * Extracts the leading hero section (if sections[0] is a hero type) and
 * returns the hero, remaining sections, and a pre-built OG image URL.
 *
 * @param {Array} sections — the sections array from a Sanity document
 * @returns {{ leadHero: object|null, restSections: Array, heroImageUrl: string|undefined }}
 */
export function extractLeadHero(sections) {
  const allSections = sections ?? []
  const leadHero = allSections[0] && isHeroSection(allSections[0]) ? allSections[0] : null
  const restSections = leadHero ? allSections.slice(1) : allSections
  const heroImageUrl = leadHero?.backgroundImage?.asset
    ? urlFor(leadHero.backgroundImage.asset).width(1920).quality(90).url()
    : undefined

  return { leadHero, restSections, heroImageUrl }
}
