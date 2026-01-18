import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: '94v2bq52',
    dataset: 'test'
  },
  deployment: {
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  }
})
