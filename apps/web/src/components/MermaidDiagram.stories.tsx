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
    direction: {
      control: { type: 'select' },
      options: ['horizontal', 'vertical'],
      description: 'Override flow direction — patches the first flowchart/graph line',
    },
    caption: {
      control: 'text',
      description: 'Optional caption displayed below the diagram',
    },
    className: { table: { disable: true } },
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

export const Default: Story = {
  args: {
    code: SIMPLE_FLOW,
    caption: 'Sugartown token-to-page data flow',
    _key: 'md-default',
  },
};

export const Architecture: Story = {
  args: {
    code: ARCHITECTURE_FLOW,
    caption: 'Design system layer architecture',
    _key: 'md-arch',
  },
};
