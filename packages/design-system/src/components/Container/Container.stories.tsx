import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Container } from './Container';

const meta: Meta<typeof Container> = {
  title: 'Foundations/Layout/Container',
  component: Container,
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof Container>;

const DemoBlock = ({ label }: { label: string }) => (
  <div style={{ background: 'var(--st-color-brand-primary)', color: '#fff', padding: '12px 16px', fontFamily: 'var(--st-font-family-mono)', fontSize: '12px' }}>
    {label}
  </div>
);

export const Reading: Story = {
  render: () => (
    <Container size="reading">
      <DemoBlock label="reading — 760px max-width" />
    </Container>
  ),
};

export const Detail: Story = {
  render: () => (
    <Container size="detail">
      <DemoBlock label="detail — 1080px max-width" />
    </Container>
  ),
};

export const Archive: Story = {
  render: () => (
    <Container size="archive">
      <DemoBlock label="archive — 960px max-width" />
    </Container>
  ),
};

export const Bleed: Story = {
  render: () => (
    <Container size="bleed">
      <DemoBlock label="bleed — no max-width constraint" />
    </Container>
  ),
};

/**
 * Inline `style` passthrough (SUG-231).
 *
 * The package copy accepted no `style` prop, so a one-off override the `size`
 * prop cannot express was silently dropped. Both copies now apply it.
 *
 * The outline and tinted background below come from `style` — if they are
 * missing, the passthrough regressed.
 */
export const StylePassthrough: Story = {
  name: 'Inline style passthrough',
  render: () => (
    <Container
      size="reading"
      style={{ outline: '2px dashed var(--st-color-brand-primary)', background: 'var(--st-color-lime-100)', paddingBlock: '24px' }}
    >
      <DemoBlock label="style={{ outline, background, paddingBlock }} applied" />
    </Container>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingBlock: '24px' }}>
      {(['reading', 'detail', 'archive', 'bleed'] as const).map((size) => (
        <Container key={size} size={size}>
          <DemoBlock label={`size="${size}"`} />
        </Container>
      ))}
    </div>
  ),
};
