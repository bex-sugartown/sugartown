import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { MermaidDiagram } from './PageSections';

/**
 * ## MermaidDiagram
 *
 * Renders Mermaid diagram markup as a themed SVG via dynamic import.
 * Theme-aware — re-renders on `data-theme` change to match the active
 * Pink Moon palette. Strips inline `style`, `classDef`, and `class`
 * directives so the token-driven palette is not overridden by values
 * stored in Sanity.
 *
 * Layout engine: ELK with ORTHOGONAL edge routing (SUG-70).
 * Retest against the `/platform` diagrams if you change the renderer.
 *
 * Use the Controls panel to try different `code`, `width`, and `caption` values.
 */
const meta: Meta<typeof MermaidDiagram> = {
  title: 'Components/MermaidDiagram',
  component: MermaidDiagram,
  tags: ['autodocs'],
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: {
    chromatic: { disableSnapshot: false, delay: 2000 },
    layout: 'padded',
  },
  argTypes: {
    code: {
      control: 'text',
      description: 'Mermaid diagram definition string',
    },
    width: {
      control: { type: 'select' },
      options: ['default', 'wide', 'full'],
      description: 'Layout width — default fits prose column, wide expands, full bleeds',
    },
    caption: {
      control: 'text',
      description: 'Optional caption displayed below the diagram',
    },
    sectionId: { table: { disable: true } },
    _key: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof MermaidDiagram>;

export const Default: Story = {
  args: {
    code: `flowchart LR\n  A[Token] --> B[Component]\n  B --> C[Page]`,
    _key: 'md-default',
  },
};

export const Architecture: Story = {
  args: {
    code: `flowchart TD\n  subgraph DS[Design System]\n    T[tokens.css] --> P[DS Primitives]\n  end\n  subgraph Web[apps/web]\n    P --> A[Web Adapters]\n    A --> C[App Composites]\n  end\n  C --> Page[Pages]`,
    width: 'wide',
    _key: 'md-arch',
  },
};

export const WithCaption: Story = {
  args: {
    code: `flowchart LR\n  A[Token] --> B[Component]\n  B --> C[Page]`,
    caption: 'Sugartown token-to-page data flow',
    _key: 'md-caption',
  },
};
