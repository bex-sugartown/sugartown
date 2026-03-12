/**
 * One-shot migration: cardBuilderItem.citation → citations[]
 *
 * Converts old single-object `citation` field to new `citations[]` array
 * with linkItem-based links on all page documents.
 *
 * Requires a write-capable token:
 *   SANITY_WRITE_TOKEN=sk... node scripts/migrate-card-citations.mjs
 *   SANITY_WRITE_TOKEN=sk... node scripts/migrate-card-citations.mjs --dry-run
 *
 * The viewer token in .env (VITE_SANITY_TOKEN) does NOT have write access.
 * Create a write token at: https://www.sanity.io/manage/project/poalmzla/api#tokens
 */
import {createClient} from '@sanity/client'

const DRY_RUN = process.argv.includes('--dry-run')
const TOKEN = process.env.SANITY_WRITE_TOKEN

if (!TOKEN) {
  console.error('Error: SANITY_WRITE_TOKEN env var is required.')
  console.error('Create a write token at https://www.sanity.io/manage/project/poalmzla/api#tokens')
  console.error('Usage: SANITY_WRITE_TOKEN=sk... node scripts/migrate-card-citations.mjs')
  process.exit(1)
}

const client = createClient({
  projectId: 'poalmzla',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: TOKEN,
})

function migrateCitation(oldCitation, cardKey) {
  const newCite = {
    _type: 'cardCitation',
    _key: `migrated-${cardKey?.slice(0, 8) || 'x'}`,
    text: oldCitation.text?.trim().replace(/:?\s*$/, ':') || undefined,
    linkLabel: oldCitation.label || undefined,
  }

  if (oldCitation.url) {
    newCite.link = {
      _type: 'linkItem',
      type: 'external',
      externalUrl: oldCitation.url,
    }
  }

  return newCite
}

async function migrate() {
  const pages = await client.fetch(`
    *[_type == "page" && defined(sections)]{
      _id,
      title,
      sections
    }
  `)

  let totalMigrated = 0

  for (const page of pages) {
    let mutated = false
    const sections = page.sections.map(section => {
      if (section._type !== 'cardBuilderSection' || !section.cards) return section

      const cards = section.cards.map(card => {
        if (!card.citation) return card

        mutated = true
        const newCitation = migrateCitation(card.citation, card._key)
        const {citation, ...rest} = card
        return {...rest, citations: [newCitation]}
      })

      return {...section, cards}
    })

    if (!mutated) continue

    if (DRY_RUN) {
      console.log(`🔍 [DRY RUN] Would patch ${page._id} (${page.title})`)
      const sect = sections.find(s => s._type === 'cardBuilderSection')
      sect?.cards.forEach(c => {
        if (c.citations) {
          console.log(`  Card "${c.title}":`, JSON.stringify(c.citations, null, 2))
        }
      })
    } else {
      await client.patch(page._id).set({sections}).commit()
      console.log(`✅ Patched ${page._id} (${page.title})`)
    }
    totalMigrated++
  }

  console.log(`\nDone. ${totalMigrated} page(s) ${DRY_RUN ? 'would be' : ''} migrated.`)
}

migrate().catch(err => {
  console.error('Migration failed:', err.message)
  process.exit(1)
})
