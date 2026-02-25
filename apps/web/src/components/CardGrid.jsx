/**
 * TODO Epic 7 — CardGrid wraps EditorialCard (Sanity-connected CMS component).
 * Once a grid context is needed in the design system, consider a layout-only
 * wrapper in packages/design-system that composes <Card> components.
 */
import EditorialCard from './EditorialCard'
import styles from './CardGrid.module.css'

export default function CardGrid({ cards }) {
  if (!cards || cards.length === 0) return null

  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {cards.map((card, index) => (
          <EditorialCard key={index} card={card} />
        ))}
      </div>
    </section>
  )
}
