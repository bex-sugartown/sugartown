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
import link from './objects/link'
import richImage from './objects/richImage'
import ctaButton from './objects/ctaButton'

// Note: portableTextConfig exports utility arrays, not schemas
// These are imported directly in documents that need them

// ============================================================================
// SECTIONS - Page builder components
// ============================================================================
import hero from './sections/hero'
import textSection from './sections/textSection'
import imageGallery from './sections/imageGallery'
import ctaSection from './sections/ctaSection'

// ============================================================================
// DOCUMENTS - Top-level content types
// ============================================================================

// Taxonomy
import category from './documents/category'
import tag from './documents/tag'
import project from './documents/project'

// Core Content
import node from './documents/node'
import post from './documents/post'
import page from './documents/page'
import caseStudy from './documents/caseStudy'

// Infrastructure
import navigation from './documents/navigation'
import siteSettings from './documents/siteSettings'

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
  // Objects (must come first)
  link,
  richImage,
  ctaButton,

  // Sections
  hero,
  textSection,
  imageGallery,
  ctaSection,

  // Documents - Taxonomy
  category,
  tag,
  project,

  // Documents - Core Content
  node,
  post,
  page,
  caseStudy,

  // Documents - Infrastructure
  navigation,
  siteSettings
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
