import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import Button from './Button';

const withRouter = (Story: React.ComponentType) => (
  <MemoryRouter><Story /></MemoryRouter>
);

const meta: Meta<typeof Button> = {
  title: 'Web/Button',
  component: Button,
  tags: ['autodocs'],
  decorators: [withRouter],
  parameters: { chromatic: { disableSnapshot: false }, layout: 'padded' },
  argTypes: {
    variant: { control: { type: 'select' }, options: ['primary', 'secondary', 'tertiary'] },
    href: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { variant: 'primary', children: 'Primary action' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Secondary action' },
};

export const Tertiary: Story = {
  args: { variant: 'tertiary', children: 'Tertiary action' },
};

export const AsLink: Story = {
  name: 'As internal link',
  args: { variant: 'primary', href: '/articles', children: 'View articles' },
};

export const AsExternalLink: Story = {
  name: 'As external link',
  args: { variant: 'secondary', href: 'https://sanity.io', children: 'Sanity docs' },
};

export const Snapshot: Story = {
  name: 'Snapshot (Chromatic)',
  parameters: { chromatic: { disableSnapshot: false }, layout: 'padded' },
  render: () => (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="tertiary">Tertiary</Button>
      <Button variant="primary" href="/articles">Internal link</Button>
      <Button variant="secondary" href="https://example.com">External link</Button>
    </div>
  ),
};
