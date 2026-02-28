import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {colorInput} from '@sanity/color-input'
import {codeInput} from '@sanity/code-input'
import {schemaTypes} from './schemas'
import {autoTimestampsPlugin} from './plugins/autoTimestamps'

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
            // Content
            S.listItem()
              .title('📝 Content')
              .icon(() => '📝')
              .child(
                S.list()
                  .title('Content')
                  .items([
                    S.documentTypeListItem('article').title('Articles'),
                    S.documentTypeListItem('caseStudy').title('Case Studies'),
                    S.documentTypeListItem('node').title('Knowledge Graph'),
                    S.documentTypeListItem('page').title('Pages'),
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
                    S.documentTypeListItem('person').title('People'),
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

            // Redirects
            S.listItem()
              .title('↪ Redirects')
              .icon(() => '↪')
              .child(
                S.documentTypeList('redirect')
                  .title('Redirects')
                  .defaultOrdering([{field: 'fromPath', direction: 'asc'}])
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
    codeInput(),
    autoTimestampsPlugin(),
  ],

  schema: {
    types: schemaTypes,
  },
})
