import { z } from 'zod'

export const getRuleInputSchema = {
  ruleName: z.string().describe('One of: featuredImage, web-adapter-rule, single-field-authority, atomic-reuse-gate, orient-before-acting, four-slug-queries'),
}

export const validateFieldInputSchema = {
  fieldName: z.string().describe('Sanity schema field name to check, e.g. "featuredImage"'),
  schema: z.string().optional().describe('Doc type the field appears on, e.g. "caseStudy" — narrows the check when a field name is deprecated only on specific schemas'),
}

export interface GovernanceRule {
  rule: string
  status: 'deprecated' | 'retired' | 'active' | 'enforced'
  instruction: string
  source: string
}

// Six rules named in the SUG-225 PRD as "sourced from CLAUDE.md". Two (orient-before-acting,
// four-slug-queries) actually live in sibling docs, never in CLAUDE.md itself — sourced from
// where they really are, not where the PRD assumed. web-adapter-rule is stated here as CURRENT
// truth, not the PRD's original text: SUG-224 (2026-07-24) retired the mirror-adapter pattern
// the PRD described, and encoding the old prohibition would make this tool actively wrong.
const RULES: Record<string, GovernanceRule> = {
  featuredImage: {
    rule: 'featuredImage',
    status: 'deprecated',
    instruction:
      'Deprecated (BL-07, v0.15.0). Not present on the canonical `article` document type at all. ' +
      'It only remains on the legacy `post` doc type, which is itself superseded by `article` (see the ' +
      'post→article rename). Do not add `featuredImage` to any new or existing schema — canonical thumbnail ' +
      'sources are `hero.media[0]` or `sections[]` (or `cardImage` specifically on `caseStudy`, itself deprecated ' +
      'in favour of an auto-derived hero image per SUG-50).',
    source: 'apps/studio/schemas/documents/post.ts (BL-07 originated in the retired backlog-priorities doc)',
  },
  'web-adapter-rule': {
    rule: 'web-adapter-rule',
    status: 'retired',
    instruction:
      'RETIRED 2026-07-24 (SUG-224). The historical rule was "apps/web does not import directly from ' +
      'packages/design-system" (mirror-adapter pattern: apps/web kept its own component mirrors). This is no ' +
      'longer true — apps/web now imports @sugartown/design-system directly across the codebase, and the mirror ' +
      'directory only retains SidebarNav and Tile (genuine app-only components with no package counterpart). ' +
      'Do not enforce or recommend the old prohibition.',
    source: '.claude/rules/tokens.md §Mirrored File Registry; docs/shipped/SUG-224-apps-web-consumes-design-system-package.md',
  },
  'single-field-authority': {
    rule: 'single-field-authority',
    status: 'enforced',
    instruction:
      'Each user-facing concept (label, title, description, URL) must resolve from exactly one field. If a ' +
      'sub-object (e.g. linkItem) brings a field that overlaps with a parent schema field (e.g. ctaButton.text vs ' +
      'linkItem.label), one must be canonical and the other must be hidden or removed in the same commit. Two ' +
      'fields that could plausibly hold the same value is a bug, not a feature.',
    source: '.claude/rules/sanity-schema.md §Single Field Authority',
  },
  'atomic-reuse-gate': {
    rule: 'atomic-reuse-gate',
    status: 'enforced',
    instruction:
      'Before creating any new schema object or shared utility, answer in writing: (1) Does this pattern already ' +
      'exist? Search all 5 layers — if yes, extend, do not fork. (2) Will this be consumed by more than one ' +
      'caller? If yes it must live in a shared location, never inline in a page file. (3) Is the API composable? ' +
      'A new schema object or utility that fails any of these three checks is a process failure.',
    source: 'CLAUDE.md §Atomic Reuse Gate',
  },
  'orient-before-acting': {
    rule: 'orient-before-acting',
    status: 'active',
    instruction:
      'Read the actual files. Confirm against the actual codebase. Do not trust an agent\'s memory of what a ' +
      'file contains without reading it. Start a new session for new epics; use /morning to re-establish ground ' +
      'truth from the actual repo state rather than session memory.',
    source: 'docs/ai/agentic-caucus/failure-modes.md',
  },
  'four-slug-queries': {
    rule: 'four-slug-queries',
    status: 'active',
    instruction:
      'If a new section type is added to sections[], have ALL four slug queries been updated? Use the Query ' +
      'Layer Checklist — do not rely on memory.',
    source: 'docs/epic-template.md',
  },
}

export class RuleNotFoundError extends Error {
  constructor(public readonly ruleName: string) {
    super(`Unknown rule "${ruleName}". Valid rules: ${Object.keys(RULES).join(', ')}`)
  }
}

export function getRule(ruleName: string): GovernanceRule {
  const rule = RULES[ruleName]
  if (!rule) throw new RuleNotFoundError(ruleName)
  return rule
}

export function listRuleNames(): string[] {
  return Object.keys(RULES)
}

interface DeprecatedFieldEntry {
  reason: string
  alternative: string
  schema?: string
}

const DEPRECATED_FIELDS: Record<string, DeprecatedFieldEntry> = {
  featuredImage: {
    reason: 'Deprecated (BL-07). Not present on the canonical `article` type; only lingers on legacy `post`.',
    alternative: 'hero.media[0] or sections[]',
  },
  cardImage: {
    reason: 'Card thumbnails will be auto-derived from the hero section image. See SUG-50.',
    alternative: 'hero section image (auto-derived, SUG-50)',
    schema: 'caseStudy',
  },
}

export interface ValidateFieldResult {
  valid: boolean
  reason?: string
  alternative?: string
}

export function validateField(fieldName: string, schema?: string): ValidateFieldResult {
  const entry = DEPRECATED_FIELDS[fieldName]
  if (!entry) return { valid: true }
  if (entry.schema && schema && entry.schema !== schema) return { valid: true }
  return { valid: false, reason: entry.reason, alternative: entry.alternative }
}
