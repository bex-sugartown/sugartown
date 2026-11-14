/**
 * #224 export:draft — pure functions behind `pnpm export:draft` (no Sanity, no file system).
 * The runner is apps/studio/scripts/export-draft.mjs; the workflow is
 * docs/write-pipeline-prompt.md §0b. Tested by render.test.mjs (`node --test`).
 */

export const esc = (s) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const cite = (n) => `<sup class="draftCite"><a href="#cit-${n}">[${n}]</a></sup>`

/** Portable Text spans with marks: strong, em, code, link, citationRef, glossaryTermRef. */
function spans(block) {
  const defs = Object.fromEntries((block.markDefs || []).map((m) => [m._key, m]))
  return (block.children || [])
    .map((c) => {
      let t = esc(c.text)
      const after = []
      for (const m of c.marks || []) {
        if (m === 'strong') t = `<strong>${t}</strong>`
        else if (m === 'em') t = `<em>${t}</em>`
        else if (m === 'code') t = `<code>${t}</code>`
        else if (defs[m]) {
          const d = defs[m]
          if (d._type === 'link') t = `<a href="${esc(d.href || '#')}"${d.internalRef ? ` data-ref="${esc(d.internalRef._ref)}"` : ''}>${t}</a>`
          else if (d._type === 'citationRef') after.push(cite(d.index))
          else if (d._type === 'glossaryTermRef') t = `<span data-glossary="${esc(d.term?._ref)}">${t}</span>`
        }
      }
      return t + after.join('')
    })
    .join('')
}

/** Portable Text array to HTML: blocks, lists, tableBlock. Unknown types render a visible marker. */
export function portableText(blocks = []) {
  let h = ''
  let list = null
  const close = () => { if (list) { h += `</${list}>`; list = null } }
  for (const b of blocks || []) {
    if (b._type === 'block' && b.listItem) {
      const tag = b.listItem === 'number' ? 'ol' : 'ul'
      if (list !== tag) { close(); h += `<${tag}>`; list = tag }
      h += `<li>${spans(b)}</li>`
      continue
    }
    close()
    if (b._type === 'block') {
      const s = b.style || 'normal'
      const tag = s === 'normal' ? 'p' : s === 'blockquote' ? 'blockquote' : s
      h += `<${tag}>${spans(b)}</${tag}>`
    } else if (b._type === 'tableBlock') {
      const rows = (b.rows || [])
        .map((r, i) => {
          const c = i === 0 && b.hasHeaderRow ? 'th' : 'td'
          return '<tr>' + (r.cells || []).map((x) => `<${c}>${esc(x).replace(/\[(\d+)\]/g, (_, n) => cite(n))}</${c}>`).join('') + '</tr>'
        })
        .join('')
      h += `<p class="draftMarker">tableBlock · ${esc(b._key)}</p><table>${rows}</table>`
    } else {
      h += `<p class="draftMarker">[${esc(b._type)} ${esc(b._key)} not rendered]</p>`
    }
  }
  close()
  return h
}

const section = (type, key, inner) =>
  `<section class="draftSection" data-type="${esc(type)}" data-key="${esc(key)}">\n<p class="draftMarker">${esc(type)} · ${esc(key)}</p>\n${inner}\n</section>\n`

/** One Sanity section to a draftSection. Unknown section types render their JSON and a marker. */
export function renderSection(s) {
  switch (s._type) {
    case 'heroSection':
      return section(s._type, s._key, `<p class="draftMarker">${esc(s.eyebrow)}</p><h1>${esc(s.heading)}</h1>`)
    case 'textSection':
      return section(s._type, s._key, `${s.heading ? `<h2>${esc(s.heading)}</h2>` : ''}${portableText(s.content)}`)
    case 'htmlSection':
      return section(s._type, s._key, `<div class="draftHtml">${s.html || ''}</div>`)
    case 'mermaidSection':
      return section(s._type, s._key, `<pre>${esc(s.code || s.mermaid || '')}</pre>`)
    case 'calloutSection':
      return section(s._type, s._key, `<aside><strong>${esc(s.title)}</strong>${portableText(s.body)}</aside>`)
    default:
      return section(s._type, s._key, `<p class="draftMarker">[${esc(s._type)} not rendered, JSON below]</p><pre>${esc(JSON.stringify(s, null, 1))}</pre>`)
  }
}

export function bodyWords(doc) {
  return (doc.sections || [])
    .flatMap((s) => [...(s.content || []), ...(s.body || [])])
    .filter((b) => b._type === 'block')
    .flatMap((b) => b.children || [])
    .map((c) => c.text)
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length
}

const row = (k, v) => `<tr><th>${k}</th><td>${v}</td></tr>`

