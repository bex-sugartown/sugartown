import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

function WelcomePage() {
  return (
    <div style={{ fontFamily: 'var(--st-font-family-ui, "Fira Sans", sans-serif)', color: 'var(--st-color-text-primary, rgba(255,255,255,0.85))', lineHeight: 1.6 }}>
      <h1 style={{ fontFamily: 'var(--st-font-family-narrative, "Playfair Display", serif)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
        Sugartown Pink Design System
      </h1>
      <p style={{ fontSize: '1.1rem', opacity: 0.7, marginBottom: '2rem' }}>
        Welcome to the Sugartown design system &mdash; <strong>Pink Moon edition</strong>.
      </p>

      <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '2rem 0' }} />

      <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Structure</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '0.5rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.15)', fontWeight: 600 }}>Section</th>
            <th style={{ textAlign: 'left', padding: '0.5rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.15)', fontWeight: 600 }}>Contents</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style={{ padding: '0.5rem 1rem' }}><strong>Foundations</strong></td><td style={{ padding: '0.5rem 1rem' }}>Colour palette, typeface specimens, spacing scale</td></tr>
          <tr><td style={{ padding: '0.5rem 1rem' }}><strong>Components</strong></td><td style={{ padding: '0.5rem 1rem' }}>Design system primitives &mdash; Button, Card, Chip, Callout, etc.</td></tr>
          <tr><td style={{ padding: '0.5rem 1rem' }}><strong>Web Components</strong></td><td style={{ padding: '0.5rem 1rem' }}>App-level components &mdash; Header, Footer, ContentCard, Hero, etc.</td></tr>
        </tbody>
      </table>

      <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Themes</h2>
      <p style={{ marginBottom: '1rem' }}>
        Use the <strong>theme switcher</strong> in the toolbar (circle icon) to preview all four variants:
      </p>
      <ul style={{ paddingLeft: '1.5rem', marginBottom: '2rem' }}>
        <li><strong>Dark</strong> (default) &mdash; deep navy with pink and green accents</li>
        <li><strong>Light</strong> &mdash; white background with the same accent palette</li>
        <li><strong>Dark Pink Moon</strong> &mdash; dark base with translucent glass effects</li>
        <li><strong>Light Pink Moon</strong> &mdash; light base with ambient glow</li>
      </ul>

      <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '2rem 0' }} />

      <p style={{ opacity: 0.5, fontSize: '0.85rem' }}>
        Built with React 19, Vite 7, and Storybook 9.
      </p>
    </div>
  );
}

const meta: Meta = {
  title: 'Welcome',
  component: WelcomePage,
  parameters: {
    layout: 'padded',
    controls: { disable: true },
    actions: { disable: true },
  },
};

export default meta;
type Story = StoryObj;

export const Introduction: Story = {};
