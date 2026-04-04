import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CodeBlock, InlineCode } from './CodeBlock';

/**
 * ## CodeBlock
 *
 * Preformatted code block with syntax highlighting via Prism.js.
 * Custom Sugartown theme: pink keywords, seafoam strings, lime comments.
 *
 * Also exports `InlineCode` for `<code>` within prose text.
 *
 * Canonical CSS: `artifacts/style 260118.css` §02
 */
const meta: Meta<typeof CodeBlock> = {
  title: 'Primitives/CodeBlock',
  component: CodeBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    language: {
      control: { type: 'select' },
      options: [
        'javascript',
        'typescript',
        'css',
        'html',
        'json',
        'bash',
        'python',
        'jsx',
        'tsx',
        'markdown',
        'yaml',
      ],
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'mermaid'],
    },
    showLineNumbers: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '720px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CodeBlock>;

// ── Default (no language — plain text) ───────────────────────────────────────

export const Default: Story = {
  args: {
    code: `# Install dependencies
pnpm add lucide-react --filter @sugartown/design-system
pnpm add prismjs @types/prismjs --filter @sugartown/design-system

# Run Storybook
pnpm storybook`,
  },
};

// ── JavaScript ───────────────────────────────────────────────────────────────

export const JavaScript: Story = {
  args: {
    code: `import { Button } from '@sugartown/design-system';

function Hero({ title, ctas }) {
  const primary = ctas?.[0];
  const isExternal = primary?.url?.startsWith('http');

  return (
    <section className={styles.hero}>
      <h1>{title}</h1>
      {primary && (
        <Button
          variant="primary"
          href={primary.url}
          target={isExternal ? '_blank' : undefined}
        >
          {primary.label}
        </Button>
      )}
    </section>
  );
}`,
    language: 'javascript',
  },
};

// ── CSS ──────────────────────────────────────────────────────────────────────

export const CSS: Story = {
  args: {
    code: `:root {
  --st-color-pink-500: #ff247d;
  --st-color-seafoam-500: #2BD4AA;
  --st-color-lime-500: #D1FF1D;
  --st-color-void-900: #0D1226;
}

.card {
  background: var(--st-card-bg);
  border: 1px solid var(--st-card-border);
  border-radius: var(--st-radius-md);
  box-shadow: var(--st-card-shadow);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--st-shadow-pink-glow);
}`,
    language: 'css',
  },
};

// ── JSX / TSX ────────────────────────────────────────────────────────────────

export const JSXTSX: Story = {
  name: 'JSX / TSX',
  args: {
    code: `interface CardProps {
  eyebrow?: React.ReactNode;
  title: string;
  variant?: 'default' | 'compact' | 'listing' | 'dark';
  as?: React.ElementType;
  children?: React.ReactNode;
}

export function Card({
  eyebrow,
  title,
  variant = 'default',
  as: Root,
  children,
  ...restProps
}: CardProps) {
  const Element = Root ?? 'article';
  return (
    <Element className={styles[variant]} {...restProps}>
      {eyebrow && <div className={styles.eyebrow}>{eyebrow}</div>}
      <h3 className={styles.title}>{title}</h3>
      {children}
    </Element>
  );
}`,
    language: 'tsx',
  },
};

// ── Bash ─────────────────────────────────────────────────────────────────────

export const Bash: Story = {
  args: {
    code: `#!/bin/bash
# Validate token drift between DS and web
pnpm validate:tokens

# Run all validators
pnpm validate:urls && pnpm validate:filters && pnpm validate:content

# Build everything
pnpm turbo build --filter=@sugartown/design-system
pnpm turbo build --filter=apps/web`,
    language: 'bash',
  },
};

// ── Python ───────────────────────────────────────────────────────────────────

