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
