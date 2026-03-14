import SchemaERD from '../components/SchemaERD/SchemaERD'
import SeoHead from '../components/SeoHead'
import { entities, relationships } from '../data/schemaManifest'

export default function SchemaErdPage() {
  return (
    <>
      <SeoHead
        title="Schema ERD"
        description="Interactive entity-relationship diagram of the Sanity content schema powering sugartown.io."
      />
      <SchemaERD entities={entities} relationships={relationships} />
    </>
  )
}