export const Python: Story = {
  args: {
    code: `"""Token drift detector — compare two CSS custom property files."""

import re
from pathlib import Path

PROPERTY_RE = re.compile(r'--(st-[\\w-]+)\\s*:\\s*([^;]+);')

def parse_tokens(path: Path) -> dict[str, str]:
    content = path.read_text()
    return {m.group(1): m.group(2).strip() for m in PROPERTY_RE.finditer(content)}

def diff_tokens(a: dict, b: dict) -> tuple[set, set, dict]:
    only_a = set(a) - set(b)
    only_b = set(b) - set(a)
    mismatched = {k: (a[k], b[k]) for k in set(a) & set(b) if a[k] != b[k]}
    return only_a, only_b, mismatched`,
    language: 'python',
  },
};

// ── With Line Numbers ────────────────────────────────────────────────────────

export const WithLineNumbers: Story = {
  args: {
    code: `const CONTENT_TYPE_LABELS = {
  article: 'Article',
  node: 'Node',
  caseStudy: 'Case Study',
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}`,
    language: 'javascript',
    showLineNumbers: true,
  },
};

// ── With Filename ────────────────────────────────────────────────────────────

export const WithFilename: Story = {
  args: {
    code: `export { Button } from './components/Button';
export { Card } from './components/Card';
export { Chip } from './components/Chip';
export { FilterBar } from './components/FilterBar';
export { Table, TableWrap } from './components/Table';
export { Blockquote } from './components/Blockquote';
export { Callout } from './components/Callout';
export { CodeBlock, InlineCode } from './components/CodeBlock';
export { Media } from './components/Media';`,
    language: 'typescript',
    filename: 'packages/design-system/src/index.ts',
  },
};

// ── Inline Code ──────────────────────────────────────────────────────────────

export const InlineCodeStory: Story = {
  name: 'Inline Code',
  render: () => (
    <p style={{ fontSize: '1rem', lineHeight: 1.6, maxWidth: '600px' }}>
      Use <InlineCode>variant=&quot;listing&quot;</InlineCode> on the{' '}
      <InlineCode>Card</InlineCode> component for archive-density layouts.
      The token <InlineCode>--st-color-brand-primary</InlineCode> resolves
      to <InlineCode>#ff247d</InlineCode> (Sugartown Pink).
    </p>
  ),
};

// ── Mermaid ──────────────────────────────────────────────────────────────────

export const Mermaid: Story = {
  args: {
    code: `graph TD
    A[Sanity Studio] -->|GROQ| B[Web App]
    B --> C[DS Components]
    C --> D[Storybook]
    A -->|Schema| E[Portable Text]
    E --> C`,
    variant: 'mermaid',
  },
};

// ── Stress Test: Long Lines ──────────────────────────────────────────────────

export const StressTestLongLines: Story = {
  name: 'Stress Test / Long Lines',
  args: {
    code: `// This is a very long line that should trigger horizontal scrolling in the code block container without breaking the layout or causing the parent to overflow
const VERY_LONG_VARIABLE_NAME_FOR_TESTING_OVERFLOW_BEHAVIOR = 'This string value is also intentionally very long to test how the code block handles horizontal overflow with its overflow-x: auto property';

console.log(VERY_LONG_VARIABLE_NAME_FOR_TESTING_OVERFLOW_BEHAVIOR);`,
    language: 'javascript',
  },
};

// ── Stress Test: Tall Block ──────────────────────────────────────────────────

export const StressTestTallBlock: Story = {
  name: 'Stress Test / Tall Block',
  args: {
    code: Array.from(
      { length: 40 },
      (_, i) => `const line${i + 1} = 'value ${i + 1}';`
    ).join('\n'),
    language: 'javascript',
  },
};

// ── Unknown Language ─────────────────────────────────────────────────────────

export const UnknownLanguage: Story = {
  name: 'Unknown Language',
  args: {
    code: `SECTION .text
global _start

_start:
    mov rax, 1          ; sys_write
    mov rdi, 1          ; stdout
    lea rsi, [message]  ; pointer to message
    mov rdx, 14         ; message length
    syscall

    mov rax, 60         ; sys_exit
    xor rdi, rdi        ; exit code 0
    syscall

SECTION .data
message: db "Hello, World!", 10`,
    language: 'nasm',
  },
};
