/**
 * person.js — Stage 5: Person/Profile helpers
 *
 * Centralizes all author/person utility logic for the frontend.
 * All components that render author attribution should use these helpers
 * rather than duplicating logic.
 *
 * Author shape (from PERSON_FRAGMENT in queries.js):
 * {
 *   _id: string
 *   name: string              // Full legal name (resume/formal contexts)
 *   shortName: string|null    // Preferred byline name (article attribution)
 *   slug: string
 *   titles: string[]          // e.g., ["Content Architect", "Designer"]
 *   primaryTitle: string      // titles[0] — convenience alias
 *   image: { asset: { _id, url }, alt: string } | null
 *   links: Array<{ label, url, kind }> | null
 * }
 */

/**
 * getPrimaryAuthor(authors)
 *
 * Returns the first author from an authors[] array.
 * Handles null/undefined gracefully.
 *
 * @param {Array|null|undefined} authors
 * @returns {object|null}
 */
export function getPrimaryAuthor(authors) {
  if (!Array.isArray(authors) || authors.length === 0) return null
  return authors[0]
}

/**
 * getAuthorDisplayName(author)
 *
 * Returns the display name for a person object.
 * Falls back to 'Unknown Author' if no name is set.
 *
 * @param {object|null|undefined} author
 * @returns {string}
 */
export function getAuthorDisplayName(author) {
  return author?.shortName || author?.name || 'Unknown Author'
}

/**
 * getAuthorByline(authors, legacyAuthorString)
 *
 * Returns the best available author string for a byline.
 * Prefers authors[] (canonical), falls back to legacy string field.
 * Logs a console warning in dev if falling back to legacy.
 *
 * @param {Array|null|undefined} authors   - from authors[]->
 * @param {string|null|undefined} legacy   - from post.author (legacy string)
 * @returns {string|null} display name, or null if neither is available
 */
export function getAuthorByline(authors, legacy) {
  const primary = getPrimaryAuthor(authors)
  if (primary) return primary.shortName || primary.name

  if (legacy) {
    if (import.meta.env.DEV) {
      console.warn(
        '[person] Falling back to legacy author string. ' +
        'Create a Person doc and link it via authors[] to resolve this warning.'
      )
    }
    return legacy
  }

  return null
}

/**
 * getAuthorImageUrl(author)
 *
 * Returns the image URL for a person, or null if no image.
 *
 * @param {object|null|undefined} author
 * @returns {string|null}
 */
export function getAuthorImageUrl(author) {
  return author?.image?.asset?.url ?? null
}

/**
 * getLinkByKind(author, kind)
 *
 * Returns the first link of a given kind from a person's links[].
 * Useful for rendering specific social icons.
 *
 * @param {object|null|undefined} author
 * @param {'website'|'linkedin'|'github'|'twitter'|'instagram'|'other'} kind
 * @returns {{ label, url, kind }|null}
 */
export function getLinkByKind(author, kind) {
  if (!author?.links) return null
  return author.links.find((l) => l.kind === kind) ?? null
}
