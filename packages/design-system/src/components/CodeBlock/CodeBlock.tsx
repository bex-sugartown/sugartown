import React, { useEffect, useRef } from 'react';
import Prism from 'prismjs';

// Load default languages
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup'; // HTML
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-sql';

import styles from './CodeBlock.module.css';

/**
 * CodeBlock — Sugartown Design System
 *
 * Preformatted code block with syntax highlighting via Prism.js.
 * Custom Sugartown theme: pink keywords, seafoam strings, lime comments.
 *
 * Canonical CSS: artifacts/style 260118.css §02 Canonical HTML
 */
export interface CodeBlockProps {
  /** Source code to display */
  code: string;
  /** Prism.js language identifier (e.g. 'javascript', 'css') */
  language?: string;
  /** Visual variant */
  variant?: 'default' | 'mermaid';
  /** Show line numbers */
  showLineNumbers?: boolean;
  /** Optional filename label (displayed above the code) */
  filename?: string;
  className?: string;
}

/** Map of language aliases for display label */
const LANGUAGE_LABELS: Record<string, string> = {
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
};

export function CodeBlock({
  code,
  language,
  variant = 'default',
  showLineNumbers = false,
  filename,
  className,
}: CodeBlockProps) {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current && language) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, language]);

  const isMermaid = variant === 'mermaid';
  const langClass = language ? `language-${language}` : '';
  const label = language ? LANGUAGE_LABELS[language] ?? language : undefined;

  const blockClassNames = [
    styles.block,
    isMermaid ? styles.mermaid : '',
    showLineNumbers ? styles.lineNumbers : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

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
  );
}

/**
 * InlineCode — Sugartown Design System
 *
 * Inline code within prose text. Maroon text on light grey background.
 */
export interface InlineCodeProps {
  children: React.ReactNode;
  className?: string;
}

export function InlineCode({ children, className }: InlineCodeProps) {
  return (
    <code className={`${styles.inline} ${className ?? ''}`}>{children}</code>
  );
}
