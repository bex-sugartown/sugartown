import { PortableText } from '@portabletext/react'
import SanityMedia from './atoms/SanityMedia'
import { LinkAnnotation, DividerBlock } from './portableTextComponents'
import styles from './ContentBlock.module.css'

const components = {
  types: {
    media: ({ value }) => <SanityMedia image={value.image} caption={value.caption} />,
    divider: ({ value }) => <DividerBlock value={value} />,
  },
  block: {
    h2: ({ children }) => <h2 className={styles.h2}>{children}</h2>,
    h3: ({ children }) => <h3 className={styles.h3}>{children}</h3>,
    blockquote: ({ children }) => (
      <blockquote className={styles.blockquote}>{children}</blockquote>
    ),
  },
  marks: {
    link: ({ value, children }) => (
      <LinkAnnotation value={value} className={styles.link}>{children}</LinkAnnotation>
    ),
    strong: ({ children }) => <strong className={styles.strong}>{children}</strong>,
    em: ({ children }) => <em className={styles.em}>{children}</em>,
    code: ({ children }) => <code>{children}</code>,
  },
}

export default function ContentBlock({ content }) {
  if (!content || content.length === 0) return null
  
  return (
    <div className={styles.contentBlock}>
      <PortableText value={content} components={components} />
    </div>
  )
}
