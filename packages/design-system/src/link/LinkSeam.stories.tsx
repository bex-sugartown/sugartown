import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { LinkProvider } from './LinkContext';
import type { LinkRenderProps } from './LinkContext';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { List } from '../components/List';
import { IndexCell } from '../components/IndexCell';
import Breadcrumb from '../components/Breadcrumb';

/**
 * Link seam — how DS components resolve navigation (SUG-230).
 *
 * `Card`, `Chip`, `Breadcrumb`, `IndexCell`, and `List` render links through an
 * injectable seam rather than a hard-coded `<a href>`. Mount `LinkProvider` once
 * at the app root and every DS component below it — including components composed
 * internally, like the `Chip`s inside a `Card` — routes through the host router.
 *
 * With nothing injected, every one of them renders a plain `<a href>`. That is the
 * documented default, so the package works untouched in a plain React app.
 *
 * The seam deliberately bypasses the injected component for external URLs
 * (any protocol scheme, or protocol-relative `//host`) and bare `#fragment`
 * hrefs — a router cannot navigate off-origin, and a fragment is not a route.
 *
 * **The two stories below must look identical.** The seam changes which element
 * is rendered, never how it looks. A visual diff between Default and Injected is
 * a defect in the seam, not a new baseline.
 *
 * Wiring per framework is in the package's CONSUMING.md.
 */
const meta: Meta = {
  title: 'Foundations/Link Seam',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj;

// ─── Mock injected link ──────────────────────────────────────────────────────
// Stands in for next/link or a React Router adapter. Renders an anchor so the
// injected path is pixel-identical to the default path; `data-injected` is the
// only trace, so a DOM check can prove the seam fired without a visual change.
function MockRouterLink({ href, children, ...rest }: LinkRenderProps) {
  return (
    <a href={href} data-injected="true" {...rest}>
      {children}
    </a>
  );
}

// ─── Shared fixtures ─────────────────────────────────────────────────────────
const BREADCRUMB_ITEMS = [
  { label: 'Library', href: '/library' },
  { label: 'Tools & Platforms', href: '/tools' },
  { label: 'Vercel' },
];

const LIST_ITEMS = [
  { tag: 'Design Systems', title: 'Tokens All the Way Down', date: '14 Apr 2026', href: '/articles/tokens' },
  { tag: 'Engineering & DX', title: 'The Site That Built Itself', date: '28 Apr 2026', href: '/articles/site' },
];

/** Every seamed component in one column. Rendered identically by both stories. */
function SeamedComponents() {
  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      <Breadcrumb items={BREADCRUMB_ITEMS} />

      <Card
        title="Structured Content for Agentic Search"
        eyebrow="Article"
        href="/articles/structured-content"
        excerpt="Card seams five links: title, category, project, footer category, and the KPI link."
        category={{ label: 'Content Architecture', href: '/categories/content-architecture' }}
        project={{ label: 'Sugartown Platform', href: '/projects/sugartown' }}
        tags={[
          { label: 'GROQ', href: '/tags/groq' },
          { label: 'Portable Text', href: '/tags/portable-text' },
        ]}
        tools={[{ label: 'Sanity', href: '/tools/sanity' }]}
        kpiLink={{ label: 'View', href: '/kpis/structured-content' }}
        date="2026-04-02"
      />

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <Chip variant="tag" label="Internal route" href="/tags/internal" />
        <Chip variant="tag" label="External (bypasses seam)" href="https://vercel.com" />
        <Chip variant="tag" label="Fragment (bypasses seam)" href="#footnotes" />
        <Chip variant="tag" label="Not a link" />
      </div>

      <div style={{ display: 'flex', gap: '0.25rem' }}>
        <IndexCell as="a" href="/library/a">A</IndexCell>
        <IndexCell as="a" href="/library/b">B</IndexCell>
        <IndexCell state="selected" as="a" href="/library/c">C</IndexCell>
        <IndexCell state="inactive" as="span">D</IndexCell>
      </div>

      <List variant="register" title="Articles" items={LIST_ITEMS} />
    </div>
  );
}

/** No provider mounted — every link is a plain `<a href>`. The default for any consumer that has not opted in. */
export const Default: Story = {
  render: () => <SeamedComponents />,
};

/**
 * Wrapped in `LinkProvider` — internal links resolve through the injected component.
 * Inspect any internal link and it carries `data-injected="true"`; the external and
 * fragment chips do not, because the seam bypasses them.
 */
export const Injected: Story = {
  render: () => (
    <LinkProvider component={MockRouterLink}>
      <SeamedComponents />
    </LinkProvider>
  ),
};

/**
 * Chromatic VRT — both paths side by side. These two columns must render identically.
 * Any diff between them means the seam leaked into the rendered output.
 */
export const Snapshot: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', padding: '2rem' }}>
      <div>
        <h3 style={{ fontFamily: 'var(--st-font-family-mono)', fontSize: 'var(--st-font-size-sm)', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
          Default — plain anchors
        </h3>
        <SeamedComponents />
      </div>
      <div>
        <h3 style={{ fontFamily: 'var(--st-font-family-mono)', fontSize: 'var(--st-font-size-sm)', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
          Injected — router links
        </h3>
        <LinkProvider component={MockRouterLink}>
          <SeamedComponents />
        </LinkProvider>
      </div>
    </div>
  ),
};
