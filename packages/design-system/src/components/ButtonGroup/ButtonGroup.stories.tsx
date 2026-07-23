/**
 * ButtonGroup stories — SUG-126, ported to the package SUG-224 Phase 3
 * (2026-07-23) — package copy is a pure mirror (byte-identical CSS).
 *
 * No MemoryRouter needed: Button renders internal hrefs through the DS Link
 * seam (SUG-230), which falls back to a plain <a> when no LinkProvider is
 * mounted — Storybook doesn't mount one.
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ButtonGroup from './ButtonGroup';
import { Button } from '../Button/Button';

const meta: Meta<typeof ButtonGroup> = {
  title: 'Components/ButtonGroup',
  component: ButtonGroup,
  tags: ['autodocs'],
  argTypes: {
    align: { control: { type: 'select' }, options: ['start', 'center', 'end'] },
    wrap: { control: 'boolean' },
  },
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof ButtonGroup>;

export const Default: Story = {
  args: { align: 'start', wrap: true },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="primary">Primary Action</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="tertiary">Tertiary</Button>
    </ButtonGroup>
  ),
};

export const Centered: Story = {
  args: { align: 'center', wrap: true },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="primary">Book a call</Button>
      <Button variant="secondary">See the work</Button>
    </ButtonGroup>
  ),
};

export const HeroPattern: Story = {
  name: 'Hero pattern (center, primary + secondary)',
  render: () => (
    <ButtonGroup align="center">
      <Button variant="primary" href="/contact">Book a call</Button>
      <Button variant="secondary" href="/case-studies">See the work</Button>
    </ButtonGroup>
  ),
};

export const CTASectionPattern: Story = {
  name: 'CTASection pattern (center, wrapping)',
  render: () => (
    <ButtonGroup align="center" wrap>
      <Button variant="primary">Get started</Button>
      <Button variant="tertiary">Learn more</Button>
    </ButtonGroup>
  ),
};
