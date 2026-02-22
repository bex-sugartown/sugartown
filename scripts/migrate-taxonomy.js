#!/usr/bin/env node
/**
 * migrate-taxonomy.js — Taxonomy Migration Script
 *
 * Implements the mapping table from the taxonomy audit (Epic: Taxonomy Architecture).
 *
 * What it does, per document:
 *   1. Reads tags[] references — maps each to: controlled tag | tools[] value | remove
 *   2. Writes tools[] with extracted tool values (no duplicates)
 *   3. Replaces tags[] with only controlled-vocabulary tag refs
 *   4. Logs every change with doc ID, field, old value, new value
 *
 * Modes:
 *   --dry-run (default)  Log all changes, write nothing to Sanity
 *   --execute            Apply mutations to Sanity (irreversible — run dry-run first)
 *
 * Usage:
 *   node scripts/migrate-taxonomy.js                  # dry-run
 *   node scripts/migrate-taxonomy.js --dry-run        # explicit dry-run
 *   node scripts/migrate-taxonomy.js --execute        # live — writes to Sanity
 *
 * Environment variables required (reads from apps/web/.env or process.env):
 *   VITE_SANITY_PROJECT_ID
 *   VITE_SANITY_DATASET
 *   VITE_SANITY_API_VERSION
 *   VITE_SANITY_TOKEN    (write token required for --execute)
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ─── Args ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const IS_EXECUTE = args.includes('--execute')
const IS_DRY_RUN = !IS_EXECUTE

// ─── Load env ─────────────────────────────────────────────────────────────────

function loadEnv() {
  const envPath = resolve(__dirname, '../apps/web/.env')
  try {
    const raw = readFileSync(envPath, 'utf8')
    for (const line of raw.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      const key = trimmed.slice(0, eqIdx).trim()
      const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) process.env[key] = value
    }
  } catch {
    // .env not found — rely on process.env (CI etc.)
  }
}

loadEnv()

// ─── Sanity client ────────────────────────────────────────────────────────────

const projectId = process.env.VITE_SANITY_PROJECT_ID
const dataset = process.env.VITE_SANITY_DATASET ?? 'production'
const apiVersion = process.env.VITE_SANITY_API_VERSION ?? '2025-02-02'
// Prefer SANITY_AUTH_TOKEN (write token for scripts) over VITE_SANITY_TOKEN (read-only viewer token)
const token = process.env.SANITY_AUTH_TOKEN ?? process.env.VITE_SANITY_TOKEN

if (!projectId) {
  console.error('ERROR: VITE_SANITY_PROJECT_ID is not set.')
  process.exit(1)
}

if (IS_EXECUTE && !token) {
  console.error('ERROR: --execute requires SANITY_AUTH_TOKEN or VITE_SANITY_TOKEN (write token).')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

// ─── Canonical tools enum ─────────────────────────────────────────────────────
// Single source of truth for valid tools[] values.
// Must match the options.list in article.ts, caseStudy.ts, node.ts.

export const CANONICAL_TOOLS = new Set([
  'acquia', 'aem', 'celum', 'chatgpt', 'claude', 'claude-code',
  'contentful', 'css', 'drupal', 'figma', 'gemini', 'git', 'github',
  'javascript', 'linear', 'matplotlib', 'mermaid', 'netlify', 'networkx',
  'codex', 'oracle-atg', 'python', 'react', 'sanity', 'shopify',
  'storybook', 'turborepo', 'typescript', 'vite', 'wordpress',
])

// ─── Tag mapping table ────────────────────────────────────────────────────────
//
// Maps legacy tag Sanity _id → one of:
//   { action: 'tool', value: '<canonical-tool-slug>' }   — move to tools[]
//   { action: 'keep', id: '<tag-_id>' }                  — keep in tags[] (controlled vocab)
//   { action: 'remap', id: '<canonical-tag-_id>' }       — replace with canonical tag doc
//   { action: 'archive' }                                 — remove, no replacement
//
// Tag IDs are the Sanity _id strings from production (wp.tag.XXX or UUID).
// Controlled vocabulary tag IDs are the wp.tag.XXX IDs for tags that survive.
// Near-duplicates: the canonical _id is kept; the others remap to it.

const TAG_MAP = {
  // ── TOOLS ──────────────────────────────────────────────────────────────────
  // AI tools (also captured in node.aiTool — tools[] is for the broader stack)
  'wp.tag.377':  { action: 'tool', value: 'claude' },
  'wp.tag.448':  { action: 'tool', value: 'claude-code' },   // "claude-code"
  'wp.tag.449':  { action: 'tool', value: 'claude-code' },   // "claude code" (duplicate)
  'wp.tag.420':  { action: 'tool', value: 'chatgpt' },
  'wp.tag.419':  { action: 'tool', value: 'gemini' },
  // Web/dev tools
  'wp.tag.371':  { action: 'tool', value: 'react' },
  'wp.tag.342':  { action: 'tool', value: 'python' },
  'wp.tag.438':  { action: 'tool', value: 'figma' },
  'wp.tag.302':  { action: 'tool', value: 'figma' },         // "Figma variables" → figma
  'wp.tag.370':  { action: 'tool', value: 'sanity' },
  'wp.tag.345':  { action: 'tool', value: 'git' },
  'wp.tag.450':  { action: 'tool', value: 'github' },
  'wp.tag.303':  { action: 'tool', value: 'storybook' },
  'wp.tag.350':  { action: 'tool', value: 'css' },
  'wp.tag.395':  { action: 'tool', value: 'css' },           // "css grid" → css
  '1ab50c8d-6e13-4143-b650-4266d4be27ea': { action: 'tool', value: 'javascript' }, // "js"
  'wp.tag.439':  { action: 'tool', value: 'shopify' },
  'wp.tag.250':  { action: 'tool', value: 'linear' },
  '3ddbea3c-febe-4ef9-a0d4-973dfcb3a399': { action: 'tool', value: 'matplotlib' },
  '12590a81-81c5-42dd-8f5e-622d58c43e6d': { action: 'tool', value: 'mermaid' },
  'wp.tag.452':  { action: 'tool', value: 'codex' },
  'wp.tag.435':  { action: 'tool', value: 'networkx' },
  // CMS/platforms
  'wp.tag.82':   { action: 'tool', value: 'contentful' },
  'wp.tag.73':   { action: 'tool', value: 'drupal' },
  'wp.tag.244':  { action: 'tool', value: 'drupal' },        // "drupal 8" → drupal
  'wp.tag.272':  { action: 'tool', value: 'aem' },
  'wp.tag.74':   { action: 'tool', value: 'acquia' },
  'wp.tag.266':  { action: 'tool', value: 'oracle-atg' },
  'wp.tag.267':  { action: 'tool', value: 'oracle-atg' },    // "oracle bcc" → oracle-atg
  'wp.tag.241':  { action: 'tool', value: 'celum' },
  'wp.tag.34':   { action: 'archive' },                      // salesforce (0 refs)
  'wp.tag.83':   { action: 'archive' },                      // contentstack (0 refs)
  'wp.tag.61':   { action: 'archive' },                      // squarespace (0 refs)
  'wp.tag.33':   { action: 'archive' },                      // netsuite (0 refs)

  // ── CONTROLLED TAG KEEPS (survive as-is) ──────────────────────────────────
  'wp.tag.243':  { action: 'keep' },   // content audit
  'wp.tag.248':  { action: 'keep' },   // accessibility
  'wp.tag.441':  { action: 'keep' },   // alt text (accessibility concern)
  'wp.tag.246':  { action: 'keep' },   // agile (canonical — discard 969ac270 duplicate)
  '969ac270-6322-4977-8911-82ce2ffc5d65': { action: 'remap', id: 'wp.tag.246' }, // agile dup
  'wp.tag.383':  { action: 'keep' },   // ai collaboration
  'wp.tag.440':  { action: 'keep' },   // ai ethics
  'wp.tag.415':  { action: 'keep' },   // ai hallucinations
  'wp.tag.378':  { action: 'keep' },   // ai limitations
  'wp.tag.363':  { action: 'keep' },   // ai safety
  'wp.tag.382':  { action: 'keep' },   // ai workflows
  'wp.tag.436':  { action: 'keep' },   // agentic caucus
  'wp.tag.313':  { action: 'keep' },   // agentic interfaces
  'wp.tag.369':  { action: 'keep' },   // app development
  'wp.tag.372':  { action: 'keep' },   // architecture
  'wp.tag.259':  { action: 'keep' },   // atomic design
  'wp.tag.340':  { action: 'keep' },   // audit
  'wp.tag.341':  { action: 'keep' },   // automation
  'wp.tag.20':   { action: 'keep' },   // best practices
  'wp.tag.14':   { action: 'keep' },   // branding
  'wp.tag.322':  { action: 'keep' },   // cognitive load
  'wp.tag.76':   { action: 'keep' },   // community
  'wp.tag.300':  { action: 'keep' },   // component governance
  'wp.tag.103':  { action: 'keep' },   // composable
  'wp.tag.257':  { action: 'keep' },   // content architecture
  'wp.tag.424':  { action: 'keep' },   // content as data
  'wp.tag.428':  { action: 'keep' },   // content-as-code
  'wp.tag.312':  { action: 'keep' },   // content migration
  'wp.tag.306':  { action: 'keep' },   // content modeling (canonical)
  'wp.tag.86':   { action: 'remap', id: 'wp.tag.306' },      // "content model" → content modeling
  'wp.tag.87':   { action: 'remap', id: 'wp.tag.306' },      // "atomic content model" → content modeling
  'wp.tag.328':  { action: 'keep' },   // content ops
  'wp.tag.263':  { action: 'keep' },   // content strategy
  'wp.tag.386':  { action: 'keep' },   // core web vitals
  'wp.tag.325':  { action: 'keep' },   // cross-functional collaboration
  'wp.tag.239':  { action: 'keep' },   // dam
  'wp.tag.318':  { action: 'keep' },   // dashboards
  'wp.tag.339':  { action: 'keep' },   // data integrity
  'wp.tag.353':  { action: 'keep' },   // data science
  'wp.tag.343':  { action: 'keep' },   // data visualization
  'wp.tag.434':  { action: 'keep' },   // debugging
  'wp.tag.326':  { action: 'keep' },   // design engineering
  'wp.tag.270':  { action: 'keep' },   // omnichannel
  'wp.tag.301':  { action: 'keep' },   // design ops
  'wp.tag.234':  { action: 'keep' },   // design system (canonical)
  'wp.tag.349':  { action: 'remap', id: 'wp.tag.234' },      // "design systems" → design system
  'wp.tag.235':  { action: 'keep' },   // design tokens
  'wp.tag.447':  { action: 'keep' },   // developer-experience
  'wp.tag.387':  { action: 'keep' },   // devtools
  'wp.tag.271':  { action: 'keep' },   // digital transformation
  'wp.tag.331':  { action: 'keep' },   // discovery vs delivery
  'wp.tag.379':  { action: 'keep' },   // documentation
  'wp.tag.334':  { action: 'remap', id: 'wp.tag.379' },      // "systemic documentation" → documentation
  '1814fc30-1cfd-4dda-bfdf-3d0c8a7cb120': { action: 'keep' }, // generative ai
  'wp.tag.355':  { action: 'keep' },   // governance (canonical)
  'wp.tag.329':  { action: 'remap', id: 'wp.tag.355' },      // "governance models" → governance
  'wp.tag.354':  { action: 'keep' },   // headless architecture
  'wp.tag.81':   { action: 'keep' },   // headless cms
  'wp.tag.385':  { action: 'keep' },   // human-in-the-loop
  'wp.tag.344':  { action: 'keep' },   // knowledge graph
  'wp.tag.317':  { action: 'keep' },   // llm workflows
  'wp.tag.308':  { action: 'keep' },   // metadata strategy
  'wp.tag.373':  { action: 'keep' },   // migration
  'wp.tag.374':  { action: 'keep' },   // monorepo
  'wp.tag.299':  { action: 'keep' },   // multi-brand theming
  'wp.tag.411':  { action: 'keep' },   // ontology
  'wp.tag.388':  { action: 'keep' },   // performance
  'wp.tag.362':  { action: 'keep' },   // personalization (if exists as tag — category has it too)
  'wp.tag.268':  { action: 'remap', id: 'wp.tag.311' },      // "p13n" → PIM/PXM ... actually → personalization
  'wp.tag.311':  { action: 'keep' },   // pim/pxm (canonical — this is "PIM / PXM")
  'wp.tag.255':  { action: 'remap', id: 'wp.tag.311' },      // "pim" → pim/pxm
  'wp.tag.254':  { action: 'remap', id: 'wp.tag.311' },      // "pxm" → pim/pxm
  'wp.tag.425':  { action: 'keep' },   // platform strategy
  'wp.tag.330':  { action: 'keep' },   // prioritization frameworks
  'wp.tag.456':  { action: 'keep' },   // process insight
  'wp.tag.381':  { action: 'keep' },   // product discovery
  'wp.tag.351':  { action: 'keep' },   // PRD (product requirements document)
  'wp.tag.413':  { action: 'keep' },   // product management
  'wp.tag.327':  { action: 'remap', id: 'wp.tag.409' },      // "product operations" → product ops
  'wp.tag.409':  { action: 'keep' },   // product ops (canonical)
  'wp.tag.427':  { action: 'keep' },   // product roadmap
  'wp.tag.384':  { action: 'keep' },   // product strategy
  'wp.tag.368':  { action: 'keep' },   // project management
  'wp.tag.437':  { action: 'keep' },   // prompt engineering
  'wp.tag.335':  { action: 'keep' },   // qa workflows
  'wp.tag.394':  { action: 'keep' },   // refactoring
  'wp.tag.404':  { action: 'keep' },   // release engineering
  'wp.tag.396':  { action: 'keep' },   // release management
  'wp.tag.392':  { action: 'keep' },   // release notes (canonical)
  'wp.tag.418':  { action: 'remap', id: 'wp.tag.392' },      // "release notes" dup → canonical
  'wp.tag.400':  { action: 'keep' },   // release process
  'wp.tag.357':  { action: 'keep' },   // resume-as-code
  'wp.tag.422':  { action: 'keep' },   // roadmap
  'wp.tag.389':  { action: 'keep' },   // seo
  'wp.tag.423':  { action: 'keep' },   // scope creep
  'wp.tag.298':  { action: 'keep' },   // semantic tokens
  'wp.tag.410':  { action: 'keep' },   // separation of concerns
  'wp.tag.346':  { action: 'keep' },   // source control
  'wp.tag.264':  { action: 'keep' },   // stakeholder alignment
  'wp.tag.307':  { action: 'keep' },   // structured content
  'wp.tag.426':  { action: 'keep' },   // system architecture
  'wp.tag.305':  { action: 'keep' },   // system drift
  'wp.tag.421':  { action: 'keep' },   // system thinking (canonical)
  'wp.tag.397':  { action: 'remap', id: 'wp.tag.421' },      // "system" → system thinking
  'wp.tag.309':  { action: 'keep' },   // taxonomy
  'wp.tag.332':  { action: 'keep' },   // team topology
  'wp.tag.274':  { action: 'keep' },   // tech debt (canonical)
  'wp.tag.366':  { action: 'remap', id: 'wp.tag.274' },      // "technical debt" → tech debt
  'wp.tag.304':  { action: 'keep' },   // token pipelines
  'wp.tag.451':  { action: 'keep' },   // tooling
  'wp.tag.12':   { action: 'keep' },   // ux (canonical → rename to "ux design" via doc update)
  'wp.tag.393':  { action: 'keep' },   // version control
  'wp.tag.431':  { action: 'keep' },   // versioning
  'wp.tag.352':  { action: 'keep' },   // visualization
  'wp.tag.402':  { action: 'keep' },   // ways of working
  'wp.tag.247':  { action: 'keep' },   // wcag
  'wp.tag.242':  { action: 'keep' },   // workflow
  'wp.tag.333':  { action: 'keep' },   // working agreements
  '0948b4af-7eb3-4984-8ff2-f314e0d29fc9': { action: 'keep' }, // ai generated

  // ── ARCHIVE — remove, no replacement ──────────────────────────────────────
  'wp.tag.455':  { action: 'archive' },  // #resist
  'wp.tag.29':   { action: 'archive' },  // adwords
  'wp.tag.47':   { action: 'archive' },  // agency
  'wp.tag.59':   { action: 'archive' },  // artist
  '10f7db6c-6d62-48b6-9319-87328a30a412': { action: 'archive' }, // ats
  'wp.tag.316':  { action: 'archive' },  // auto-tagging
  'wp.tag.341':  { action: 'keep' },     // automation (re-keep)
  'wp.tag.39':   { action: 'archive' },  // b2c
  'wp.tag.252':  { action: 'archive' },  // beauty retail
  'wp.tag.433':  { action: 'archive' },  // calver
  'wp.tag.30':   { action: 'archive' },  // campaign
  'wp.tag.429':  { action: 'archive' },  // career platform
  'wp.tag.338':  { action: 'archive' },  // case studies (meta tag)
  'wp.tag.60':   { action: 'archive' },  // ceramics
  'wp.tag.401':  { action: 'archive' },  // changelog (meta tag)
  'wp.tag.40':   { action: 'archive' },  // cpg
  'wp.tag.65':   { action: 'archive' },  // creative director
  'wp.tag.37':   { action: 'archive' },  // crm
  'wp.tag.72':   { action: 'archive' },  // customer journey mapping
  'wp.tag.21':   { action: 'archive' },  // demand generation
  'wp.tag.6':    { action: 'archive' },  // designer
  'wp.tag.52':   { action: 'archive' },  // digital
  'wp.tag.54':   { action: 'archive' },  // digital pm
  'wp.tag.22':   { action: 'archive' },  // dynamic content
  'wp.tag.58':   { action: 'archive' },  // ecommerce (0 future refs)
  'wp.tag.443':  { action: 'archive' },  // editorial illustration
  'wp.tag.71':   { action: 'archive' },  // education
  'wp.tag.78':   { action: 'archive' },  // entertainment
  'wp.tag.15':   { action: 'archive' },  // facebook
  'wp.tag.320':  { action: 'archive' },  // forms
  'wp.tag.249':  { action: 'archive' },  // fx networks
  '1814fc30-1cfd-4dda-bfdf-3d0c8a7cb120': { action: 'keep' }, // generative ai (re-keep, overrides)
  'wp.tag.314':  { action: 'archive' },  // generative UI
  'wp.tag.355':  { action: 'keep' },     // governance (re-keep — listed above already)
  'wp.tag.26':   { action: 'archive' },  // grid
  'wp.tag.445':  { action: 'archive' },  // hallucination (→ ai-hallucinations covers this)
  'wp.tag.53':   { action: 'archive' },  // health & beauty
  'wp.tag.446':  { action: 'archive' },  // humility
  'wp.tag.454':  { action: 'archive' },  // icloud
  'wp.tag.27':   { action: 'archive' },  // information design
  'wp.tag.321':  { action: 'archive' },  // input fields
  'wp.tag.442':  { action: 'archive' },  // intellectual property
  'wp.tag.319':  { action: 'archive' },  // interaction patterns
  'wp.tag.380':  { action: 'archive' },  // irony
  'wp.tag.359':  { action: 'archive' },  // json schema
  'wp.tag.31':   { action: 'archive' },  // landing page
  'wp.tag.4':    { action: 'archive' },  // layout
  'wp.tag.102':  { action: 'archive' },  // mach
  'wp.tag.407':  { action: 'archive' },  // market research
  'wp.tag.32':   { action: 'archive' },  // marketing
  'wp.tag.398':  { action: 'archive' },  // meta (meta tag about the site)
  'wp.tag.41':   { action: 'archive' },  // mobile
  'wp.tag.28':   { action: 'archive' },  // mockup
  'wp.tag.360':  { action: 'archive' },  // mvp
  'wp.tag.238':  { action: 'archive' },  // napa
  'wp.tag.70':   { action: 'archive' },  // non-profit
  'eb54ecf7-9003-4e30-8d47-1d2f5982e335': { action: 'archive' }, // "one" (test garbage)
  'wp.tag.289':  { action: 'archive' },  // opinion
  'wp.tag.453':  { action: 'archive' },  // apple
  'cdb2d3c1-456d-4b58-85d1-63527c085d21': { action: 'archive' }, // pdf
  'wp.tag.388':  { action: 'keep' },     // performance (re-keep)
  'wp.tag.361':  { action: 'archive' },  // pilot
  'wp.tag.44':   { action: 'archive' },  // pinterest
  'wp.tag.337':  { action: 'archive' },  // portfolio (meta)
  'wp.tag.253':  { action: 'archive' },  // prestige brands
  'wp.tag.265':  { action: 'archive' },  // procurement
  'wp.tag.5':    { action: 'archive' },  // production
  'wp.tag.288':  { action: 'archive' },  // rant
  'wp.tag.49':   { action: 'archive' },  // redesign
  'wp.tag.251':  { action: 'archive' },  // requirements
  'wp.tag.42':   { action: 'archive' },  // responsive
  'wp.tag.348':  { action: 'archive' },  // resume builder (→ resume-as-code)
  'wp.tag.258':  { action: 'archive' },  // reusable
  'wp.tag.85':   { action: 'archive' },  // rfp
  'wp.tag.310':  { action: 'archive' },  // schema.org
  'wp.tag.423':  { action: 'keep' },     // scope creep (re-keep)
  'wp.tag.324':  { action: 'archive' },  // scrum-but
  'wp.tag.35':   { action: 'archive' },  // sem
  'wp.tag.416':  { action: 'archive' },  // slop
  'wp.tag.57':   { action: 'archive' },  // small business
  'wp.tag.68':   { action: 'archive' },  // smb
  'wp.tag.16':   { action: 'archive' },  // social media
  'wp.tag.48':   { action: 'archive' },  // strategy (too generic)
  'wp.tag.367':  { action: 'archive' },  // sugartown-pink (meta-project → use projects[])
  'wp.tag.336':  { action: 'archive' },  // Sugartown (meta-project → use projects[])
  'wp.tag.7':    { action: 'archive' },  // tech
  'wp.tag.245':  { action: 'archive' },  // travel
  'wp.tag.17':   { action: 'archive' },  // twitter
  'b384ca6f-419b-4dae-982b-68f331552c46': { action: 'archive' }, // "two" (test garbage)
  'wp.tag.8':    { action: 'archive' },  // ui design
  'wp.tag.261':  { action: 'archive' },  // vendor selection
  'wp.tag.45':   { action: 'archive' },  // wine & beverage
  'wp.tag.11':   { action: 'archive' },  // wireframes
  'wp.tag.18':   { action: 'archive' },  // youtube
  'wp.tag.75':   { action: 'archive' },  // forum
  'wp.tag.358':  { action: 'archive' },  // etl pipeline (tool-process, not theme)
  'wp.tag.323':  { action: 'archive' },  // agile workflows → agile
  'wp.tag.408':  { action: 'archive' },  // AI (too broad — ai-collaboration covers it)
  'wp.tag.315':  { action: 'archive' },  // ai assisted authoring → ai-workflows
  'wp.tag.399':  { action: 'archive' },  // product platform strategy → platform strategy
  'wp.tag.403':  { action: 'archive' },  // design system governance → component governance
  'wp.tag.383':  { action: 'keep' },     // ai collaboration (canonical — re-assert)
  'wp.tag.101':  { action: 'archive' },  // atomic (too vague)
  'wp.tag.260':  { action: 'archive' },  // cms rfp
  'wp.tag.432':  { action: 'archive' },  // semver (→ versioning)
  'wp.tag.260':  { action: 'archive' },  // cms rfp
}

// ─── Fetch all tagged content ─────────────────────────────────────────────────

const CONTENT_QUERY = `
  *[_type in ["article", "caseStudy", "node"] && defined(slug.current)] {
    _id,
    _type,
    title,
    "slug": slug.current,
    "existingTools": tools,
    "tags": tags[]{ "_ref": _ref, "name": @->name, "_id": @->_id }
  }
`

// ─── Migration summary counters ───────────────────────────────────────────────

const summary = {
  docsInspected: 0,
  docsChanged: 0,
  tagsKept: 0,
  tagsMappedToTools: 0,
  tagsRemapped: 0,
  tagsArchived: 0,
  tagsUnmapped: 0,
  mutations: 0,
}

// ─── Core migration logic ─────────────────────────────────────────────────────

/**
 * computeMigration(doc) → { toolsToAdd, newTagRefs, changes }
 *
 * For a single document, compute what the new tools[] and tags[] should be.
 * Returns null if no changes are needed.
 */
