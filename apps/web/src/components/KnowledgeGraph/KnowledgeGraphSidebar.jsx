/**
 * KnowledgeGraphSidebar — SUG-73 Phase 2
 *
 * Slides in when a graph node is selected. Shows title, project/category
 * chips, tag chips (linked to /tags/:slug), and a CTA to the detail page.
 */
import { Link } from 'react-router-dom'
import { getCanonicalPath } from '../../lib/routes'
import styles from './KnowledgeGraphSidebar.module.css'

export default function KnowledgeGraphSidebar({ node, onClose }) {
  const open = !!node

  return (
    <aside className={`${styles.sidebar} ${open ? styles.open : ''}`} aria-hidden={!open}>
      <div className={styles.inner}>
        {node && <SidebarContent node={node} onClose={onClose} />}
      </div>
    </aside>
  )
}

function SidebarContent({ node, onClose }) {
  const isHub = node.type === 'project' || node.type === 'category'

  return (
    <>
      <button className={styles.close} onClick={onClose} aria-label="Close panel">
        Close ×
      </button>

      <div className={styles.type}>
        {node.type === 'project' ? 'Project hub'
          : node.type === 'category' ? 'Category hub'
          : 'Knowledge node'}
      </div>

      <h2 className={styles.title}>{node.label}</h2>

      {!isHub && (
        <>
          {(node._projects ?? []).length > 0 && (
            <div className={styles.field}>
              <div className={styles.fieldLabel}>Project</div>
              <div className={styles.chips}>
                {node._projects.map(p => (
                  <Link
                    key={p.id}
                    to={p.href}
                    className={`${styles.chip} ${styles.chipProject}`}
                  >
                    {p.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {(node._categories ?? []).length > 0 && (
            <div className={styles.field}>
              <div className={styles.fieldLabel}>Category</div>
              <div className={styles.chips}>
                {node._categories.map(c => (
                  <Link
                    key={c.id}
                    to={c.href}
                    className={`${styles.chip} ${styles.chipCategory}`}
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {(node.tags ?? []).length > 0 && (
            <div className={styles.field}>
              <div className={styles.fieldLabel}>Tags</div>
              <div className={styles.chips}>
                {node.tags.map(t => (
                  <Link
                    key={t.slug}
                    to={getCanonicalPath({ docType: 'tag', slug: t.slug })}
                    className={`${styles.chip} ${styles.chipTag}`}
                  >
                    {t.label ?? t.slug}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <hr className={styles.divider} />
        </>
      )}

      <Link to={node.href} className={styles.cta}>
        {isHub ? `View ${node.type} →` : 'View node →'}
      </Link>
    </>
  )
}
