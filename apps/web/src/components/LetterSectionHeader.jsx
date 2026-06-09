/**
 * LetterSectionHeader — letter glyph + full-width rule for A-Z archive sections.
 * Used by GlossaryArchivePage and any future A-Z indexed listing.
 */
import styles from './LetterSectionHeader.module.css'

export default function LetterSectionHeader({ letter }) {
  return (
    <div className={styles.root}>
      <span className={styles.glyph}>{letter}</span>
      <div className={styles.rule} aria-hidden="true" />
    </div>
  )
}