function computeMigration(doc) {
  const tags = doc.tags ?? []
  if (tags.length === 0) return null

  const toolsToAdd = new Set(doc.existingTools ?? [])
  const newTagRefs = []
  const changes = []

  for (const tag of tags) {
    if (!tag._ref) continue
    const mapping = TAG_MAP[tag._ref]

    if (!mapping) {
      // Not in mapping table — unmapped. Warn; keep for now.
      summary.tagsUnmapped++
      changes.push({
        action: 'UNMAPPED',
        tagId: tag._ref,
        tagName: tag.name ?? '(unknown)',
        note: 'Not in mapping table — kept unchanged',
      })
      newTagRefs.push({ _type: 'reference', _ref: tag._ref })
      continue
    }

    if (mapping.action === 'tool') {
      if (CANONICAL_TOOLS.has(mapping.value)) {
        toolsToAdd.add(mapping.value)
        summary.tagsMappedToTools++
        changes.push({
          action: 'TOOL',
          tagId: tag._ref,
          tagName: tag.name ?? '(unknown)',
          toolValue: mapping.value,
        })
      } else {
        // Tool value not in canonical list — safety net
        changes.push({
          action: 'TOOL_UNKNOWN',
          tagId: tag._ref,
          tagName: tag.name ?? '(unknown)',
          toolValue: mapping.value,
          note: 'Not in CANONICAL_TOOLS — skipped',
        })
        newTagRefs.push({ _type: 'reference', _ref: tag._ref })
      }
    } else if (mapping.action === 'keep') {
      summary.tagsKept++
      newTagRefs.push({ _type: 'reference', _ref: tag._ref })
    } else if (mapping.action === 'remap') {
      summary.tagsRemapped++
      changes.push({
        action: 'REMAP',
        tagId: tag._ref,
        tagName: tag.name ?? '(unknown)',
        remapTo: mapping.id,
      })
      // Only add remap target if not already in list (dedup)
      if (!newTagRefs.some((r) => r._ref === mapping.id)) {
        newTagRefs.push({ _type: 'reference', _ref: mapping.id })
      }
    } else if (mapping.action === 'archive') {
      summary.tagsArchived++
      changes.push({
        action: 'ARCHIVE',
        tagId: tag._ref,
        tagName: tag.name ?? '(unknown)',
      })
      // Don't push to newTagRefs — removed
    }
  }

  const toolsArray = [...toolsToAdd].sort()
  const existingTools = doc.existingTools ?? []
  const toolsChanged =
    toolsArray.length !== existingTools.length ||
    toolsArray.some((t, i) => t !== existingTools[i])

  const tagRefsChanged =
    newTagRefs.length !== tags.length ||
    newTagRefs.some((r, i) => r._ref !== (tags[i]?._ref))

  if (!toolsChanged && !tagRefsChanged) return null

  return { toolsToAdd: toolsArray, newTagRefs, changes }
}

