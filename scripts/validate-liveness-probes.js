#!/usr/bin/env node
/**
 * validate-liveness-probes.js — does each gate actually FIRE?
 *
 * ST-95's rebuild of the "liveness" idea SUG-284 removed on 2026-08-15
 * (`docs/reviews/post-mortem/2026-08-15-governance-layer-buildup-and-unwind.md`
 * §7, item 1). Deliberately NOT a revival of the old
 * `zArchive/2026-08-sug284-governance-layer/scripts/validate-enforcement-liveness.js`
 * — that file grew to 25 probes plus a control register, a coverage tally, and
 * a generated index with zero consumers. This is the minimal version: probes
 * only, nothing else. No `nextRead` dates, no register row, no published count.
 *
 * The mechanism is unchanged, because the mechanism was never the problem —
 * the machinery built around it was. For each gate: run it clean (must exit
 * 0), introduce a deliberate violation, run it again (must exit non-zero). A
 * gate that stays green against known-bad input is inert, whatever its
 * configuration says. Wiring is a property of configuration; liveness is a
 * property of behaviour, and the only way to check behaviour is to exercise
 * it.
 *
 * Seven probes chosen 2026-08-21, plus validate:contrast added 2026-10-13 (#160) (`docs/backlog/ST-95-liveness-probes-only.md`
 * §Scope) — all local/file-based, no production-data risk. Three gates
 * considered and excluded, with reasons, live in that doc: Chromatic
 * (deliberately non-blocking today, SUG-263), the Storybook frozen-globals
 * convention (no exit code, not a scripted validator), and the deleted root
 * `validate-tokens.js` (INC-004, nothing left to probe).
 *
 * Five Sanity-backed validators (urls, filters, taxonomy, content, schema-parity) judge
 * data fetched at run time, so they cannot be probed by breaking a repo file (SUG-269, #93).
 * Each one's judging logic is a pure function in a `lib/*-rules.cjs` module that the
 * validator itself imports; `ruleProbe` feeds that same function a clean and a broken
 * fixture. Some findings are warning-level in the validator (exit 0); those probes prove
 * the rule reports them, not the exit code.
 *
 * Usage:
 *   pnpm validate:liveness-probes
 *
 * Exit codes:
 *   0 — every probed gate failed its deliberate violation (i.e. every gate is live)
 *   1 — at least one gate stayed green against a known-bad input, or a probe errored
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { spawnSync } from 'child_process'
import { createRequire } from 'module'
import { requiredSections, requiredSubsections } from './check-epic-doc.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

// ─── Cleanup stack ───────────────────────────────────────────────────────────
// Every mutation pushes its undo here. Runs in `finally` and on signals, so an
// interrupted run does not leave a violation behind in the working tree.

const cleanups = []

function cleanupAll() {
  while (cleanups.length) {
    const undo = cleanups.pop()
    try {
      undo()
    } catch (err) {
      console.error(`   ⚠️   cleanup failed: ${err.message}`)
    }
  }
}

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    cleanupAll()
    process.exit(130)
  })
}

/** Create a temp file, registering its removal. Creates parent dirs as needed. */
function tempFile(relPath, contents) {
  const full = resolve(ROOT, relPath)
  const dir = dirname(full)
  const dirExisted = existsSync(dir)
  mkdirSync(dir, { recursive: true })
  writeFileSync(full, contents, 'utf8')
  cleanups.push(() => {
    rmSync(full, { force: true })
    // Only remove the directory if this probe created it.
    if (!dirExisted) rmSync(dir, { recursive: true, force: true })
  })
  return full
}

/**
 * Mutate an existing tracked file, registering byte-exact restoration.
 *
 * Throws when the transform is a no-op. Without this, a stale needle writes
 * the file back byte-identical, the gate runs on a clean tree and exits 0,
 * and the harness reports the GATE as inert — when the truth is the PROBE's
 * needle went stale. That misattribution invites a future session to weaken
 * a gate that was working fine. Fail loudly as an invalid probe instead.
 */
function mutateFile(relPath, transform) {
  const full = resolve(ROOT, relPath)
  const original = readFileSync(full, 'utf8')
  const mutated = transform(original)
  if (mutated === original) {
    throw new Error(
      `probe transform was a no-op on ${relPath} — the injection needle is stale, ` +
        `so this probe would prove nothing. Fix the probe, not the gate.`
    )
  }
  cleanups.push(() => writeFileSync(full, original, 'utf8'))
  writeFileSync(full, mutated, 'utf8')
  return full
}

