/**
 * ContentNav stories — sequential prev/next navigation pattern.
 *
 * Rendered using a plain-<a> demo component (no react-router dependency)
 * so the story is self-contained. The production component at
 * apps/web/src/components/ContentNav.jsx is an app-level composite that
 * fetches adjacent content from Sanity and uses <Link to> for SPA nav.
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

const NAV_STYLE: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 'var(--st-space-4, 16px)',
  marginTop: 'var(--st-space-7, 56px)',
  paddingTop: 'var(--st-space-5, 32px)',
  borderTop: '1px solid var(--st-color-border-subtle, #e1e3e6)',
};

const ITEM_BASE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--st-space-1, 4px)',
  maxWidth: '45%',
  textDecoration: 'none',
  color: 'inherit',
};

const LABEL_STYLE: React.CSSProperties = {
  fontFamily: 'var(--st-font-family-mono)',
  fontSize: '0.6rem',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--st-color-text-muted, #94a3b8)',
  margin: 0,
};

const TITLE_STYLE: React.CSSProperties = {
  fontFamily: 'var(--st-font-family-ui)',
  fontSize: '0.875rem',
  fontWeight: 600,
  color: 'var(--st-color-brand-primary, #ff247d)',
  margin: 0,
  lineHeight: 1.3,
};

interface NavItemData { title: string; slug: string }

function ContentNavDemo({ prev, next }: { prev: NavItemData | null; next: NavItemData | null }) {
  if (!prev && !next) {
    return (
      <p style={{ color: 'var(--st-color-text-muted, #94a3b8)', fontStyle: 'italic', fontSize: '0.875rem' }}>
        Component returns null when neither prev nor next is available.
      </p>
    );
  }
  return (
    <nav style={NAV_STYLE} aria-label="Article navigation">
      {prev ? (
        <a href={`#${prev.slug}`} style={{ ...ITEM_BASE, alignItems: 'flex-start', marginRight: 'auto' }}>
          <p style={LABEL_STYLE}>← Previous</p>
          <p style={TITLE_STYLE}>{prev.title}</p>
        </a>
      ) : <span />}
      {next && (
        <a href={`#${next.slug}`} style={{ ...ITEM_BASE, alignItems: 'flex-end', marginLeft: 'auto', textAlign: 'right' }}>
          <p style={LABEL_STYLE}>Next →</p>
          <p style={TITLE_STYLE}>{next.title}</p>
        </a>
      )}
    </nav>
  );
}

const PREV: NavItemData = { title: 'Token-Driven Design Systems: From Theme to Architecture', slug: 'token-driven-design-systems' };
const NEXT: NavItemData = { title: 'The Great iCloud Divorce: A Tale of Two AIs', slug: 'icloud-divorce' };

const meta: Meta = {
  title: 'Patterns/ContentNav',
  tags: ['autodocs'],
  parameters: { chromatic: { disableSnapshot: false }, layout: 'padded' },
};

export default meta;
type Story = StoryObj;

export const BothPrevAndNext: Story = { render: () => <ContentNavDemo prev={PREV} next={NEXT} /> };
export const PrevOnly: Story        = { render: () => <ContentNavDemo prev={PREV} next={null} /> };
export const NextOnly: Story        = { render: () => <ContentNavDemo prev={null} next={NEXT} /> };
export const Neither: Story         = { render: () => <ContentNavDemo prev={null} next={null} /> };
