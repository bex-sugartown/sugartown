#!/usr/bin/env node
/**
 * reassign-tool-types.js
 *
 * Reassigns toolType on existing tool documents to use the new expanded
 * taxonomy (DAM, Data, E-commerce, OS, Visualization).
 *
 * Only patches tools listed in REASSIGNMENTS — leaves all others untouched.
 *
 * Usage:
 *   node scripts/migrate/reassign-tool-types.js          # dry-run
 *   node scripts/migrate/reassign-tool-types.js --execute # apply patches
 */

import { buildSanityClient } from './lib.js'

const EXECUTE = process.argv.includes('--execute')
const client = buildSanityClient()

// ─── Reassignment map: documentId → new toolType ─────────────────────────────

const REASSIGNMENTS = [
  // DAM (was CMS / Design)
  { id: 'tool-celum',                                slug: 'celum',        from: 'design',      to: 'dam' },
  { id: 'e0b6850a-4a6a-4ede-aa2e-fe15f6e538c1',      slug: 'aem-assets',   from: 'cms',         to: 'dam' },
  // Data (was Development / Productivity)
  { id: 'tool-networkx',                              slug: 'networkx',     from: 'development', to: 'data' },
  { id: '8d4ae4b4-b4e1-40a6-ad2b-e7b118a6ae2c',      slug: 'filemaker-pro',from: 'productivity',to: 'data' },
  // E-commerce (was CMS)
  { id: 'tool-shopify',                               slug: 'shopify',      from: 'cms',         to: 'ecommerce' },
  { id: 'tool-oracle-atg',                            slug: 'oracle-atg',   from: 'cms',         to: 'ecommerce' },
  { id: '65a3e00e-e4e4-4d4c-8a05-5ab5eed2a9aa',      slug: 'ewinery',      from: 'cms',         to: 'ecommerce' },
  // OS (was Development / Other)
  { id: '94df817c-15a8-4f19-a47e-cc93fc5a883d',      slug: 'apple',        from: 'other',       to: 'os' },
  { id: '29a6a3d7-cce0-4b1c-b0dd-e960ddc34152',      slug: 'ios',          from: 'development', to: 'os' },
  // Visualization (was Development)
  { id: 'tool-matplotlib',                            slug: 'matplotlib',   from: 'development', to: 'visualization' },
  { id: 'tool-mermaid',                               slug: 'mermaid',      from: 'development', to: 'visualization' },
]

console.log('═'.repeat(60))
console.log('  Tool Type Reassignment')
console.log(`  Mode: ${EXECUTE ? '🔴 EXECUTE' : '🔵 DRY-RUN'}`)
console.log(`  Tools to reassign: ${REASSIGNMENTS.length}`)
console.log('═'.repeat(60))

if (EXECUTE) {
  console.log('\n⏳ Starting in 5 seconds… (Ctrl-C to abort)')
  await new Promise(r => setTimeout(r, 5000))
}

let patched = 0
let errors = 0

for (const { id, slug, from, to } of REASSIGNMENTS) {
  console.log(`\n  ${slug}: ${from} → ${to}`)

  if (!EXECUTE) {
    console.log('    📝 Would patch (dry-run)')
    patched++
    continue
  }

  try {
    await client.patch(id).set({ toolType: to }).commit()
    patched++
    console.log('    💾 Patched')
  } catch (err) {
    errors++
    console.log(`    ❌ Error: ${err.message}`)
  }
}

console.log('\n' + '═'.repeat(60))
console.log('  Summary')
console.log('═'.repeat(60))
console.log(`  Reassigned: ${patched}`)
if (errors) console.log(`  Errors: ${errors}`)
console.log(`  Mode: ${EXECUTE ? '🔴 EXECUTED' : '🔵 DRY-RUN (use --execute to apply)'}`)
console.log()