/** Run a command, returning its exit code and combined output. */
function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, {
    cwd: opts.cwd || ROOT,
    encoding: 'utf8',
    env: { ...process.env, ...(opts.env || {}) },
    maxBuffer: 32 * 1024 * 1024,
  })
  return { code: res.status ?? 1, out: `${res.stdout || ''}${res.stderr || ''}` }
}

/**
 * Standard probe: run the gate clean, then run it against a deliberate violation.
 *
 * The control run is not ceremony. Without it, "the gate exited non-zero" is
 * indistinguishable from "the gate never ran" — a probe invoking a script that
 * does not exist at that path would also exit non-zero, and read as detection
 * rather than as a broken invocation. So: clean run MUST exit 0 (the gate
 * works and the invocation is real), and the violating run MUST exit non-zero
 * (the gate detects the violation). Anything else is an invalid probe,
 * reported as an error rather than a pass.
 */
function gateProbe({ cmd, args, breakIt, success }) {
  const control = run(cmd, args)
  if (control.code !== 0) {
    return {
      live: false,
      invalid: true,
      detail:
        `control run failed — \`${cmd} ${args.join(' ')}\` exits ${control.code} on a CLEAN tree, ` +
        `so this probe cannot distinguish a live gate from a broken invocation. ` +
        `Output: ${control.out.trim().slice(-300)}`,
    }
  }
  breakIt()
  const violated = run(cmd, args)
  return {
    live: violated.code !== 0,
    detail: violated.code !== 0 ? success : violated.out.trim().slice(-400),
    out: violated.out,
  }
}

/**
 * Rule probe, for validators that judge remote Sanity data (SUG-269, #93).
 *
 * Those validators cannot be probed by breaking a repo file: failing them means
 * writing bad data to the production dataset. Their judging logic is a pure
 * function in apps/web/scripts/lib/*.cjs, which the validator itself imports.
 * This feeds that same function a clean fixture (must report nothing: the
 * control) and a broken one (must report a finding). Same contract as gateProbe:
 * a failing control makes the probe invalid, not passed.
 */
function ruleProbe({ judge, clean, broken, fires, success }) {
  const control = judge(clean)
  if (fires(control)) {
    return {
      live: false,
      invalid: true,
      detail: 'control run reported a finding on the CLEAN fixture, so this probe cannot tell a live rule from a noisy one',
    }
  }
  const violated = judge(broken)
  return {
    live: fires(violated),
    detail: fires(violated) ? success : 'the rule reported nothing on a known-bad fixture',
  }
}

const requireCjs = createRequire(import.meta.url)

// ─── Architectural boundary probes (INC-011 / SUG-254) ───────────────────────
//
// One probe per enforced scope, generated from the same SCOPES map the ESLint
// configs consume — so a scope added there without a probe is impossible, and
// a probe cannot drift from the rule it claims to test. This is the gate with
// direct incident history: four rules declared, none firing, for 176 days
// while reporting green.

const { SCOPES, patternsFor } = createRequire(import.meta.url)(
  resolve(ROOT, 'packages/eslint-config/boundary-rules.js')
)

/** A concrete import specifier that the given no-restricted-imports group forbids. */
function specimenFor(group) {
  const SPECIMENS = {
    '**/apps/**': '../../apps/web/src/main',
    '**/apps/studio/**': '../../apps/studio/schemas/index',
    '**/packages/design-system/**': '../../packages/design-system/src/index',
    '@sugartown/design-system': '@sugartown/design-system',
    '@sanity/**': '@sanity/client',
    sanity: 'sanity',
    groq: 'groq',
  }
  const hit = group.find((g) => g in SPECIMENS)
  if (!hit) {
    throw new Error(
      `no specimen import known for group [${group.join(', ')}] — add one to SPECIMENS ` +
        `so this rule is actually exercised rather than silently skipped`
    )
  }
  return SPECIMENS[hit]
}

// Each scope's real lint invocation, run through pnpm --filter (not turbo), so
// no cache can replay a pass computed before the probe existed.
const BOUNDARY_SCOPE_META = {
  'packages/design-system': { pkg: '@sugartown/design-system', probe: 'src/__liveness_boundary_probe__.ts' },
  'packages/mcp-server': { pkg: '@sugartown/mcp-server', probe: 'src/__liveness_boundary_probe__.ts' },
  'packages/storybook-docs': { pkg: '@sugartown/storybook-docs', probe: 'src/__liveness_boundary_probe__.ts' },
  // Two probes: apps/web lints `.js`/`.jsx` and `.ts`/`.tsx` through separate
  // parsers, and the TS files went unlinted until SUG-258 (#86).
  'apps/web': {
    pkg: 'web',
    probe: ['src/__liveness_boundary_probe__.js', 'src/__liveness_boundary_probe__.tsx'],
  },
}

