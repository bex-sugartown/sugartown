#!/usr/bin/env node
/**
 * html-tables-to-tableblock.js — SUG-34 Phase 2: HTML Table Migration
 *
 * Converts HTML <table> elements inside `htmlSection` blocks into native
 * `tableBlock` objects within `textSection` content. Non-table HTML in the
 * same section is preserved as separate content blocks.
 *
 * Uses `linkedom` for DOM parsing (lightweight, no browser required).
 *
 * Usage:
 *   node scripts/migrate/html-tables-to-tableblock.js           # dry-run
 *   node scripts/migrate/html-tables-to-tableblock.js --execute  # live run
 *
 * Target: 26 documents (1 article + 24 nodes + 1 page)
 * Idempotency: skips sections already converted to textSection with tableBlock
 */

import { buildSanityClient } from './lib.js'
import { parseHTML } from 'linkedom'

const EXECUTE = process.argv.includes('--execute')
const CONTENT_TYPES = ['article', 'node', 'page']

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateKey() {
  return Math.random().toString(36).slice(2, 10)
}

/**
 * Decode HTML entities in text content.
 */
function decodeEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
}

/**
 * Extract plain text from an HTML element, stripping all tags.
 */
function getCellText(element) {
  return decodeEntities(element.textContent?.trim() ?? '')
}

/**
 * Parse a <table> DOM element into a tableBlock data shape.
 */
function parseTableElement(tableEl) {
  const rows = []
  let hasHeaderRow = false

  // Check for <thead>
  const thead = tableEl.querySelector('thead')
  if (thead) {
    const headerTrs = thead.querySelectorAll('tr')
    for (const tr of headerTrs) {
      const cells = []
      for (const cell of tr.querySelectorAll('th, td')) {
        cells.push(getCellText(cell))
      }
      if (cells.length > 0) {
        rows.push({ _key: generateKey(), _type: 'tableRow', cells })
        hasHeaderRow = true
      }
    }
  }

  // Check <tbody> or direct <tr> children
  const tbody = tableEl.querySelector('tbody')
  const bodyContainer = tbody || tableEl
  const trs = bodyContainer.querySelectorAll('tr')

  for (const tr of trs) {
    // Skip rows already captured from thead
    if (thead && tr.closest('thead')) continue

    const cells = []
    const cellEls = tr.querySelectorAll('th, td')
    for (const cell of cellEls) {
      cells.push(getCellText(cell))
    }

    // Detect header row if first row uses <th> and no <thead> was found
    if (!hasHeaderRow && rows.length === 0) {
      const thCount = tr.querySelectorAll('th').length
      if (thCount > 0 && thCount === cellEls.length) {
        hasHeaderRow = true
      }
    }

    if (cells.length > 0) {
      rows.push({ _key: generateKey(), _type: 'tableRow', cells })
    }
  }

  // Strip empty trailing rows
  while (rows.length > 0) {
    const lastRow = rows[rows.length - 1]
    if (lastRow.cells.every((c) => c === '')) {
      rows.pop()
    } else {
      break
    }
  }

  if (rows.length === 0) return null

  // Normalize column count
  const maxCols = Math.max(...rows.map((r) => r.cells.length))
  for (const row of rows) {
    while (row.cells.length < maxCols) {
      row.cells.push('')
    }
  }

  return {
    _type: 'tableBlock',
    _key: generateKey(),
    variant: 'default',
    hasHeaderRow,
    rows,
  }
}

/**
 * Convert non-table HTML fragments into basic Portable Text blocks.
 * Handles: <h2>, <h3>, <h4>, <p>, plain text.
 * Returns an array of PT block objects.
 */
function htmlFragmentToPtBlocks(html) {
  const trimmed = html.trim()
  if (!trimmed) return []

  const { document } = parseHTML(`<div>${trimmed}</div>`)
  const container = document.querySelector('div')
  if (!container) return []

  const blocks = []

  for (const child of container.childNodes) {
    if (child.nodeType === 3) {
      // Text node
      const text = child.textContent?.trim()
      if (text) {
        blocks.push({
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          markDefs: [],
          children: [{ _type: 'span', _key: generateKey(), text, marks: [] }],
        })
      }
      continue
    }

    if (child.nodeType !== 1) continue // Skip non-element nodes
    const el = child
    const tag = el.tagName?.toLowerCase()

    // Determine block style from tag
    let style = 'normal'
    if (tag === 'h2') style = 'h2'
    else if (tag === 'h3') style = 'h3'
    else if (tag === 'h4') style = 'h4'
    else if (tag === 'blockquote') style = 'blockquote'

    const text = getCellText(el)
    if (!text) continue

    blocks.push({
      _type: 'block',
      _key: generateKey(),
      style,
      markDefs: [],
      children: [{ _type: 'span', _key: generateKey(), text, marks: [] }],
    })
  }

  return blocks
}

/**
 * Process a single htmlSection that contains a <table>.
 * Returns an array of PT content blocks (mix of regular blocks + tableBlock).
 */
