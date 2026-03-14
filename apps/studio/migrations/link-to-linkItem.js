/**
 * Sanity migration: link → linkItem
 *
 * Transforms existing `link` field data (old shape: { url, label, openInNewTab, icon })
 * into the `linkItem` shape ({ type: 'external', externalUrl, label, openInNewTab }).
 *
 * Affected document types:
 *   - ctaButtonDoc  — top-level `link` field
 *   - preheader     — top-level `link` field
 *   - homepage      — `callout.link` field
 *
 * Object types embedded in sections (ctaButton in heroSection / ctaSection) are also
 * handled by walking the `sections[]` array on page, article, caseStudy, and node docs.
 *
 * Run with:
 *   npx sanity exec migrations/link-to-linkItem.js --with-user-token
 *
 * DRY RUN (preview only, no writes):
 *   DRY_RUN=1 npx sanity exec migrations/link-to-linkItem.js --with-user-token
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-01-01'})
const DRY_RUN = process.env.DRY_RUN === '1'

/**
 * Convert an old link object { url, label, openInNewTab, icon }
 * to the linkItem shape { _type: 'linkItem', type: 'external', externalUrl, label, openInNewTab }
 */
function convertLink(oldLink) {
  if (!oldLink || !oldLink.url) return null
  return {
    _type: 'linkItem',
    type: 'external',
    externalUrl: oldLink.url,
    ...(oldLink.label ? {label: oldLink.label} : {}),
    ...(oldLink.openInNewTab != null ? {openInNewTab: oldLink.openInNewTab} : {}),
  }
}

/**
 * Walk sections[] and convert any inline cta.link or buttons[].link fields
 */
function migrateSections(sections) {
  if (!Array.isArray(sections)) return {sections, changed: false}
  let changed = false
  const updated = sections.map((section) => {
    const s = {...section}

    // heroSection: cta.link
    if (s.cta?.link?.url && !s.cta?.link?._type) {
      const newLink = convertLink(s.cta.link)
      if (newLink) {
        s.cta = {...s.cta, link: newLink}
        changed = true
      }
    }

    // ctaSection: buttons[].link
    if (Array.isArray(s.buttons)) {
      s.buttons = s.buttons.map((btn) => {
        if (btn.link?.url && !btn.link?._type) {
          const newLink = convertLink(btn.link)
          if (newLink) {
            changed = true
            return {...btn, link: newLink}
          }
        }
        return btn
      })
    }

    return s
  })
  return {sections: updated, changed}
}

async function run() {
  console.log(DRY_RUN ? '🔍 DRY RUN — no writes' : '🚀 LIVE RUN — writing to dataset')

  // ── 1. ctaButtonDoc ──
  const ctaDocs = await client.fetch(
    `*[_type == "ctaButtonDoc" && defined(link.url) && !defined(link._type)]{ _id, link }`
  )
  console.log(`\nctaButtonDoc: ${ctaDocs.length} docs to migrate`)
  for (const doc of ctaDocs) {
    const newLink = convertLink(doc.link)
    if (!newLink) continue
    console.log(`  → ${doc._id}`)
    if (!DRY_RUN) {
      await client.patch(doc._id).set({link: newLink}).commit()
    }
  }

  // ── 2. preheader ──
  const preheaders = await client.fetch(
    `*[_type == "preheader" && defined(link.url) && !defined(link._type)]{ _id, link }`
  )
  console.log(`\npreheader: ${preheaders.length} docs to migrate`)
  for (const doc of preheaders) {
    const newLink = convertLink(doc.link)
    if (!newLink) continue
    console.log(`  → ${doc._id}`)
    if (!DRY_RUN) {
      await client.patch(doc._id).set({link: newLink}).commit()
    }
  }

  // ── 3. homepage callout ──
  const homepages = await client.fetch(
    `*[_type == "homepage" && defined(callout.link.url) && !defined(callout.link._type)]{ _id, callout }`
  )
  console.log(`\nhomepage: ${homepages.length} docs to migrate`)
  for (const doc of homepages) {
    const newLink = convertLink(doc.callout?.link)
    if (!newLink) continue
    console.log(`  → ${doc._id}`)
    if (!DRY_RUN) {
      await client.patch(doc._id).set({'callout.link': newLink}).commit()
    }
  }

  // ── 4. Content docs with sections[] (inline cta/buttons) ──
  const contentTypes = ['page', 'article', 'caseStudy', 'node']
  for (const type of contentTypes) {
    const docs = await client.fetch(
      `*[_type == "${type}" && defined(sections)]{ _id, sections }`
    )
    let migrated = 0
    for (const doc of docs) {
      const {sections, changed} = migrateSections(doc.sections)
      if (!changed) continue
      migrated++
      console.log(`  → ${type} ${doc._id}`)
      if (!DRY_RUN) {
        await client.patch(doc._id).set({sections}).commit()
      }
    }
    console.log(`\n${type}: ${migrated}/${docs.length} docs had sections to migrate`)
  }

  console.log('\n✅ Migration complete')
}

run().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
