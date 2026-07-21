import React from 'react';
import { useLinkComponent } from './LinkContext';
import { isExternalHref, isFragmentHref } from './isExternalHref';

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Destination. When absent, children render unwrapped. */
  href?: string;
}

/**
 * Link — the DS's internal link resolver (SUG-230).
 *
 * The single place any seamed component turns an href into an element. Package
 * components render this instead of <a> so navigation is injectable without the
 * package importing a router.
 *
 * Resolution order:
 *   1. no href                        → children, unwrapped
 *   2. external or protocol-relative  → plain <a> (a router cannot leave the app)
 *   3. bare #fragment                 → plain <a> (not a route)
 *   4. no provider mounted            → plain <a> (the documented default)
 *   5. otherwise                      → the injected component
 *
 * Note it does NOT add target/rel to external links. That is an editorial
 * choice these components do not currently make, and adding it would change
 * the default path's behaviour for existing consumers. The resolver's only job
 * is picking the element.
 */
export function Link({ href, children, ...rest }: LinkProps) {
  const Injected = useLinkComponent();

  if (!href) return <>{children}</>;

  if (!Injected || isExternalHref(href) || isFragmentHref(href)) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  }

  // Injection is the point of this seam: the element type comes from the host
  // app, so the linter cannot see that it is a stable module-level component.
  // The rule's real concern — an unstable identity remounting every link on
  // each render — is pushed onto the provider instead, where the caller can
  // actually control it. See LinkProvider's `component` docs.
  // eslint-disable-next-line react-hooks/static-components
  return <Injected href={href} {...rest}>{children}</Injected>;
}