function convertHtmlSectionToContent(html) {
  const { document } = parseHTML(`<div>${html}</div>`)
  const container = document.querySelector('div')
  if (!container) return null

  const content = []

  // Walk through top-level children, splitting on <table> elements
  for (const child of container.childNodes) {
    if (child.nodeType === 3) {
      // Text node
      const text = child.textContent?.trim()
      if (text) {
        content.push({
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          markDefs: [],
          children: [{ _type: 'span', _key: generateKey(), text, marks: [] }],
        })
      }
      continue
    }

    if (child.nodeType !== 1) continue
    const el = child
    const tag = el.tagName?.toLowerCase()

    if (tag === 'table') {
      const tableBlock = parseTableElement(el)
      if (tableBlock) {
        content.push(tableBlock)
      }
    } else {
      // Non-table element — convert to PT blocks
      const blocks = htmlFragmentToPtBlocks(el.outerHTML)
      content.push(...blocks)
    }
  }

  return content.length > 0 ? content : null
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const client = buildSanityClient()

  console.log(`\n${'═'.repeat(60)}`)
  console.log(`  HTML Table → tableBlock Migration (SUG-34)`)
  console.log(`  Mode: ${EXECUTE ? '🔴 EXECUTE' : '🔵 DRY-RUN'}`)
  console.log(`${'═'.repeat(60)}\n`)

  if (EXECUTE) {
    console.log('⏳ Starting in 5 seconds… (Ctrl-C to abort)\n')
    await new Promise((r) => setTimeout(r, 5000))
  }

  // ── Find target documents ──────────────────────────────────────────────

  const docs = await client.fetch(
    `*[_type in $types && defined(sections) && count(sections[_type == "htmlSection" && html match "<table"]) > 0]{
      _id, _type, title,
      sections
    }`,
    { types: CONTENT_TYPES },
  )

  console.log(`Found ${docs.length} documents with HTML tables\n`)

  if (docs.length === 0) {
    console.log('✅ Nothing to migrate — all tables already converted (or none exist).\n')
    return
  }

  // ── Process each document ──────────────────────────────────────────────

  let patchCount = 0
  let tableCount = 0
  let skipCount = 0
  const errors = []

  for (const doc of docs) {
    const { _id, _type, title, sections } = doc
    console.log(`\n📄 ${_type}/${_id}: "${title}"`)

    const newSections = []
    let changed = false

    for (const section of sections) {
      if (section._type !== 'htmlSection' || !section.html?.includes('<table')) {
        // Keep non-table sections as-is
        newSections.push(section)
        continue
      }

      // Convert this htmlSection
      try {
        const content = convertHtmlSectionToContent(section.html)
        if (!content) {
          console.log(`   ⚠️  Section ${section._key}: conversion returned empty — keeping original`)
          newSections.push(section)
          continue
        }

        const tables = content.filter((b) => b._type === 'tableBlock')
        const nonTables = content.filter((b) => b._type !== 'tableBlock')

        console.log(`   ✅ Section ${section._key}: extracted ${tables.length} table(s), ${nonTables.length} text block(s)`)

        // Replace htmlSection with textSection containing the converted content
        const textSection = {
          _type: 'textSection',
          _key: section._key, // Preserve key for stable ordering
          content,
        }

        newSections.push(textSection)
        changed = true
        tableCount += tables.length
      } catch (err) {
        console.log(`   ❌ Section ${section._key}: error — ${err.message}`)
        errors.push({ docId: _id, sectionKey: section._key, error: err.message })
        newSections.push(section) // Keep original on error
      }
    }

    if (!changed) {
      console.log(`   ⏩ No changes needed`)
      skipCount++
      continue
    }

    patchCount++

    if (EXECUTE) {
      try {
        await client
          .patch(_id)
          .set({ sections: newSections })
          .commit()
        console.log(`   💾 Patched successfully`)
      } catch (err) {
        console.log(`   ❌ Patch failed: ${err.message}`)
        errors.push({ docId: _id, error: err.message })
      }
    } else {
      console.log(`   📝 Would patch (dry-run)`)
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────

  console.log(`\n${'═'.repeat(60)}`)
  console.log(`  Summary`)
  console.log(`${'═'.repeat(60)}`)
  console.log(`  Documents scanned: ${docs.length}`)
  console.log(`  Documents to patch: ${patchCount}`)
  console.log(`  Documents skipped: ${skipCount}`)
  console.log(`  Tables extracted: ${tableCount}`)
  if (errors.length > 0) {
    console.log(`  Errors: ${errors.length}`)
    for (const err of errors) {
      console.log(`    - ${err.docId}${err.sectionKey ? `[${err.sectionKey}]` : ''}: ${err.error}`)
    }
  }
  console.log(`  Mode: ${EXECUTE ? '🔴 EXECUTED' : '🔵 DRY-RUN (use --execute to apply)'}`)
  console.log()
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
