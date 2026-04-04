import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

const s = {
  page: { fontFamily: 'var(--st-font-family-ui, "Fira Sans", sans-serif)', color: 'var(--st-color-text-primary, rgba(255,255,255,0.85))', lineHeight: 1.6 } as React.CSSProperties,
  h1: { fontFamily: 'var(--st-font-family-narrative, "Playfair Display", serif)', fontSize: '2.5rem', marginBottom: '0.5rem' } as React.CSSProperties,
  h2: { fontSize: '1.3rem', marginBottom: '1rem', marginTop: '2rem' } as React.CSSProperties,
  hr: { border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '2rem 0' } as React.CSSProperties,
  th: { textAlign: 'left' as const, padding: '0.5rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.15)', fontWeight: 600 },
  td: { padding: '0.5rem 1rem' },
  code: { background: 'rgba(255,255,255,0.08)', padding: '0.15rem 0.4rem', borderRadius: '3px', fontSize: '0.85rem', fontFamily: 'var(--st-font-family-mono)' } as React.CSSProperties,
  pre: { background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '6px', overflow: 'auto', fontSize: '0.85rem', fontFamily: 'var(--st-font-family-mono)', marginBottom: '1rem' } as React.CSSProperties,
};

function ContributingPage() {
  return (
    <div style={s.page}>
      <h1 style={s.h1}>Contributing</h1>
      <p>How to add stories, follow naming conventions, and work with mock data.</p>

      <hr style={s.hr} />
      <h2 style={s.h2}>Adding a New Story</h2>
      <p>Create the story file alongside the component. Use the appropriate title prefix:</p>
      <pre style={s.pre}>{`// DS primitive
title: 'Primitives/MyComponent'

// Web pattern component
title: 'Patterns/MyComponent'

// Web layout component
title: 'Layout/MyComponent'`}</pre>

      <h2 style={s.h2}>Sidebar Groups</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
        <thead><tr><th style={s.th}>Group</th><th style={s.th}>Prefix</th><th style={s.th}>Contents</th></tr></thead>
        <tbody>
          <tr><td style={s.td}>Foundations</td><td style={s.td}><code style={s.code}>Foundations/</code></td><td style={s.td}>Colors, Typefaces, documentation pages</td></tr>
          <tr><td style={s.td}>Primitives</td><td style={s.td}><code style={s.code}>Primitives/</code></td><td style={s.td}>DS components (Button, Card, Chip, etc.)</td></tr>
          <tr><td style={s.td}>Patterns</td><td style={s.td}><code style={s.code}>Patterns/</code></td><td style={s.td}>Web data-aware components</td></tr>
          <tr><td style={s.td}>Layout</td><td style={s.td}><code style={s.code}>Layout/</code></td><td style={s.td}>Web page-level components</td></tr>
        </tbody>
      </table>

      <h2 style={s.h2}>Mock Data</h2>
      <p>Web components import from <code style={s.code}>sanity.js</code> and <code style={s.code}>routes.js</code>. The Storybook Vite config mocks these automatically:</p>
      <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
        <li><code style={s.code}>sanity.js</code> &mdash; stub returning placeholder image URLs</li>
        <li><code style={s.code}>contentState.js</code> &mdash; stub for preview mode detection</li>
      </ul>
      <p>For PortableText content, use shared fixtures:</p>
      <pre style={s.pre}>{`import { simpleParagraph, richContent } from './__fixtures__/portableText';`}</pre>

      <h2 style={s.h2}>Story Conventions</h2>
      <ol style={{ paddingLeft: '1.5rem' }}>
        <li>Default story first &mdash; every component should export <code style={s.code}>Default</code></li>
        <li>Name variants descriptively &mdash; <code style={s.code}>WithImage</code>, <code style={s.code}>ThreeCards</code></li>
        <li>Use args for controls &mdash; prefer <code style={s.code}>args</code> over inline JSX</li>
        <li>Mock external deps &mdash; never import the Sanity client in stories</li>
        <li>React Router &mdash; wrap Link-using components with a <code style={s.code}>MemoryRouter</code> decorator</li>
      </ol>
    </div>
  );
}

const meta: Meta = {
  title: 'Foundations/Contributing',
  component: ContributingPage,
  parameters: { layout: 'padded', controls: { disable: true }, actions: { disable: true } },
};
export default meta;
type Story = StoryObj;
export const Default: Story = {};
