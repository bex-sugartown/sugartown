/**
 * ST-182 validate:diagram-assets — every diagram published from Sanity matches its committed
 * source in docs/diagrams/ (CLAUDE.md §Technical diagram red-pen gate, step 1).
 *
 * Run from the repo root (uses your Sanity CLI login, no token file):
 *
 *   pnpm validate:diagram-assets
 *
 * For each docs/diagrams/*.svg it finds the image assets uploaded under that filename, keeps the
 * ones a published document uses, and compares each with the source by content (Sanity
 * re-serialises SVG on upload; see scripts/diagram-assets/canon.mjs). Exit 1 on any drift.
 * Lives in apps/studio/scripts/ because `sanity` resolves from the studio's node_modules.
 * Session-invoked: run it at the red-pen gate and at close-out of any epic touching docs/diagrams/.
 */
import { getCliClient } from 'sanity/cli'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { svgDifference } from '../../../scripts/diagram-assets/canon.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const dir = resolve(root, 'docs/diagrams')
const client = getCliClient({ apiVersion: '2024-06-01' }).withConfig({ dataset: 'production', perspective: 'published' })

const sources = readdirSync(dir).filter((f) => f.endsWith('.svg')).sort()

const assets = await client.fetch(
  `*[_type == "sanity.imageAsset" && originalFilename in $names]{
    _id, originalFilename, url,
    "users": *[references(^._id) && !(_id in path("drafts.**"))]{ _id, _type, "name": coalesce(title, name, slug.current, _id) }
  }`,
  { names: sources },
)

const rows = []
let drift = 0
for (const file of sources) {
  const mine = assets.filter((a) => a.originalFilename === file)
  const inUse = mine.filter((a) => a.users.length)
  if (!mine.length) { rows.push([file, '-', '-', 'never uploaded']); continue }
  if (!inUse.length) { rows.push([file, `${mine.length} asset(s)`, '-', 'uploaded, not used by any published document']); continue }
  const source = readFileSync(resolve(dir, file), 'utf8')
  for (const asset of inUse) {
    const published = await (await fetch(asset.url)).text()
    const diff = svgDifference(source, published)
    const users = asset.users.map((u) => `${u._type} ${u.name}`).join('; ')
    if (diff) {
      drift++
      rows.push([file, asset._id, users, `DRIFT at token ${diff.index}: source ${diff.source.slice(0, 80)} | published ${diff.published.slice(0, 80)}`])
    } else {
      rows.push([file, asset._id, users, 'match'])
    }
  }
}

console.log('| Source | Asset in use | Published in | Result |\n|---|---|---|---|')
for (const r of rows) console.log(`| ${r.join(' | ')} |`)
console.log(drift ? `\n${drift} published diagram(s) differ from their committed source. Re-upload under the Content Write Gate.` : '\nEvery published diagram matches its committed source.')
process.exit(drift ? 1 : 0)
