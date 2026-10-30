import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Media } from '../Media';

const SAMPLE_IMAGE = 'https://cdn.sanity.io/images/poalmzla/production/d25c51b4126def2a72be61213f4fe69a909151fd-6000x4500.jpg?w=1200&h=800&fit=crop';

/**
 * AiLabel renders through Media (`aiGenerated`, `aiTool`). It sizes from the width of the image it
 * sits on, using container queries, so the stories below pin the image width.
 * Vspec: docs/drafts/ST-178-ai-image-provenance-metadata-and-watermark.vspec.html
 */
const meta: Meta<typeof Media> = {
  title: 'Components/AiLabel',
  component: Media,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { src: SAMPLE_IMAGE, alt: 'Sample photograph', aiGenerated: true, aiTool: 'midjourney' },
};
export default meta;
type Story = StoryObj<typeof Media>;

const at = (w: number) => {
  const Decorator = (StoryFn: React.ComponentType) => (
    <div style={{ width: w }}><StoryFn /></div>
  );
  Decorator.displayName = `AtWidth${w}`;
  return Decorator;
};

export const NotAiGenerated: Story = { args: { aiGenerated: false }, decorators: [at(480)] };
export const NoToolRecorded: Story = { args: { aiTool: undefined }, decorators: [at(480)] };
export const AdobeFirefly: Story = { args: { aiTool: 'adobe-firefly' }, decorators: [at(480)] };
export const OtherToolShowsNoName: Story = { args: { aiTool: 'other' }, decorators: [at(480)] };
export const Width480_ToolOnHover: Story = { decorators: [at(480)] };
export const Width320_ToolOnHover: Story = { decorators: [at(320)] };
export const Width240_FullTextNoTool: Story = { decorators: [at(240)] };
export const Width160_ShortText: Story = { decorators: [at(160)] };
export const Width96_ShortText: Story = { decorators: [at(96)] };
export const Width80_NoLabel: Story = { decorators: [at(80)] };
export const WithDuotoneOverlay: Story = {
  args: { overlay: { type: 'duotone', duotonePreset: 'standard' } },
  decorators: [at(480)],
};
export const WithCaption: Story = { args: { caption: 'Caption sits below the image, not under the label.' }, decorators: [at(480)] };