const BOUNDARY_PROBES = Object.keys(SCOPES).flatMap((scope) => {
  const meta = BOUNDARY_SCOPE_META[scope]
  const files = meta ? [meta.probe].flat() : [undefined]
  return files.map((file) => boundaryProbe(scope, meta, file, files.length > 1))
})

function boundaryProbe(scope, meta, file, labelFile) {
  const patterns = patternsFor(scope)
  return {
    gate: labelFile ? `boundary: ${scope} (${file.split('.').pop()})` : `boundary: ${scope}`,
    why: `every boundary rule for ${scope} must reject a forbidden import (INC-011)`,
    run() {
      if (!meta) {
        return {
          live: false,
          invalid: true,
          detail:
            `scope "${scope}" is in SCOPES but has no entry in BOUNDARY_SCOPE_META, ` +
            `so its rules are unprobed. Add one — an enforced scope with no liveness ` +
            `probe is the state this harness exists to prevent.`,
        }
      }
      const result = gateProbe({
        cmd: 'pnpm',
        args: ['--filter', meta.pkg, 'lint'],
        success: `all ${patterns.length} rule(s) fired`,
        breakIt: () =>
          tempFile(
            `${scope}/${file}`,
            patterns.map((p) => `import '${specimenFor(p.group)}'\n`).join('') +
              'export const probe = 1\n'
          ),
      })
      if (result.invalid || !result.live) return result

      // Exit code alone proves *a* rule fired, not that each one did — the
      // check that would have caught ESLint's last-wins override merge
      // silently dropping one rule while another on the same file kept
      // working. Normalise punctuation: ESLint's stylish formatter strips the
      // trailing period from a rule message, so a naive substring match never
      // hits and every rule reads as silent.
      const norm = (s) => s.replace(/\s+/g, ' ').replace(/\.\s*$/, '').trim()
      const reported = norm(result.out || '')
      const missing = patterns.filter((p) => !reported.includes(norm(p.message)))
      if (missing.length) {
        return {
          live: false,
          detail:
            `lint failed, but ${missing.length} of ${patterns.length} rule(s) never reported. ` +
            `Silent: ${missing.map((p) => JSON.stringify(p.message.slice(0, 60))).join(', ')}. ` +
            `A scope where some rules fire and others vanish is partial enforcement, not ` +
            `enforcement.`,
        }
      }
      return { live: true, detail: `all ${patterns.length} rule(s) fired` }
    },
  }
}

// ─── Probes ──────────────────────────────────────────────────────────────────
//
// Each probe: { gate, why, run() -> { live, detail, invalid? } }
//
// `live: true`  — the gate failed its deliberate violation, as it should
// `live: false` — the gate stayed green: it is inert. This is the signal.
// `invalid`     — the probe itself is broken; never counted as a pass
//
// Invocations match how the gate is actually run by `.husky/pre-commit`
// (tokens, tokens:strict, style-mirror, dead-refs, css-names — all five are
// pre-commit-only today, not a CI step; see ST-95's Scope note on that gap)
// or `.github/workflows/ci.yml` (`pnpm lint`, which also covers the boundary
// probes above).

const EPIC_PROBE_DOC = 'scripts/__liveness_probe_epic__.md'

/** A complete epic doc: one filled section per [REQUIRED] template heading. */
function completeEpicDoc(visual) {
  const lines = ['---', `**Visual:** ${visual}`]
  if (visual === 'yes') lines.push('**Vspec:** `docs/drafts/LIVENESS-probe.vspec.html`')
  lines.push('---', '', '# LIVENESS-PROBE — probe epic', '')
  for (const name of requiredSections()) lines.push(`## ${name}`, '', 'Probe content.', '')
  return lines.join('\n')
}

/** A complete close-out: every close-out section and subsection from the template, filled. */
function completeCloseOutDoc() {
  const lines = ['# LIVENESS-PROBE — probe close-out', '']
  for (const [name, subs] of requiredSubsections()) {
    lines.push(`## ${name}`, '')
    if (subs.length === 0) lines.push('Probe content.', '')
    for (const sub of subs) {
      lines.push(`### ${sub}`, '')
      if (sub.toLowerCase() === 'follow-ups') {
        lines.push('| Follow-up | Kind | Where it went |', '|---|---|---|', '| probe item | implementation | #1 |', '')
      } else lines.push('Probe content.', '')
    }
  }
  return lines.join('\n')
}

