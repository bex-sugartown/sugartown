/**
 * ButtonGroup stories — SUG-126
 *
 * Layout-only primitive that codifies multi-button flex strips.
 * Uses MemoryRouter because Button renders <Link> for internal hrefs.
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import ButtonGroup from './ButtonGroup';
import Button from '../button/Button';

const withRouter = (Story: React.ComponentType) => (
  <MemoryRouter><Story /></MemoryRouter>
);

const meta: Meta<typeof ButtonGroup> = {
  title: 'Components/ButtonGroup',
  component: ButtonGroup,
  tags: ['autodocs'],
  decorators: [withRouter],
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
