import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemas'

export default defineConfig({
  name: 'default',
  title: 'Sugartown.sanity',

  projectId: 'poalmzla',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            // Singletons (only one instance allowed)
            S.listItem()
              .title('🎀 Site Header')
              .child(
                S.document()
                  .schemaType('header')
                  .documentId('singleton-header')
              ),
            S.listItem()
              .title('🎀 Site Footer')
              .child(
                S.document()
                  .schemaType('footer')
                  .documentId('singleton-footer')
              ),
            
            // Divider
            S.divider(),
            
            // Regular documents (can have multiple)
            S.documentTypeListItem('hero').title('Hero Banners'),
            S.documentTypeListItem('contentBlock').title('Content Blocks')
          ])
    }),
    visionTool()
  ],

  schema: {
    types: schemaTypes,
  },
})