// validate:urls — apps/web/scripts/lib/urls-rules.cjs
function urlsProbes() {
  const emptyData = {
    pages: [], articles: [], caseStudies: [], nodes: [], releaseNotes: [], archivePages: [],
    pagesNoSlug: [], articlesNoSlug: [], caseStudiesNoSlug: [], nodesNoSlug: [], releaseNotesNoSlug: [],
    navItems: [],
  }
  const doc = (_id, slug) => ({ _id, _type: 'page', title: _id, slug })
  const judge = (data) => requireCjs(resolve(ROOT, 'apps/web/scripts/lib/urls-rules.cjs')).judgeUrls(data)
  const clean = { ...emptyData, pages: [doc('a', 'about'), doc('b', 'contact')] }
  return [
    {
      gate: 'validate:urls (duplicate URL)',
      why: 'two documents resolving to one canonical path must be reported as an error (exit 1)',
      run: () =>
        ruleProbe({
          judge, clean,
          broken: { ...emptyData, pages: [doc('a', 'about'), doc('b', 'about')] },
          fires: (r) => r.errors > 0 && r.duplicates.length > 0,
          success: 'reported the duplicate canonical URL',
        }),
    },
    {
      gate: 'validate:urls (reserved slug)',
      why: 'a page slug that shadows an archive route must be reported as an error (exit 1)',
      run: () =>
        ruleProbe({
          judge, clean,
          broken: { ...emptyData, pages: [doc('a', 'articles')] },
          fires: (r) => r.errors > 0 && r.reservedCollisions.length > 0,
          success: 'reported the reserved-namespace collision',
        }),
    },
    {
      // A missing slug is a WARNING in validate-urls.js (exit 0), by design and unchanged by
      // this epic. The probe proves the rule reports it; it cannot prove the exit code.
      gate: 'validate:urls (missing slug)',
      why: 'a published document with no slug must be reported (warning-level, exits 0)',
      run: () =>
        ruleProbe({
          judge, clean,
          broken: { ...emptyData, pagesNoSlug: [{ _id: 'x', _type: 'page', title: 'No slug' }] },
          fires: (r) => r.missingSlug.length > 0,
          success: 'reported the missing slug',
        }),
    },
  ]
}

// validate:filters — apps/web/scripts/lib/filters-rules.cjs
function filtersProbes() {
  const rules = () => requireCjs(resolve(ROOT, 'apps/web/scripts/lib/filters-rules.cjs'))
  const archive = { _id: 'ap1', title: 'Articles', slug: 'articles', contentTypes: ['article'], filterConfig: { facets: [] } }
  return [
    {
      gate: 'validate:filters (null archivePage)',
      why: 'an archive route with no archivePage document must fail the filter model (exit 1)',
      run: () =>
        ruleProbe({
          judge: ({ page, items }) => rules().judgeArchive(page, items),
          clean: { page: archive, items: [] },
          broken: { page: null, items: [] },
          fires: (v) => v.fails && v.modelError !== null,
          success: 'reported the missing archivePage',
        }),
    },
    {
      gate: 'validate:filters (WP key in query)',
      why: 'a purged WP-era key in a GROQ query string must be reported (exit 1)',
      run: () =>
        ruleProbe({
          judge: (q) => rules().detectWpKeysInString(q),
          clean: '*[_type == "tag"]{ _id, name }',
          broken: '*[_type == "tag"]{ _id, wp_tag }',
          fires: (found) => found.length > 0,
          success: 'reported wp_tag in the query string',
        }),
    },
    {
      gate: 'validate:filters (WP key in model)',
      why: 'a purged WP-era key in the filter model output must be reported (exit 1)',
      run: () =>
        ruleProbe({
          judge: (model) => rules().detectWpKeys(model),
          clean: { archive: { id: 'ap1' }, facets: [{ id: 'tag', options: [] }] },
          broken: { archive: { id: 'ap1' }, facets: [{ id: 'tag', options: [{ gem_status: 'x' }] }] },
          fires: (found) => found.length > 0,
          success: 'reported gem_status in the model',
        }),
    },
  ]
}

