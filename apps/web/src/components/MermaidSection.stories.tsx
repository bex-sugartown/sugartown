import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import PageSections from './PageSections';

const meta: Meta<typeof PageSections> = {
  title: 'Patterns/MermaidSection',
  component: PageSections,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: {
    // Delay allows async mermaid render to complete before Chromatic snapshot
    chromatic: { disableSnapshot: false, delay: 2000 },
  },
};

export default meta;
type Story = StoryObj<typeof PageSections>;

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
  args: {
    sections: [{
      _type: 'mermaidSection',
      _key: 'md-1',
      code: SIMPLE_FLOW,
    }],
    context: 'detail',
  },
};

export const ArchitectureDiagram: Story = {
  args: {
    sections: [{
      _type: 'mermaidSection',
      _key: 'md-2',
      code: ARCHITECTURE_FLOW,
      width: 'wide',
    }],
    context: 'detail',
  },
};

export const FullWidth: Story = {
  args: {
    sections: [{
      _type: 'mermaidSection',
      _key: 'md-3',
      code: SIMPLE_FLOW,
      width: 'full',
    }],
    context: 'detail',
  },
};
