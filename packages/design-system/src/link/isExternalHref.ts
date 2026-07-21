/**
 * External-href detection for the DS link seam (SUG-230).
 *
 * Ports the rule from apps/web/src/lib/linkUtils.js `isExternalUrl()` so the
 * package and the app agree on what "external" means. Any protocol scheme
 * counts — http:, https:, mailto:, tel:, and anything else — because a router
 * link component cannot handle a URL that leaves the app.
 *
 * Protocol-relative URLs (`//cdn.example.com`) are external too: apps/web's
 * regex predates the case, but a router would treat the leading slash as an
 * in-app route and produce a broken link.
 */
export function isExternalHref(href: string | undefined): boolean {
  if (!href) return false;
  // Protocol-relative — leaves the origin without naming a scheme.
  if (href.startsWith('//')) return true;
  // Any protocol scheme → external.
  return /^[a-z][a-z0-9+.-]*:/i.test(href);
}

/**
 * Same-page fragment (`#footnote-3`). Routers either swallow these or push a
 * history entry for a route that does not exist, so they stay plain anchors.
 * A path that merely contains a hash (`/articles/x#section`) is a real route
 * and is not matched here.
 */
export function isFragmentHref(href: string | undefined): boolean {
  return typeof href === 'string' && href.startsWith('#');
}