// validate:taxonomy — apps/web/scripts/lib/taxonomy-rules.cjs
function taxonomyProbes() {
  const judge = (data) => requireCjs(resolve(ROOT, 'apps/web/scripts/lib/taxonomy-rules.cjs')).judgeTaxonomy(data)
  const empty = { docs: [], toolDocs: [], tagDocs: [], personDocs: [], projectDocs: [], contentRefs: [] }
  const cleanDoc = { _id: 'd1', _type: 'article', title: 'A', slug: 'a', categoryCount: 1, toolIds: ['t1'], tagIds: ['g1'] }
  const clean = {
    ...empty,
    docs: [cleanDoc],
    toolDocs: [{ _id: 't1', name: 'Tool', slug: 'tool' }],
    tagDocs: [{ _id: 'g1', name: 'Tag', slug: 'tag' }],
    personDocs: [{ _id: 'p1', name: 'Person', slug: 'person' }],
    projectDocs: [{ _id: 'j1', name: 'Project', slug: 'project' }],
    contentRefs: [{ _id: 'd1', _type: 'article', authorIds: ['p1'], projectIds: ['j1'] }],
  }
  const probe = (gate, why, mutate, fires, success) => ({
    gate,
    why,
    run: () => ruleProbe({ judge, clean, broken: mutate(clean), fires, success }),
  })
  return [
    probe('validate:taxonomy (dangling tool)', 'a tools[] ref to a missing tool doc must be an error (exit 1)',
      (c) => ({ ...c, docs: [{ ...cleanDoc, toolIds: ['missing-tool'] }] }),
      (r) => r.errors > 0 && r.toolErrors.length > 0, 'reported the dangling tool ref'),
    probe('validate:taxonomy (dangling tag)', 'a tags[] ref to a missing tag doc must be an error (exit 1)',
      (c) => ({ ...c, docs: [{ ...cleanDoc, tagIds: ['missing-tag'] }] }),
      (r) => r.errors > 0 && r.dangling.length > 0, 'reported the dangling tag ref'),
    probe('validate:taxonomy (dangling author)', 'an authors[] ref to a missing person doc must be an error (exit 1)',
      (c) => ({ ...c, contentRefs: [{ _id: 'd1', _type: 'article', authorIds: ['missing-person'], projectIds: [] }] }),
      (r) => r.errors > 0 && r.danglingPersonRefs.length > 0, 'reported the dangling author ref'),
    // Category counts are WARNINGS in validate-taxonomy.js (exit 0), by design and unchanged by
    // this epic. These probes prove the rule reports them; they cannot prove the exit code.
    probe('validate:taxonomy (0 categories)', 'a document with 0 categories must be reported (warning-level, exits 0)',
      (c) => ({ ...c, docs: [{ ...cleanDoc, categoryCount: 0 }] }),
      (r) => r.uncategorized.length > 0, 'reported the uncategorized document'),
    probe('validate:taxonomy (3 categories)', 'a document with more than 2 categories must be reported (warning-level, exits 0)',
      (c) => ({ ...c, docs: [{ ...cleanDoc, categoryCount: 3 }] }),
      (r) => r.overCategorized.length > 0, 'reported the over-categorized document'),
  ]
}

// validate:content — apps/web/scripts/lib/content-rules.cjs
function contentProbes() {
  const rules = () => requireCjs(resolve(ROOT, 'apps/web/scripts/lib/content-rules.cjs'))
  const doc = {
    _id: 'c1', _type: 'article', title: 'A', slug: 'a', excerpt: 'x',
    authorRefs: ['p1'], categoryRefs: [], tagRefs: [], projectRefs: [], toolRefs: [],
    toolCount: 1, categoryCount: 1, tagCount: 3, authorCount: 1, hasSeoTitle: true, hasSeoDescription: true,
  }
  const clean = {
    content: [doc],
    taxonomies: [{ _id: 'p1', _type: 'person', name: 'P', slug: 'p' }],
    pages: [],
    archivePages: [{ _id: 'ap1', title: 'Articles', slug: 'articles', contentTypes: ['article'] }],
    portableTextDocs: [],
    nav: [],
    missingTitle: [],
    missingSlug: [],
  }
  const probe = (gate, why, mutate, fires, success, opts) => ({
    gate,
    why,
    run: () =>
      ruleProbe({ judge: (d) => rules().judgeContent(d, opts), clean, broken: mutate(clean), fires, success }),
  })
  return [
    probe('validate:content (duplicate slug)', 'two documents of one type sharing a slug must be an error (exit 1)',
      (c) => ({ ...c, content: [doc, { ...doc, _id: 'c2' }] }),
      (r) => r.errors > 0 && r.duplicateSlugs.length > 0, 'reported the duplicate slug'),
    probe('validate:content (empty archive types)', 'an archivePage with an empty contentTypes array must be an error (exit 1)',
      (c) => ({ ...c, archivePages: [{ ...c.archivePages[0], contentTypes: [] }] }),
      (r) => r.errors > 0 && r.archiveResults.some((a) => a.kind === 'empty'), 'reported the empty contentTypes'),
    probe('validate:content (invalid archive type)', 'an archivePage with an unknown content type must be an error (exit 1)',
      (c) => ({ ...c, archivePages: [{ ...c.archivePages[0], contentTypes: ['bogus'] }] }),
      (r) => r.errors > 0 && r.archiveResults.some((a) => a.kind === 'invalid'), 'reported the invalid contentType'),
    probe('validate:content (strict: no author)', '--strict must turn a document with no author into an error (exit 1)',
      (c) => ({ ...c, content: [{ ...doc, authorCount: 0 }] }),
      (r) => r.errors > 0 && r.missingAuthors.length > 0, 'reported the missing author as an error', { strict: true }),
    // Warning-level in validate-content.js (exit 0), by design and unchanged by this epic. These
    // probes prove the rule reports the finding; they cannot prove the exit code.
    probe('validate:content (orphaned ref)', 'a reference to a missing document must be reported (warning-level, exits 0)',
      (c) => ({ ...c, content: [{ ...doc, authorRefs: ['ghost'] }] }),
      (r) => r.orphans.length > 0, 'reported the orphaned reference'),
    probe('validate:content (missing slug)', 'a document with no slug must be reported (warning-level, exits 0)',
      (c) => ({ ...c, missingSlug: [{ _id: 'x', _type: 'article', title: 'No slug' }] }),
      (r) => r.missingSlug.length > 0, 'reported the missing slug'),
    probe('validate:content (HTML entity)', 'a literal HTML entity in a Portable Text span must be reported (warning-level, exits 0)',
      (c) => ({
        ...c,
        portableTextDocs: [{ _id: 'c1', _type: 'article', title: 'A', slug: 'a',
          bodyBlocks: [{ _type: 'block', children: [{ _type: 'span', text: 'Tom &amp; Jerry' }] }] }],
      }),
      (r) => r.entityHits.length > 0, 'reported the literal entity'),
  ]
}

