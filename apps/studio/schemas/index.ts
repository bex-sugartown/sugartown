/**
 * Sanity Schema Registry - Sugartown CMS
 *
 * Phase 1: Foundation schemas for WordPress → Sanity migration
 *
 * Architecture:
 * - Objects: Atomic, reusable components (link, richImage, ctaButton, portableText configs)
 * - Sections: Page builder components (hero, textSection, imageGallery, ctaSection)
 * - Documents: Top-level content types (nodes, articles, pages, case studies, etc.)
 *
 * Pattern: Resume Factory-inspired - references over strings, atomic objects, composability
 */

// ============================================================================
// OBJECTS - Atomic, reusable components (must come first for type resolution)
// ============================================================================

// New schemas
import link from './objects/link'
import richImage from './objects/richImage'
import galleryImage from './objects/galleryImage'
import ctaButton from './objects/ctaButton'
import editorialCard from './objects/editorialCard'
import linkItem from './objects/linkItem'
import cardBuilderItem from './objects/cardBuilderItem'
import seoMetadata from './objects/seoMetadata'
import legacySource from './objects/legacySource'
import mediaOverlay from './objects/mediaOverlay'
import tableBlock from './objects/tableBlock'
import citationItem from './objects/citationItem'
import navItem from './objects/navItem'
import childNavItem from './objects/childNavItem'

// Legacy schemas
import logo from './objects/logo'
import media from './objects/media'
import navigationItem from './objects/navigationItem'
import socialLink from './objects/socialLink'

// Note: portableTextConfig exports utility arrays, not schemas
// These are imported directly in documents that need them

// ============================================================================
// SECTIONS - Page builder components
// ============================================================================
import heroSectionType from './sections/hero'
import textSection from './sections/textSection'
import imageGallery from './sections/imageGallery'
import ctaSection from './sections/ctaSection'
import htmlSection from './sections/htmlSection'
import cardBuilderSection from './sections/cardBuilderSection'
import calloutSection from './sections/calloutSection'
import mermaidSection from './sections/mermaidSection'
import accordionSection from './sections/accordionSection'

// ============================================================================
// DOCUMENTS - Top-level content types
// ============================================================================

// Taxonomy (New)
import category from './documents/category'
import tag from './documents/tag'
import tool from './documents/tool'
import project from './documents/project'
import person from './documents/person'
import series from './documents/series'

// Core Content (New)
import node from './documents/node'
import article from './documents/article'
import page from './documents/page'
import caseStudy from './documents/caseStudy'

// Infrastructure (New)
import navigation from './documents/navigation'
import siteSettings from './documents/siteSettings'
import preheader from './documents/preheader'
import ctaButtonDoc from './documents/ctaButtonDoc'
import archivePage from './documents/archivePage'
import redirect from './documents/redirect'

// Legacy Documents (DEPRECATED - kept for backwards compatibility only)
// Use siteSettings for header/footer, page (slug: "home") for homepage, page sections for content
import header from './documents/header'
import footer from './documents/footer'
import hero from './documents/hero'
import homepage from './documents/homepage'
import contentBlock from './documents/contentBlock'

// ============================================================================
// SCHEMA EXPORT
// ============================================================================

/**
 * Export all schema types in dependency order:
 * 1. Objects (dependencies for everything else)
 * 2. Sections (used by pages and case studies)
 * 3. Documents (top-level content types)
 */
export const schemaTypes = [
  // Objects - New
  link,
  linkItem,
  richImage,
  galleryImage,
  ctaButton,
  editorialCard,
  cardBuilderItem,
  seoMetadata,
  legacySource,
  mediaOverlay,
  tableBlock,
  citationItem,
  navItem,
  childNavItem,

  // Objects - Legacy
  logo,
  media,
  navigationItem,
  socialLink,

  // Sections - New
  heroSectionType,
  textSection,
  imageGallery,
  ctaSection,
  htmlSection,
  cardBuilderSection,
  calloutSection,
  mermaidSection,
  accordionSection,

  // Documents - Taxonomy (New)
  category,
  tag,
  tool,
  project,
  person,
  series,

  // Documents - Core Content (New)
  node,
  article,
  page,
  caseStudy,

  // Documents - Infrastructure (New)
  navigation,
  siteSettings,
  preheader,
  ctaButtonDoc,
  archivePage,
  redirect,

  // Documents - Legacy (DEPRECATED)
  header,
  footer,
  hero,
  homepage,
  contentBlock
]

/**
 * Schema organization for Sanity Studio desk structure:
 *
 * Suggested groupings:
 * - Knowledge Graph: node
 * - Content: article, page, caseStudy, archivePage
 * - Taxonomy: category, tag, tool, project
 * - Site Config: navigation, siteSettings
 *
 * Embedded objects (not standalone documents):
 * - seoMetadata: Reusable SEO object embedded in pages, articles, archive pages
 */
