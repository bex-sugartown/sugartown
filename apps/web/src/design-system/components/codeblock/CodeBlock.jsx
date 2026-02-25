/**
 * CodeBlock + InlineCode — web app adapter of the DS CodeBlock visual primitive.
 *
 * Mirrors: packages/design-system/src/components/CodeBlock/CodeBlock.tsx
 * CSS sync: CodeBlock.module.css must match DS CodeBlock.module.css (see MEMORY.md token drift rules).
 *
 * TODO: When @sugartown/design-system becomes a build-time dependency of apps/web,
 * replace this with a direct re-export from the package.
 */
import { useEffect, useRef } from 'react'
import Prism from 'prismjs'

import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-markup' // HTML
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-markdown'
import 'prismjs/components/prism-yaml'
import 'prismjs/components/prism-sql'

import styles from './CodeBlock.module.css'

const LANGUAGE_LABELS = {
  javascript: 'JS',
  typescript: 'TS',
  jsx: 'JSX',
  tsx: 'TSX',
  css: 'CSS',
  html: 'HTML',
  markup: 'HTML',
  json: 'JSON',
  bash: 'Bash',
  python: 'Python',
  markdown: 'Markdown',
  yaml: 'YAML',
  sql: 'SQL',
}

export default function CodeBlock({
  code,
  language,
  variant = 'default',
  showLineNumbers = false,
  filename,
  className,
}) {
  const codeRef = useRef(null)

  useEffect(() => {
    if (codeRef.current && language) {
      Prism.highlightElement(codeRef.current)
    }
  }, [code, language])

  const isMermaid = variant === 'mermaid'
  const langClass = language ? `language-${language}` : ''
  const label = language ? (LANGUAGE_LABELS[language] ?? language) : undefined

  const blockClassNames = [
    styles.block,
    isMermaid ? styles.mermaid : '',
    showLineNumbers ? styles.lineNumbers : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={blockClassNames}>
      {(label || filename) && !isMermaid && (
        <div className={styles.meta}>
          {filename && <span className={styles.filename}>{filename}</span>}
          {label && <span className={styles.label}>{label}</span>}
        </div>
      )}
      <pre className={styles.pre}>
        <code ref={codeRef} className={`${styles.code} ${langClass}`}>
          {code}
        </code>
      </pre>
    </div>
  )
}

export function InlineCode({ children, className }) {
  return (
    <code className={`${styles.inline} ${className ?? ''}`}>{children}</code>
  )
}
