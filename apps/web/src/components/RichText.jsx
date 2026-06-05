import { PortableText } from '@portabletext/react'
import { defaultRichTextComponents } from './richTextComponents.jsx'
import styles from './RichText.module.css'

/**
 * RichText — canonical PortableText prose renderer.
 *
 * Renders structured text content (H2–H4, paragraph, bold, italic, inline
 * code, links, blockquote, lists). No layout — max-width and padding belong
 * to the parent container.
 *
 * Pass `components` to override for richer contexts (e.g. PageSections adds
 * richImage, tableBlock, citationRef on top of the text defaults).
 *
 * Default components: see richTextComponents.js / defaultRichTextComponents.
 */
export default function RichText({ content, components }) {
  if (!content?.length) return null
  return (
    <div className={styles.richText}>
      <PortableText value={content} components={components ?? defaultRichTextComponents} />
    </div>
  )
}
