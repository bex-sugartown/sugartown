/**
 * Storybook mock for apps/web/src/lib/sanity.js
 *
 * Provides a stub urlFor() that returns a chainable builder
 * resolving to a placeholder image URL. This avoids needing
 * real Sanity credentials in Storybook.
 */

const PLACEHOLDER = 'https://placehold.co/600x400/0D1226/FF247D?text=Sugartown'

function createBuilder() {
  const builder = {
    width:   () => builder,
    height:  () => builder,
    quality: () => builder,
    auto:    () => builder,
    fit:     () => builder,
    url:     () => PLACEHOLDER,
  }
  return builder
}

export function urlFor() {
  return createBuilder()
}

export const client = {
  fetch: () => Promise.resolve([]),
}

export const rawClient = {
  fetch: () => Promise.resolve([]),
}
