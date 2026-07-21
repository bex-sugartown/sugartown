import React from 'react';

/**
 * Props an injected link component receives from the DS (SUG-230).
 *
 * Deliberately anchor-shaped: `href` plus the standard anchor attributes the
 * seamed components already pass (className, style, aria-label, children).
 * next/link matches this signature as-is. React Router's Link takes `to`, so
 * apps/web supplies a one-line adapter — see CONSUMING.md.
 */
export interface LinkRenderProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

/** Any component that can render a navigation link from `href`. */
export type LinkComponent = React.ComponentType<LinkRenderProps>;

/**
 * null = nothing injected = the documented default. Every seamed component
 * falls back to a plain <a href>, so the package works untouched in a plain
 * React app and no existing consumer breaks by upgrading.
 */
const LinkContext = React.createContext<LinkComponent | null>(null);

export interface LinkProviderProps {
  /**
   * The router's link component. Mount once at the app root; every DS
   * component below it resolves its links through this, including components
   * composed internally (Card renders Chip, which reads the same context).
   *
   * **Must be a stable reference.** Declare it at module scope, or memoise it.
   * Passing a fresh inline arrow (`component={props => <Link {...props} />}`)
   * gives React a new element type on every render, which unmounts and
   * remounts every link beneath the provider each time — losing focus and any
   * DOM state. This is the one way to misuse the seam, and it fails quietly.
   */
  component: LinkComponent;
  children?: React.ReactNode;
}

export function LinkProvider({ component, children }: LinkProviderProps) {
  return <LinkContext.Provider value={component}>{children}</LinkContext.Provider>;
}

/**
 * Returns the injected link component, or null when no provider is mounted.
 * Components should render <Link> rather than calling this directly — the
 * resolver also owns the external-URL and fragment bypasses.
 */
export function useLinkComponent(): LinkComponent | null {
  return React.useContext(LinkContext);
}
