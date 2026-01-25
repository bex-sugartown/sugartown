/**
 * Sanity Schema Registry - Sugartown CMS
 *
 * Phase 1: Foundation schemas for WordPress → Sanity migration
 *
 * Architecture:
 * - Objects: Atomic, reusable components (link, richImage, ctaButton, portableText configs)
 * - Sections: Page builder components (hero, textSection, imageGallery, ctaSection)
 * - Documents: Top-level content types (nodes, posts, pages, case studies, etc.)
 *
 * Pattern: Resume Factory-inspired - references over strings, atomic objects, composability
 */

// ============================================================================
// OBJECTS - Atomic, reusable components (must come first for type resolution)
// ============================================================================

// New schemas
import link from './objects/link'
import richImage from './objects/richImage'
import ctaButton from './objects/ctaButton'
import editorialCard from './objects/editorialCard'

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

// ============================================================================
// DOCUMENTS - Top-level content types
// ============================================================================

// Taxonomy (New)
import category from './documents/category'
import tag from './documents/tag'
import project from './documents/project'

// Core Content (New)
import node from './documents/node'
import post from './documents/post'
import page from './documents/page'
import caseStudy from './documents/caseStudy'

// Infrastructure (New)
import navigation from './documents/navigation'
import siteSettings from './documents/siteSettings'
import preheader from './documents/preheader'
import ctaButtonDoc from './documents/ctaButtonDoc'
import homepage from './documents/homepage'

// Legacy Documents (DEPRECATED - kept for backwards compatibility only)
// Use siteSettings for header/footer, homepage for hero, page sections for content
import header from './documents/header'
import footer from './documents/footer'
import hero from './documents/hero'
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
  richImage,
  ctaButton,
  editorialCard,

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

  // Documents - Taxonomy (New)
  category,
  tag,
  project,

  // Documents - Core Content (New)
  node,
  post,
  page,
  caseStudy,

  // Documents - Infrastructure (New)
  navigation,
  siteSettings,
  preheader,
  ctaButtonDoc,
  homepage,

  // Documents - Legacy (DEPRECATED)
  header,
  footer,
  hero,
  contentBlock
]

/**
 * Schema organization for Sanity Studio desk structure:
 *
 * Suggested groupings:
 * - Knowledge Graph: node
 * - Content: post, page, caseStudy
 * - Taxonomy: category, tag, project
 * - Site Config: navigation, siteSettings
 */
