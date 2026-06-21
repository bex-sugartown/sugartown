import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { MermaidDiagram } from './PageSections';

/**
 * ## MermaidDiagram
 *
 * Renders Mermaid diagram markup as a themed SVG via dynamic import.
 * Theme-aware — re-renders on `data-theme` change to match the active
 * Pink Moon palette. Strips inline `style`, `classDef`, and `class`
 * directives from content so the token-driven palette is not overridden
 * by values stored in Sanity.
 *
 * Layout engine: ELK with ORTHOGONAL edge routing (SUG-70).
 * If you change the renderer, retest against the `/platform` diagrams.
 */
const meta: Meta<typeof MermaidDiagram> = {
  title: 'Patterns/MermaidSection',
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

const SIMPLE_FLOW = `flowchart LR
  A[Token] --> B[Component]
  B --> C[Page]`;

const ARCHITECTURE_FLOW = `flowchart TD
  subgraph DS[Design System]
    T[tokens.css] --> P[DS Primitives]
  end
  subgraph Web[apps/web]
    P --> A[Web Adapters]
    A --> C[App Composites]
  end
  C --> Page[Pages]`;

export const SimpleFlow: Story = {
  args: { code: SIMPLE_FLOW, _key: 'md-1' },
};

export const ArchitectureDiagram: Story = {
  args: { code: ARCHITECTURE_FLOW, width: 'wide', _key: 'md-2' },
};

export const WithCaption: Story = {
  args: { code: SIMPLE_FLOW, caption: 'Sugartown token-to-page data flow', _key: 'md-3' },
};
