/**
 * migrate-css-to-json.mjs
 *
 * Parses tokens.css and emits tokens/source/tokens.json for Style Dictionary.
 *
 * Rules:
 *   - Plain hex value         → $type: "color"
 *   - Single var(--st-*)      → SD reference {st-*} with $type: "other" (type resolved from referent)
 *   - color-mix() / complex   → $type: "other", literal string value
 *   - Everything else         → $type: "other", literal string value
 */

import { readFileSync, mkdirSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');

const CSS_PATH = resolve(ROOT, 'apps/web/src/design-system/styles/tokens.css');
const OUT_PATH  = resolve(ROOT, 'tokens/source/tokens.json');

const css = readFileSync(CSS_PATH, 'utf8');

// Match lines containing --st-foo-bar: value (with optional comment and trailing semicolon)
const TOKEN_LINE = /^\s*(--st-[\w-]+)\s*:\s*(.+)/;

// Single var(--st-foo) reference — no fallback, no nesting
const SINGLE_VAR = /^var\((--st-[\w-]+)\)$/;

const tokens = {};

// Only parse the :root block — stop at the deprecated [data-theme="dark"] block
let inRootBlock = false;
let depth = 0;
let rootDone = false;

for (const line of css.split('\n')) {
  if (rootDone) break;

  if (!inRootBlock) {
    if (/^:root\s*\{/.test(line.trim())) { inRootBlock = true; depth = 1; }
    continue;
  }

  // Track brace depth to know when :root closes
  for (const ch of line) {
    if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth === 0) { rootDone = true; break; } }
  }
  if (rootDone) break;

  const m = line.match(TOKEN_LINE);
  if (!m) continue;

  const [, prop, rawRest] = m;
  // Strip trailing semicolon, then strip inline comment, then trim
  const rawValue = rawRest
    .replace(/;.*$/, '')          // remove ; and everything after (incl. comment)
    .replace(/\/\*.*?\*\//, '')   // remove any /* comment */ before ;
    .trim();
  const name = prop.slice(2); // strip leading '--'

  let value;
  let type;

  const varMatch = rawValue.match(SINGLE_VAR);
  if (varMatch) {
    // Convert var(--st-foo) → {st-foo} SD reference
    const refName = varMatch[1].slice(2); // strip '--'
    value = `{${refName}}`;
    type  = 'other'; // resolved at reference target
  } else if (/^#[0-9a-fA-F]{3,8}$/.test(rawValue)) {
    value = rawValue;
    type  = 'color';
  } else {
    // Literal: color-mix(), shadows, font stacks, numbers, etc.
    value = rawValue;
    type  = 'other';
  }

  tokens[name] = { $value: value, $type: type };
}

const count = Object.keys(tokens).length;
console.log(`Parsed ${count} tokens from tokens.css`);

mkdirSync(resolve(ROOT, 'tokens/source'), { recursive: true });
writeFileSync(OUT_PATH, JSON.stringify(tokens, null, 2) + '\n');
console.log(`Written to ${OUT_PATH}`);
