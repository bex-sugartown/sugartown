import { PortableText } from '@portabletext/react'
import Media from './atoms/Media'
import styles from './ContentBlock.module.css'

const components = {
  types: {
    media: ({ value }) => <Media image={value.image} caption={value.caption} />,
  },
  block: {
    h2: ({ children }) => <h2 className={styles.h2}>{children}</h2>,
    h3: ({ children }) => <h3 className={styles.h3}>{children}</h3>,
    blockquote: ({ children }) => (
      <blockquote className={styles.blockquote}>{children}</blockquote>
    ),
  },
  marks: {
    link: ({ value, children }) => {
      const target = value?.href?.startsWith('http') ? '_blank' : undefined
      const rel = target === '_blank' ? 'noopener noreferrer' : undefined
      return (
        <a
          href={value?.href}
          target={target}
          rel={rel}
          className={styles.link}
        >
          {children}
        </a>
      )
    },
    strong: ({ children }) => <strong className={styles.strong}>{children}</strong>,
    em: ({ children }) => <em className={styles.em}>{children}</em>,
    code: ({ children }) => <code className={styles.code}>{children}</code>,
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
