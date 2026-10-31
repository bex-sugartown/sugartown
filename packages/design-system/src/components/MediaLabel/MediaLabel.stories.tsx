import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Media } from '../Media';
import { Card } from '../Card';

const SAMPLE_IMAGE = 'https://cdn.sanity.io/images/poalmzla/production/d25c51b4126def2a72be61213f4fe69a909151fd-6000x4500.jpg?w=1200&h=800&fit=crop';

/**
 * MediaLabel renders through Media (`label`) and Card (`thumbnailLabel`). It sizes from the width of
 * the image it sits on, using container queries, so the stories below pin the image width. The
 * text here is the AI-generated label Sugartown passes (`aiLabelProps` in the web app).
 * Vspec: docs/drafts/ST-181-ai-image-provenance-compliance-gaps.vspec.html
 */
const exampleLabel = (tool?: string) => ({
  short: 'AI',
  full: 'AI-generated',
  detail: tool,
  ariaLabel: tool ? `AI-generated image, ${tool}` : 'AI-generated image',
});
const meta: Meta<typeof Media> = {
  title: 'Components/MediaLabel',
  component: Media,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { src: SAMPLE_IMAGE, alt: 'Sample photograph', label: exampleLabel('Gemini') },
};
export default meta;
type Story = StoryObj<typeof Media>;

/**
 * ST-181: one story per use case group, not one per variant. Each story is one Chromatic snapshot,
 * so cases that differ only by width, tool or surface are shown together in a single frame.
 */
const Row = ({ label, width, children }: { label: string; width: number; children: React.ReactNode }) => (
  <div style={{ display: 'grid', gap: 4 }}>
    <small style={{ fontFamily: 'var(--st-font-family-mono)', fontSize: 11 }}>{label}</small>
    <div style={{ width }}>{children}</div>
  </div>
);

const grid: React.CSSProperties = { display: 'grid', gap: 24 };

/** Width tiers: nothing under 96 px, "AI" to 199 px, "AI-generated" from 200 px, tool name on hover from 320 px. */
export const Widths: Story = {
  render: (args) => (
    <div style={grid}>
      {[480, 320, 240, 160, 96, 80].map((w) => (
        <Row key={w} label={`${w} px`} width={w}><Media {...args} /></Row>
      ))}
    </div>
  ),
};

/** Tool and flag states at 480 px: not flagged, no tool recorded, a known tool, and Other (no name shown). */
export const ToolStates: Story = {
  render: (args) => (
    <div style={grid}>
      <Row label="Not flagged: no label" width={480}><Media {...args} label={undefined} /></Row>
      <Row label="No tool recorded" width={480}><Media {...args} label={exampleLabel()} /></Row>
      <Row label="Adobe Firefly" width={480}><Media {...args} label={exampleLabel('Adobe Firefly')} /></Row>
      <Row label="Other: no name shown" width={480}><Media {...args} label={exampleLabel()} /></Row>
    </div>
  ),
};

/** Cards: decorative label (no tool name, not focusable, clicks reach the card link); the listing rail reads "AI". */
export const OnCards: StoryObj<typeof Card> = {
  render: () => (
    <div style={grid}>
      <Row label="Card thumbnail, flagged" width={360}>
        <Card title="A card with an AI-generated thumbnail" thumbnailUrl={SAMPLE_IMAGE} thumbnailAlt="Sample" thumbnailLabel={exampleLabel()} />
      </Row>
      <Row label="Card thumbnail, not flagged" width={360}>
        <Card title="A card with an ordinary thumbnail" thumbnailUrl={SAMPLE_IMAGE} thumbnailAlt="Sample" />
      </Row>
      <Row label="Listing rail, flagged" width={560}>
        <Card variant="listing" title="A listing card with an AI-generated thumbnail" thumbnailUrl={SAMPLE_IMAGE} thumbnailAlt="Sample" thumbnailLabel={exampleLabel()} />
      </Row>
    </div>
  ),
};

/** Media treatments: duotone overlay, caption below, stamped copies (served from srcset), and a cropped gallery-style frame. */
export const MediaTreatments: Story = {
  render: (args) => (
    <div style={grid}>
      <Row label="Duotone overlay" width={480}><Media {...args} overlay={{ type: 'duotone', duotonePreset: 'standard' }} /></Row>
      <Row label="Caption sits below the image, not under the label" width={480}>
        <Media {...args} caption="Caption sits below the image, not under the label." />
      </Row>
      <Row label="Stamped copies (ST-178): served from srcset" width={480}>
        <Media
          {...args}
          provenance={[
            { width: 480, url: `${SAMPLE_IMAGE}&w=480` },
            { width: 960, url: `${SAMPLE_IMAGE}&w=960` },
            { width: 1920, url: `${SAMPLE_IMAGE}&w=1920` },
          ]}
        />
      </Row>
      <Row label="Gallery-style frame: 4/3 with hotspot crop" width={360}>
        <Media {...args} aspectRatio="4/3" hotspot={{ x: 0.5, y: 0.4 }} />
      </Row>
    </div>
  ),
};