// validate:schema-parity — apps/studio/scripts/lib/schema-parity-rules.cjs
function schemaParityProbes() {
  const rules = () => requireCjs(resolve(ROOT, 'apps/studio/scripts/lib/schema-parity-rules.cjs'))
  const type = (name, ...fields) => ({ name, type: 'document', fields: fields.map((f) => ({ name: f, type: 'string' })) })
  const clean = { local: [type('article', 'title', 'slug')], deployed: [type('article', 'title', 'slug')] }
  const drift = (gate, why, broken, success) => ({
    gate,
    why,
    run: () =>
      ruleProbe({
        judge: ({ local, deployed }) => rules().diffWorkspace(local, deployed),
        clean, broken,
        fires: (r) => r.drifted,
        success,
      }),
  })
  const record = (name) => ({ _id: `_.schemas.${name}`, workspace: { name }, schema: '[]' })
  return [
    drift('validate:schema-parity (type added locally)', 'a type that exists locally but is not deployed must be drift (exit 1)',
      { local: [type('article', 'title', 'slug'), type('tool', 'name')], deployed: clean.deployed }, 'reported the undeployed type'),
    drift('validate:schema-parity (type removed locally)', 'a type that is deployed but removed locally must be drift (exit 1)',
      { local: clean.local, deployed: [type('article', 'title', 'slug'), type('tool', 'name')] }, 'reported the type pending deletion'),
    drift('validate:schema-parity (field changed)', 'a type whose definition differs from the deployed one must be drift (exit 1)',
      { local: [type('article', 'title', 'slug', 'excerpt')], deployed: clean.deployed }, 'reported the changed type'),
    {
      gate: 'validate:schema-parity (no deployed record)',
      why: 'a workspace with no matching deployed schema record must not be matched (exit 1)',
      run: () =>
        ruleProbe({
          judge: ({ workspace, records }) => rules().matchDeployedRecord(workspace, records),
          clean: { workspace: 'default', records: [record('default')] },
          broken: { workspace: 'default', records: [record('other'), record('another')] },
          fires: (r) => r.record === undefined,
          success: 'reported the unmatched workspace',
        }),
    },
  ]
}

