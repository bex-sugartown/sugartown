/**
 * Upload the corrected platform-is-the-portfolio case study diagrams and
 * swap the asset refs on the case study draft.
 *
 * Run from the repo root (uses your Sanity CLI login, no token file needed):
 *
 *   cd apps/studio && npx sanity exec ../../scripts/upload-case-study-diagrams.mjs --with-user-token -- --execute
 *
 * Without --execute it dry-runs: prints what it would upload and patch.
 *
 * Writes go to the DRAFT only (drafts.<id>) — publishing stays human, in Studio.
 * Idempotent: Sanity dedupes identical file uploads by content hash, and the
 * ref patch is a plain set. Re-running produces no further change.
 *
 * Sources + red-pen claim tables: docs/diagrams/ (see redpen-platform-is-the-portfolio.md)
 */
import { getCliClient } from 'sanity/cli'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const EXECUTE = process.argv.includes('--execute')
const PUBLISHED_ID = 'd34d2a54-32f7-414d-b0a4-fdbb057fbefb' // caseStudy: sugartown-platform-is-the-portfolio
const DRAFT_ID = `drafts.${PUBLISHED_ID}`
const SECTION_KEY = 'overview-1'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

// blockKey → committed diagram source (docs/diagrams/, red-pen gate)
const DIAGRAMS = [
  { blockKey: 'img-agnostic', file: 'docs/diagrams/diagram-portfolio-agnostic-stack.svg' },
  { blockKey: 'img-aimodel',  file: 'docs/diagrams/diagram-portfolio-ai-governance.svg' },
  { blockKey: 'img-readpath', file: 'docs/diagrams/diagram-portfolio-read-path.svg' },
]

const client = getCliClient({ apiVersion: '2024-06-01' }).withConfig({ dataset: 'production' })

async function main() {
  let draft = await client.getDocument(DRAFT_ID)
  if (!draft) {
    const published = await client.getDocument(PUBLISHED_ID)
    if (!published) throw new Error(`Neither draft nor published doc found for ${PUBLISHED_ID}`)
    console.log('No draft exists — will create one from published before patching.')
    if (EXECUTE) {
      draft = await client.create({ ...published, _id: DRAFT_ID })
    }
  }

  for (const { blockKey, file } of DIAGRAMS) {
    const path = resolve(repoRoot, file)
    const buffer = readFileSync(path)
    const filename = file.split('/').pop()
    console.log(`\n${blockKey} ← ${filename} (${buffer.length} bytes)`)

    if (!EXECUTE) {
      console.log('  [dry-run] would upload and set asset ref on the draft')
      continue
    }

    const asset = await client.assets.upload('image', buffer, { filename, contentType: 'image/svg+xml' })
    console.log(`  uploaded: ${asset._id}`)

    await client
      .patch(DRAFT_ID)
      .set({
        [`sections[_key=="${SECTION_KEY}"].content[_key=="${blockKey}"].asset.asset`]: {
          _type: 'reference',
          _ref: asset._id,
        },
      })
      .commit()
    console.log('  draft patched')
  }

  console.log(
    EXECUTE
      ? '\nDone. Review the draft in Studio, then publish it yourself — this script never publishes.'
      : '\nDry-run complete. Re-run with `-- --execute` to apply.'
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
