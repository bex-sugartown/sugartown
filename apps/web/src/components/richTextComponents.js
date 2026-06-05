import { Blockquote } from '../design-system'
import { LinkAnnotation } from './portableTextComponents'
import styles from './RichText.module.css'

/**
 * Default PortableText components for standalone prose rendering.
 * Text-only: H2–H4, blockquote, inline marks (bold, italic, code, link).
 * No image, table, or citation — those belong to section-level renderers.
 *
 * Import and extend in PageSections or other rich contexts.
 */
export const defaultRichTextComponents = {
  block: {
    h2: ({ children }) => <h2 className={styles.h2}>{children}</h2>,
    h3: ({ children }) => <h3 className={styles.h3}>{children}</h3>,
    h4: ({ children }) => <h4 className={styles.h4}>{children}</h4>,
    blockquote: ({ children }) => <Blockquote>{children}</Blockquote>,
  },
  marks: {
    link: ({ value, children }) => (
      <LinkAnnotation value={value} className={styles.link}>{children}</LinkAnnotation>
    ),
    strong: ({ children }) => <strong className={styles.strong}>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    code: ({ children }) => <code>{children}</code>,
  },
}