// ─── Main runner ──────────────────────────────────────────────────────────────

async function run() {
  const mode = IS_EXECUTE ? '🔴 EXECUTE (live writes)' : '🟡 DRY-RUN (no writes)'
  console.log('\n🔬  Sugartown Taxonomy Migration')
  console.log('══════════════════════════════════════════════')
  console.log(`   Mode:    ${mode}`)
  console.log(`   Project: ${projectId}  |  Dataset: ${dataset}`)
  console.log()

  if (IS_EXECUTE) {
    console.log('⚠️  EXECUTE mode — mutations will be applied to Sanity production.')
    console.log('   Press Ctrl-C within 5 seconds to abort.\n')
    await new Promise((r) => setTimeout(r, 5000))
  }

  let docs
  try {
    docs = await client.fetch(CONTENT_QUERY)
  } catch (err) {
    console.error('Sanity fetch failed:', err.message)
    process.exit(1)
  }

  console.log(`📄  Fetched ${docs.length} content documents\n`)
  summary.docsInspected = docs.length

  const changeLog = []

  for (const doc of docs) {
    const migration = computeMigration(doc)
    if (!migration) continue

    summary.docsChanged++
    const { toolsToAdd, newTagRefs, changes } = migration

    changeLog.push({
      docId: doc._id,
      docType: doc._type,
      title: doc.title,
      slug: doc.slug,
      changes,
      toolsToAdd,
      newTagRefs,
    })

    console.log(`\n📝  [${doc._type}] "${doc.title || doc.slug}" (${doc._id})`)
    for (const c of changes) {
      if (c.action === 'TOOL') {
        console.log(`     → TOOL:    "${c.tagName}" → tools["${c.toolValue}"]`)
      } else if (c.action === 'ARCHIVE') {
        console.log(`     → ARCHIVE: "${c.tagName}" removed`)
      } else if (c.action === 'REMAP') {
        console.log(`     → REMAP:   "${c.tagName}" → ${c.remapTo}`)
      } else if (c.action === 'UNMAPPED') {
        console.log(`     ⚠️  UNMAPPED: "${c.tagName}" (${c.tagId}) — kept unchanged`)
      } else if (c.action === 'TOOL_UNKNOWN') {
        console.log(`     ⚠️  TOOL_UNKNOWN: "${c.tagName}" → "${c.toolValue}" not in canonical list — kept`)
      }
    }
    console.log(`     tools[] after:  [${toolsToAdd.join(', ') || '(none)'}]`)
    console.log(`     tags[]  after:  ${newTagRefs.length} refs`)

    if (IS_EXECUTE) {
      try {
        await client
          .patch(doc._id)
          .set({ tools: toolsToAdd })
          .set({ tags: newTagRefs })
          .commit()
        summary.mutations++
        console.log(`     ✅  Patched`)
      } catch (err) {
        console.error(`     ❌  Patch failed: ${err.message}`)
      }
    }
  }

  // ── Summary ──────────────────────────────────────────────────────────────

  console.log('\n══════════════════════════════════════════════')
  console.log('📊  Migration Summary')
  console.log('──────────────────────────────────────────────')
  console.log(`   Documents inspected:      ${summary.docsInspected}`)
  console.log(`   Documents with changes:   ${summary.docsChanged}`)
  console.log(`   Tags kept (controlled):   ${summary.tagsKept}`)
  console.log(`   Tags → tools[]:           ${summary.tagsMappedToTools}`)
  console.log(`   Tags remapped:            ${summary.tagsRemapped}`)
  console.log(`   Tags archived (removed):  ${summary.tagsArchived}`)
  console.log(`   Tags unmapped (warnings): ${summary.tagsUnmapped}`)
  if (IS_EXECUTE) {
    console.log(`   Mutations applied:        ${summary.mutations}`)
  }
  console.log()

  if (IS_DRY_RUN) {
    console.log('🟡  DRY-RUN complete — no changes written to Sanity.')
    console.log('    Run with --execute to apply these changes.')
  } else {
    console.log('🔴  EXECUTE complete — changes written to Sanity production.')
  }

  if (summary.tagsUnmapped > 0) {
    console.log(`\n⚠️  ${summary.tagsUnmapped} unmapped tag(s) — review log above and add to TAG_MAP before re-running.`)
    process.exit(IS_DRY_RUN ? 0 : 1)
  }

  console.log()
  process.exit(0)
}

run()
