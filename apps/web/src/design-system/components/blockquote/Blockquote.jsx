/**
 * Blockquote — web app adapter of the DS Blockquote visual primitive.
 *
 * Mirrors: packages/design-system/src/components/Blockquote/Blockquote.tsx
 * CSS sync: Blockquote.module.css must match DS Blockquote.module.css (see MEMORY.md token drift rules).
 *
 * TODO: When @sugartown/design-system becomes a build-time dependency of apps/web,
 * replace this with a direct re-export from the package.
 */
import styles from './Blockquote.module.css'

export default function Blockquote({ children, citation, className }) {
  return (
    <blockquote className={`${styles.blockquote} ${className ?? ''}`}>
      {children}
      {citation && (
        <footer className={styles.footer}>
          <cite className={styles.cite}>{citation}</cite>
        </footer>
      )}
    </blockquote>
  )
}
