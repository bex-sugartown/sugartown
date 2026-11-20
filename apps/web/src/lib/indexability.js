/**
 * indexability.js — when a taxonomy or tool detail page is too thin to index.
 *
 * One definition shared by the pages that set robots on the client
 * (ToolDetailPage, TaxonomyDetailPage) and by scripts/prerender-content.mjs,
 * which writes the same robots tag into the static snapshot (#212). Import-free,
 * so plain Node can load it.
 */

/** A detail page linking fewer content items than this is noindex, follow. */
export const MIN_INDEXABLE_ITEMS = 3