const PROBES = [
  {
    gate: 'validate:tokens',
    why: 'an undefined var(--st-*) reference must not resolve',
    run: () =>
      gateProbe({
        cmd: 'pnpm',
        args: ['--filter', 'web', 'validate:tokens'],
        success: 'rejected the undefined token',
        breakIt: () =>
          tempFile(
            'apps/web/src/__liveness_probe__.css',
            '.probe { color: var(--st-this-token-does-not-exist-liveness-probe); }\n'
          ),
      }),
  },

  {
    gate: 'validate:tokens:strict',
    why: 'a raw hex colour in component CSS must be rejected',
    run: () =>
      gateProbe({
        cmd: 'pnpm',
        args: ['--filter', 'web', 'validate:tokens:strict'],
        success: 'rejected the raw hex',
        breakIt: () => tempFile('apps/web/src/__liveness_probe__.css', '.probe { color: #ff00aa; }\n'),
      }),
  },

  {
    gate: 'validate:contrast',
    why: 'a chip border token at about 1.7:1 against its surface must be rejected (#160)',
    run: () =>
      gateProbe({
        cmd: 'pnpm',
        args: ['--filter', 'web', 'validate:contrast'],
        success: 'rejected the 1.7:1 chip border',
        breakIt: () =>
          mutateFile('apps/web/src/design-system/styles/tokens.css', (css) =>
            css.replace(
              '--st-chip-border: var(--st-color-neutral-450);',
              '--st-chip-border: var(--st-color-neutral-300);'
            )
          ),
      }),
  },

  {
    gate: 'validate:tokens (raw fallback)',
    why: 'a non-colour raw fallback such as var(--st-space-4, 1rem) must be rejected',
    run: () =>
      gateProbe({
        cmd: 'pnpm',
        args: ['--filter', 'web', 'validate:tokens'],
        success: 'rejected the raw fallback',
        breakIt: () =>
          tempFile('apps/web/src/__liveness_probe__.css', '.probe { padding: var(--st-space-4, 1rem); }\n'),
      }),
  },

  {
    gate: 'validate:style-mirror',
    why: 'drift between the two copies of a mirrored style file must be caught (the drift risk INC-004\'s orphaned root validate-tokens.js used to leave uncovered)',
    run: () =>
      gateProbe({
        cmd: 'pnpm',
        args: ['--filter', 'web', 'validate:style-mirror'],
        success: 'caught the mirror drift',
        breakIt: () =>
          mutateFile(
            'packages/design-system/src/styles/globals.css',
            (src) => `${src}\n/* liveness probe — deliberate mirror drift */\n`
          ),
      }),
  },

  {
    gate: 'validate:dead-refs',
    why: 'a styles.X with no matching CSS class must be caught',
    run: () =>
      gateProbe({
        cmd: 'pnpm',
        args: ['--filter', 'web', 'validate:dead-refs'],
        success: 'caught the dead style reference',
        breakIt: () => {
          tempFile(
            'packages/design-system/src/components/LivenessProbe/LivenessProbe.module.css',
            '.real { display: block; }\n'
          )
          tempFile(
            'packages/design-system/src/components/LivenessProbe/LivenessProbe.tsx',
            [
              "import styles from './LivenessProbe.module.css'",
              '',
              'export function LivenessProbe() {',
              '  return <div className={styles.thisClassDoesNotExist} />',
              '}',
              '',
            ].join('\n')
          )
        },
      }),
  },

  {
    gate: 'validate:css-names',
    why: 'a content-type-scoped class name in pages/ must be blocked',
    run: () =>
      gateProbe({
        cmd: 'pnpm',
        args: ['--filter', 'web', 'validate:css-names'],
        success: 'blocked the tax* prefix',
        breakIt: () =>
          tempFile(
            'apps/web/src/pages/__liveness_probe__.module.css',
            '.taxProbeLiveness { display: block; }\n'
          ),
      }),
  },

  // Epic-doc completeness (ST-129). The probe doc is built from the template's
  // own [REQUIRED] headings, so a template change the checker misses fails here.
  {
    gate: 'check-epic-doc: required section',
    why: 'a doc missing a [REQUIRED] template section must fail',
    run: () => {
      tempFile(EPIC_PROBE_DOC, completeEpicDoc('no'))
      return gateProbe({
        cmd: 'node',
        args: ['scripts/check-epic-doc.js', EPIC_PROBE_DOC],
        success: 'rejected the missing Acceptance Criteria',
        breakIt: () =>
          mutateFile(EPIC_PROBE_DOC, (src) => src.replace('## Acceptance Criteria\n\nProbe content.\n', '')),
      })
    },
  },

  {
    gate: 'check-epic-doc: vspec path',
    why: 'a Visual: yes doc with no vspec path must fail',
    run: () => {
      tempFile(EPIC_PROBE_DOC, completeEpicDoc('yes'))
      return gateProbe({
        cmd: 'node',
        args: ['scripts/check-epic-doc.js', EPIC_PROBE_DOC],
        success: 'rejected the missing vspec path',
        breakIt: () => mutateFile(EPIC_PROBE_DOC, (src) => src.replace(/^\*\*Vspec:\*\*.*\n/m, '')),
      })
    },
  },

  // Drift stage: an epic aligned in the future has no rule changes after it; one aligned
  // in 2000 must be told about the rule files changed since.
  {
    gate: 'check-epic-doc: --drift',
    why: 'an epic aligned before the rules last changed must report drift',
    run: () => {
      tempFile(EPIC_PROBE_DOC, completeEpicDoc('no').replace('---\n', '---\n**Aligned:** 2999-01-01\n'))
      return gateProbe({
        cmd: 'node',
        args: ['scripts/check-epic-doc.js', EPIC_PROBE_DOC, '--drift'],
        success: 'reported rule files changed since 2000-01-01',
        breakIt: () => mutateFile(EPIC_PROBE_DOC, (src) => src.replace('2999-01-01', '2000-01-01')),
      })
    },
  },

  // Close-out stage (ST-130), built from the template's close-out sections.
  {
    gate: 'check-epic-doc: close-out review',
    why: 'a close-out missing a required section must fail',
    run: () => {
      tempFile(EPIC_PROBE_DOC, completeCloseOutDoc())
      return gateProbe({
        cmd: 'node',
        args: ['scripts/check-epic-doc.js', EPIC_PROBE_DOC, '--stage', 'close-out'],
        success: 'rejected the missing Post-ship checks',
        breakIt: () => mutateFile(EPIC_PROBE_DOC, (src) => src.replace(/## Post-ship checks\n\nProbe content\.\n/, '')),
      })
    },
  },

  {
    gate: 'check-epic-doc: follow-up routing',
    why: 'a follow-up with no issue and no decline must fail',
    run: () => {
      tempFile(EPIC_PROBE_DOC, completeCloseOutDoc())
      return gateProbe({
        cmd: 'node',
        args: ['scripts/check-epic-doc.js', EPIC_PROBE_DOC, '--stage', 'close-out'],
        success: 'rejected the unrouted follow-up',
        breakIt: () => mutateFile(EPIC_PROBE_DOC, (src) => src.replace('| probe item | implementation | #1 |', '| probe item | implementation | later |')),
      })
    },
  },

  // Sanity-backed validators (SUG-269, #93). Each judges data fetched at run time, so the
  // probe feeds the validator's own pure rule function a fixture instead of breaking a file.
  ...urlsProbes(),
  ...filtersProbes(),
  ...taxonomyProbes(),
  ...contentProbes(),
  ...schemaParityProbes(),

  // Architectural boundary rules — one probe per enforced scope, generated
  // from SCOPES above. INC-011 / SUG-254.
  ...BOUNDARY_PROBES,
]

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  console.log('\n🔬  Sugartown Liveness Probes')
  console.log('══════════════════════════════════════════════\n')
  console.log('   Each gate is run against a deliberate violation.')
  console.log('   A gate that stays green against known-bad input is inert.\n')

  const live = []
  const inert = []
  const invalid = []

  for (const probe of PROBES) {
    let result
    try {
      result = probe.run()
    } catch (err) {
      result = { live: false, invalid: true, detail: `probe threw: ${err.message}` }
    } finally {
      // Restore immediately, so probes never contaminate each other.
      cleanupAll()
    }

    if (result.invalid) {
      invalid.push({ ...probe, ...result })
      console.log(`   ⚠️   ${probe.gate.padEnd(32)} PROBE INVALID — cannot vouch for this gate`)
    } else if (result.live) {
      live.push({ ...probe, ...result })
      console.log(`   ✅  ${probe.gate.padEnd(32)} ${result.detail}`)
    } else {
      inert.push({ ...probe, ...result })
      console.log(`   ❌  ${probe.gate.padEnd(32)} STAYED GREEN against a known violation`)
    }
  }

  console.log('\n──────────────────────────────────────────────\n')
  console.log(`   ✅  ${live.length} gate(s) proven live`)
  if (invalid.length) console.log(`   ⚠️   ${invalid.length} probe(s) invalid`)
  console.log(`   ${inert.length > 0 ? '❌' : '✅'}  ${inert.length} gate(s) inert\n`)

  if (invalid.length > 0) {
    console.log('   Invalid probes — the probe is broken, so the gate is UNVERIFIED:\n')
    for (const { gate, detail } of invalid) {
      console.log(`   ⚠️   ${gate}`)
      console.log(`        ${detail}\n`)
    }
    console.log('   Fix the probe. An unverified gate must never be reported as live.\n')
    return 1
  }

  if (inert.length > 0) {
    console.log('   Inert gates — declared, wired, and not firing:\n')
    for (const { gate, why, detail } of inert) {
      console.log(`   ✗  ${gate}`)
      console.log(`        expected: ${why}`)
      console.log(`        got:      ${detail}\n`)
    }
    console.log('──────────────────────────────────────────────')
    console.log('\n   This is the INC-011 / SUG-254 failure shape: a gate that is present')
    console.log('   in config and absent in behaviour. Fix the gate — do not remove the probe.\n')
    return 1
  }

  console.log('   Every probed gate failed its deliberate violation, as it should.\n')
  return 0
}

let exitCode = 1
try {
  exitCode = main()
} finally {
  cleanupAll()
}
process.exit(exitCode)
