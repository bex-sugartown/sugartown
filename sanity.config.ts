import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'Sugartown.sanity',

  projectId: '94v2bq52',
  dataset: 'test',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
})