/** The stamp and front-matter tables plus every section and the citations: the <main> content. */
export function renderDocument(doc, { issue = '', status = 'in review', now = new Date().toISOString() } = {}) {
  const list = (a) => esc((a || []).join(', '))
  const stamp = `<table class="draftStamp">
${row('Working draft', 'Every edit happens in this file. Sanity gets the result at the end of the round (write-pipeline §0b).')}
${row('Status', esc(status))}
${row('Sanity document', esc(doc._id))}
${row('_rev', esc(doc._rev))}
${row('Updated', `${esc(now)} (exported from Sanity; draft last changed ${esc(doc._updatedAt)})`)}
${row('Tracking issue', esc(issue))}
</table>`
  const front = `<table>
${row('Title', esc(doc.title))}
${row('Slug', esc(doc.slug?.current))}
${row('Excerpt', esc(doc.excerpt))}
${row('aiDisclosure', esc(doc.aiDisclosure))}
${row('Authors', list(doc.authorNames))}
${row('Categories', list(doc.categoryNames))}
${row('Tags', list(doc.tagNames))}
${row('Tools', list(doc.toolNames))}
${row('Related', esc((doc.relatedTitles || []).join(' · ')))}
${row('Length', `${bodyWords(doc)} body words (text blocks only; tables and charts excluded)`)}
</table>`
  const cits = (doc.citations || [])
    .map((c, i) => `<li id="cit-${i + 1}">${esc(c.text)} <a href="${esc(c.url)}">${esc(c.label || c.url)}</a></li>`)
    .join('\n')
  const sections = (doc.sections || []).map(renderSection).join('')
  return `${stamp}\n${front}\n${sections}<section class="draftSection" data-type="citations" data-key="citations">\n<h2>Citations</h2>\n<ol>\n${cits}\n</ol>\n</section>`
}

/** A full self-contained page: tokens, theme, doc-base and the template's own styles inlined. */
export function page({ title, css, main, toggleJs }) {
  return `<!doctype html>
<html lang="en" data-theme="light-pink-moon">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<!-- Working draft (docs/write-pipeline-prompt.md §0b). Written by pnpm export:draft; styles inlined so it renders anywhere. -->
<style>
${css}
</style>
</head>
<body>
<main>
<button class="docThemeToggle" id="themeToggle" aria-pressed="false">Switch to dark view</button>
${main}
</main>
<script>
${toggleJs}
</script>
</body>
</html>
`
}

/** Read one stamp cell (`_rev`, `Status`, `Sanity document`, `Tracking issue`) from a working draft. */
export function stampValue(html, label) {
  const m = html.match(new RegExp(`<th>${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</th>\\s*<td>([\\s\\S]*?)</td>`))
  return m ? m[1].replace(/<!--[\s\S]*?-->/g, '').trim() : ''
}

/** Replace one stamp cell in place. */
export function setStamp(html, label, value) {
  const re = new RegExp(`(<th>${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</th>\\s*<td>)[\\s\\S]*?(</td>)`)
  return html.replace(re, `$1${esc(value)}$2`)
}

const ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' }

/** Visible text, whitespace-collapsed: what a reader of the section reads. */
export function visibleText(html) {
  return html
    .replace(/<(style|script)[^>]*>[\s\S]*?<\/\1>/g, ' ')
    .replace(/<p class="draftMarker">[\s\S]*?<\/p>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (e) => ENTITIES[e])
    .replace(/\s+/g, ' ')
    .trim()
}

/** Map of section key to visible text, from a working draft or a fresh render. */
export function sectionTexts(html) {
  const out = new Map()
  const re = /<section class="draftSection" data-type="([^"]*)" data-key="([^"]*)">/g
  const starts = [...html.matchAll(re)]
  starts.forEach((m, i) => {
    const from = m.index + m[0].length
    const to = i + 1 < starts.length ? starts[i + 1].index : html.indexOf('</main>', from) === -1 ? html.length : html.indexOf('</main>', from)
    const key = m[2] || `(no key: ${m[1]} #${i + 1})`
    out.set(key, visibleText(html.slice(from, to).replace(/<\/section>\s*$/, '')))
  })
  return out
}

/** Section-by-section difference between two pages. Empty array means they match. */
export function compareSections(localHtml, liveHtml) {
  const a = sectionTexts(localHtml)
  const b = sectionTexts(liveHtml)
  const diffs = []
  for (const [key, text] of a) {
    if (!b.has(key)) { diffs.push({ key, kind: 'only in working draft', local: text.slice(0, 120), live: '' }); continue }
    const other = b.get(key)
    if (text !== other) {
      let i = 0
      while (i < text.length && text[i] === other[i]) i++
      diffs.push({ key, kind: 'text differs', local: text.slice(Math.max(0, i - 40), i + 80), live: other.slice(Math.max(0, i - 40), i + 80) })
    }
  }
  for (const [key, text] of b) if (!a.has(key)) diffs.push({ key, kind: 'only in Sanity', local: '', live: text.slice(0, 120) })
  return diffs
}

/** Turn the committed template into a stand-alone new working draft. */
export function newDraftFromTemplate(templateHtml, { css, toggleJs, id, issue }) {
  let h = templateHtml
    .replace(/<link rel="stylesheet" href="[^"]+">\n?/g, '')
    .replace(/<style>/, `<style>\n${css}\n`)
    .replace(/<script src="[^"]+"><\/script>/, `<script>\n${toggleJs}\n</script>`)
    .replace(/<!-- FILL: ST-\{N\} working draft: \{working title\} -->\n<title>[^<]*<\/title>/, `<title>${esc(id)} working draft</title>`)
  h = setStamp(h, 'Tracking issue', issue)
  h = setStamp(h, 'Status', 'drafting')
  h = setStamp(h, 'Sanity document', 'not created')
  h = setStamp(h, 'Updated', new Date().toISOString())
  return h
}
