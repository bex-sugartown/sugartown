import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './schemas';

export default defineConfig({
  name: 'default',
  title: 'Sugartown Studio',
  projectId: 'poalmzla',
  dataset: 'production',
  plugins: [structureTool(),
],
  schema: {
    types: schemaTypes,
  },
});
