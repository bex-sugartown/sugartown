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
 * extractLeadHero(sections, docHero) → { leadHero, restSections, heroImageUrl }
 *
 * Resolves the hero for a detail page from two possible sources:
 * 1. `docHero` — the dedicated document-level `hero` field (Hero tab in Studio)
 * 2. `sections[0]` — legacy: first section if it's a hero type
 *
 * When `docHero` is used, sections are returned unmodified (nothing stripped).
 * When falling back to sections[0], the hero is removed from the rest.
 *
 * @param {Array} sections — the sections array from a Sanity document
 * @param {object} [docHero] — the document-level hero field (optional)
 * @returns {{ leadHero: object|null, restSections: Array, heroImageUrl: string|undefined }}
 */
export function extractLeadHero(sections, docHero) {
  const allSections = sections ?? []

  // Prefer dedicated hero field (Hero tab) over sections[0] extraction
  if (docHero?.heading) {
    const heroImageUrl = docHero.backgroundImage?.asset
      ? urlFor(docHero.backgroundImage.asset).width(1920).quality(90).url()
      : undefined
    // Ensure _type is set so PageSections/HeroSection recognises it
    const leadHero = { _type: 'heroSection', ...docHero }
    return { leadHero, restSections: allSections, heroImageUrl }
  }

  // Fallback: extract from sections[0]
  const leadHero = allSections[0] && isHeroSection(allSections[0]) ? allSections[0] : null
  const restSections = leadHero ? allSections.slice(1) : allSections
  const heroImageUrl = leadHero?.backgroundImage?.asset
    ? urlFor(leadHero.backgroundImage.asset).width(1920).quality(90).url()
    : undefined

  return { leadHero, restSections, heroImageUrl }
}
