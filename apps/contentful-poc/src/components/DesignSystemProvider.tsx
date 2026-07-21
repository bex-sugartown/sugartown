"use client";

import NextLink from "next/link";
import { LinkProvider } from "@sugartown/design-system";
import type { LinkRenderProps } from "@sugartown/design-system";

/**
 * DesignSystemProvider — wires the DS link seam to next/link (SUG-230).
 *
 * Without this, every Card title, Chip, and Breadcrumb crumb rendered by
 * @sugartown/design-system is a bare <a href>, so clicking one triggers a full
 * document load instead of a client-side navigation.
 *
 * Declared at module scope, not inline: LinkProvider's `component` must be a
 * stable reference or React remounts every link beneath it on each render.
 *
 * next/link already takes `href` plus the standard anchor attributes, so it is
 * a near drop-in. The wrapper exists only to pin the prop type to the seam's
 * contract — next/link's own `href` also accepts a UrlObject, which the DS
 * never passes.
 */
function NextLinkAdapter({ href, children, ...rest }: LinkRenderProps) {
  return (
    <NextLink href={href} {...rest}>
      {children}
    </NextLink>
  );
}

/**
 * Client boundary for the provider. `layout.tsx` is an async server component,
 * so the context provider has to live in a client component — but `children`
 * stay server-rendered and are passed through untouched.
 */
export function DesignSystemProvider({ children }: { children: React.ReactNode }) {
  return <LinkProvider component={NextLinkAdapter}>{children}</LinkProvider>;
}
