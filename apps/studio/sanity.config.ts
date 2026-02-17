import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {colorInput} from '@sanity/color-input'
import {codeInput} from '@sanity/code-input'
import {schemaTypes} from './schemas'

export default defineConfig({
  name: 'default',
  title: 'Sugartown CMS',

  projectId: 'poalmzla',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Sugartown CMS')
          .items([
            // Knowledge Graph
            S.listItem()
              .title('💎 Knowledge Graph')
              .icon(() => '💎')
              .child(
                S.list()
                  .title('Knowledge Graph')
                  .items([
                    S.documentTypeListItem('node').title('Nodes'),
                  ])
              ),

            S.divider(),

            // Content
            S.listItem()
              .title('📝 Content')
              .icon(() => '📝')
              .child(
                S.list()
                  .title('Content')
                  .items([
                    S.documentTypeListItem('post').title('Blog Posts'),
                    S.documentTypeListItem('page').title('Pages'),
                    S.documentTypeListItem('caseStudy').title('Case Studies'),
                    S.documentTypeListItem('archivePage').title('Archive Pages'),
                  ])
              ),

            S.divider(),

            // Taxonomy
            S.listItem()
              .title('🏷️ Taxonomy')
              .icon(() => '🏷️')
              .child(
                S.list()
                  .title('Taxonomy')
                  .items([
                    S.documentTypeListItem('category').title('Categories'),
                    S.documentTypeListItem('tag').title('Tags'),
                    S.documentTypeListItem('project').title('Projects'),
                  ])
              ),

            S.divider(),

            // Site Configuration
            S.listItem()
              .title('⚙️ Site Configuration')
              .icon(() => '⚙️')
              .child(
                S.list()
                  .title('Site Configuration')
                  .items([
                    // Site Settings (Singleton)
                    S.listItem()
                      .title('Site Settings')
                      .icon(() => '⚙️')
                      .child(
                        S.document()
                          .schemaType('siteSettings')
                          .documentId('siteSettings')
                      ),
                    S.documentTypeListItem('navigation').title('Navigation Menus'),
                  ])
              ),

            S.divider(),

            // Legacy Content (old schemas)
            S.listItem()
              .title('🗂️ Legacy')
              .icon(() => '🗂️')
              .child(
                S.list()
                  .title('Legacy Content')
                  .items([
                    S.documentTypeListItem('header').title('Site Header (Old)'),
                    S.documentTypeListItem('footer').title('Site Footer (Old)'),
                    S.documentTypeListItem('hero').title('Hero Banners (Old)'),
                    S.documentTypeListItem('contentBlock').title('Content Blocks (Old)'),
                  ])
              ),
          ])
    }),
    visionTool(),
    colorInput(),
    codeInput()
  ],

  schema: {
    types: schemaTypes,
  },
})
