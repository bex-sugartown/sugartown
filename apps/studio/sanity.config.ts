import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {colorInput} from '@sanity/color-input'
import {codeInput} from '@sanity/code-input'
import {schemaTypes} from './schemas'
import {autoTimestampsPlugin} from './plugins/autoTimestamps'
import {createSyncRelatedAction} from './components/SyncRelatedAction'
import {ProjectReferencesView} from './components/ProjectReferencesView'

export default defineConfig({
  name: 'default',
  title: 'Sugartown CMS',

  projectId: 'poalmzla',
  dataset: 'production',

  plugins: [
    structureTool({
      defaultDocumentNode: (S, {schemaType}) => {
        if (schemaType === 'project') {
          return S.document().views([
            S.view.form().title('Fields'),
            S.view.component(ProjectReferencesView).title('Referenced by'),
          ])
        }
        return S.document()
      },
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
                    S.documentTypeListItem('node').title('Nodes'),
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
                    S.documentTypeListItem('tool').title('Tools'),
                    S.documentTypeListItem('project').title('Projects'),
                    S.documentTypeListItem('series').title('Series'),
                    S.documentTypeListItem('glossaryTerm').title('Glossary'),
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

  document: {
    // Suppress Sanity's cloud-injected scheduling action — not available on free tier.
    // Wrap PublishAction with SyncRelatedAction for the four content types that support
    // bidirectional related-field sync (glossaryTerm, article, node, caseStudy).
    actions: (prev, ctx) => {
      const filtered = prev.filter((action) => {
        const key = action.action as string | undefined
        return key !== 'ScheduledPublishing.ScheduleAction' && !/schedule/i.test(key ?? '')
      })
      const SYNC_TYPES = ['glossaryTerm', 'article', 'node', 'caseStudy']
      if (!SYNC_TYPES.includes(ctx.schemaType)) return filtered
      return filtered.map((action) =>
        action.action === 'publish' ? createSyncRelatedAction(action) : action,
      )
    },
  },

  schema: {
    types: schemaTypes,
  },
})
