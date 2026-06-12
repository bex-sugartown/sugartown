import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DescriptionList } from './DescriptionList';

const meta: Meta<typeof DescriptionList> = {
  title: 'Components/DescriptionList',
  component: DescriptionList,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof DescriptionList>;

const SAMPLE_ITEMS = [
  { label: 'Status', value: 'Published' },
  { label: 'Author', value: 'Bex' },
  { label: 'Date', value: '4 June 2026' },
  { label: 'Reading time', value: '5 min' },
];

export const SingleColumn: Story = {
  args: {
    items: SAMPLE_ITEMS,
    columns: 1,
  },
};

export const TwoColumn: Story = {
  args: {
    items: SAMPLE_ITEMS,
    columns: 2,
  },
};

const LEDGER_ITEMS = [
  { label: 'Status', value: 'Evergreen' },
  { label: 'Related Terms', value: 'counterfactual, knowledge graph' },
  {
    label: 'Used In',
    value: 'The Seafoam That Should Have Been Lime; Glossary System Close-Out',
  },
  { label: 'Related Content', value: 'Pink Moon Design System PRD' },
  {
    label: 'Sources',
    value: 'Merriam-Webster, "node"; Oxford English Dictionary, "node, n."',
  },
];

/**
 * Ledger variant — two-column with column hairline, first-row rule,
 * and a full-width last row above a top rule. Resize below 768px to
 * see the single-column collapse with stacked dividers.
 */
export const Ledger: Story = {
  args: {
    items: LEDGER_ITEMS,
    columns: 2,
    ledger: true,
  },
};

/** Odd item count — the full-width last row absorbs the dangling item. */
export const LedgerOddCount: Story = {
  args: {
    items: LEDGER_ITEMS.slice(0, 3),
    columns: 2,
    ledger: true,
  },
};

/** Even item count — the final pair forms the last row; nothing spans. */
export const LedgerEvenCount: Story = {
  args: {
    items: LEDGER_ITEMS.slice(0, 4),
    columns: 2,
    ledger: true,
  },
};

/** Single column + ledger — stacked dividers pick up the stronger border. */
export const LedgerSingleColumn: Story = {
  args: {
    items: LEDGER_ITEMS.slice(0, 4),
    columns: 1,
    ledger: true,
  },
};

/** Long values must wrap inside their column without breaking the hairline. */
export const LedgerLongValues: Story = {
  args: {
    items: [
      {
        label: 'Definition source',
        value:
          'A very long citation string that wraps across multiple lines to verify the column hairline and padding hold up under wrapping content',
      },
      { label: 'Status', value: 'Validated' },
      {
        label: 'Sources',
        value:
          'Merriam-Webster, "node"; Oxford English Dictionary, "node, n."; Wikipedia, "Node (computer science)"',
      },
    ],
    columns: 2,
    ledger: true,
  },
};

export const LongValues: Story = {
  args: {
    items: [
      { label: 'Title', value: 'A very long article title that might wrap across multiple lines of text' },
      { label: 'Description', value: 'A description that is also quite long and contains detailed information about the content' },
      { label: 'Tags', value: 'design-systems, tokens, primitives, accessibility, css-modules' },
    ],
    columns: 1,
  },
};
