import { z } from 'zod'
import { readRepoFile } from '../lib/file-reader.js'

const WEB_TOKENS_PATH = ['apps', 'web', 'src', 'design-system', 'styles', 'tokens.css']
const DS_TOKENS_PATH = ['packages', 'design-system', 'src', 'styles', 'tokens.css']

export const getTokensInputSchema = {
  tier: z.enum(['primitive', 'semantic', 'component']).optional().describe('Filter to one token tier; omit for all tiers'),
  name: z.string().optional().describe('Filter to tokens whose name contains this substring'),
}

export type TokenTier = 'primitive' | 'semantic' | 'component'

export interface TokenEntry {
  name: string
  value: string
  tier: TokenTier
  source: string
}

export interface TokensResult {
  tokens: TokenEntry[]
  mirrorDrift?: { name: string; webValue: string; dsValue: string }[]
}

// Component tokens are named for the specific surface they style (card, button, chip...).
// Everything else that aliases another --st-* token is semantic; raw literals are primitive.
// This is a naming-convention heuristic, not ground truth — tokens.json carries no tier field.
const COMPONENT_PREFIXES = [
  'card', 'button', 'chip', 'tag', 'pill', 'table', 'callout', 'code', 'hero', 'media',
  'metadata', 'stat-tile', 'tile', 'graph', 'kg', 'cwv', 'segmented', 'breadcrumb',
  'index-cell', 'citation', 'blockquote', 'glossary', 'icon-button', 'status', 'header',
  'footer', 'dl-ledger', 'label',
]

const VAR_DECLARATION = /--(\bst-[\w-]+)\s*:\s*([^;]+);/g

function parseTokensCss(pathSegments: string[]): Map<string, string> {
  const css = readRepoFile(...pathSegments)
  const tokens = new Map<string, string>()
  for (const match of css.matchAll(VAR_DECLARATION)) {
    tokens.set(match[1], match[2].trim())
  }
  return tokens
}

function classifyTier(name: string, value: string): TokenTier {
  const isAlias = /var\(--st-/.test(value)
  if (!isAlias) return 'primitive'
  const body = name.replace(/^st-/, '')
  const isComponent = COMPONENT_PREFIXES.some((prefix) => body === prefix || body.startsWith(`${prefix}-`))
  return isComponent ? 'component' : 'semantic'
}

export function getTokens(input: { tier?: TokenTier; name?: string }): TokensResult {
  const webTokens = parseTokensCss(WEB_TOKENS_PATH)
  const dsTokens = parseTokensCss(DS_TOKENS_PATH)

  const mirrorDrift: TokensResult['mirrorDrift'] = []
  for (const [name, webValue] of webTokens) {
    const dsValue = dsTokens.get(name)
    if (dsValue !== webValue) {
      mirrorDrift.push({ name, webValue, dsValue: dsValue ?? '<missing>' })
    }
  }

  let tokens: TokenEntry[] = Array.from(webTokens.entries()).map(([name, value]) => ({
    name,
    value,
    tier: classifyTier(name, value),
    source: WEB_TOKENS_PATH.join('/'),
  }))

  if (input.tier) {
    tokens = tokens.filter((t) => t.tier === input.tier)
  }
  if (input.name) {
    const needle = input.name.toLowerCase()
    tokens = tokens.filter((t) => t.name.toLowerCase().includes(needle))
  }

  return mirrorDrift.length > 0 ? { tokens, mirrorDrift } : { tokens }
}
