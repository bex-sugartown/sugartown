import { Link as RouterLink } from 'react-router-dom'
import { LinkProvider } from '@sugartown/design-system'

/**
 * DesignSystemProvider — wires the DS link seam to react-router (SUG-230, SUG-224 Phase 2).
 *
 * Without this, every Card title, Chip, Breadcrumb crumb, and IndexCell row rendered by
 * @sugartown/design-system is a bare <a href>, so clicking one triggers a full page reload
 * instead of client-side SPA navigation.
 *
 * React Router's <Link> takes `to`, not `href` — this adapter is the documented pattern
 * from packages/design-system/CONSUMING.md §React Router.
 *
 * Declared at module scope, not inline: LinkProvider's `component` must be a stable
 * reference or every link beneath it unmounts and remounts on each render.
 */
function RouterLinkAdapter({ href, children, ...rest }) {
  return (
    <RouterLink to={href} {...rest}>
      {children}
    </RouterLink>
  )
}

export default function DesignSystemProvider({ children }) {
  return <LinkProvider component={RouterLinkAdapter}>{children}</LinkProvider>
}
