# @sugartown/mcp-server

Local stdio MCP server exposing Sugartown's governance docs, schema, tokens, and boundary
rules as callable tools. Read-only against the repo — makes zero writes to Sanity, zero git
operations, and imports nothing from `apps/*` or `packages/design-system`.

Full product spec: `docs/briefs/sugartown-mcp-prd.md`. Implementation epic: `docs/backlog/SUG-225-sugartown-mcp-server-v1.md`.

## Running

```bash
pnpm --filter @sugartown/mcp-server build
pnpm --filter @sugartown/mcp-server dev   # watch mode
pnpm --filter @sugartown/mcp-server start # run the built server
```

The server communicates over stdin/stdout. It is spawned by an MCP client (Claude Code), not
run standalone in normal use.

## Tools (v1)

| Tool | Input | Output |
|------|-------|--------|
| `sugartown_get_schema` | `docType: string` | Fields array with name, type, required, validation |
| `sugartown_get_tokens` | `tier?, name?` | Token array with name, value, tier, source |
| `sugartown_get_component` | `name: string` | Component path, story count, or `not_found` + suggestions |
| `sugartown_check_boundary` | `from: string, to: string` | `{ permitted, rule?, source }` |
| `sugartown_get_rule` | `ruleName: string` | `{ rule, status, instruction, source }` |
| `sugartown_validate_field` | `fieldName: string, schema?` | `{ valid, reason?, alternative? }` |
| `sugartown_get_epic` | `id?: string` | Epic markdown content |
| `sugartown_get_changelog` | `n?: number` (default 5) | Array of `{ version, date?, summary, body }` |

`sugartown_get_gate_status` is deferred to v2 — see the PRD's Out of Scope section.

## Tool Aliases (CLAUDE.md shorthand)

Full tool names are long by design — they are unambiguous MCP identifiers.
When working in Claude Code, CLAUDE.md maps shorter aliases so you never
type the full names directly.

| Alias           | Full tool name                  |
|-----------------|----------------------------------|
| getschema       | sugartown_get_schema            |
| gettokens       | sugartown_get_tokens            |
| getcomponent    | sugartown_get_component         |
| checkboundary   | sugartown_check_boundary        |
| getrule         | sugartown_get_rule              |
| validatefield   | sugartown_validate_field        |
| getepic         | sugartown_get_epic              |
| getchangelog    | sugartown_get_changelog         |

Aliases are defined in CLAUDE.md — that is the single source of truth.
Do not define aliases anywhere else.

## Architecture

```
src/
├── index.ts          # Server entry point, tool registration
├── tools/
│   ├── schema.ts     # sugartown_get_schema (ts-morph AST read)
│   ├── tokens.ts      # sugartown_get_tokens
│   ├── component.ts   # sugartown_get_component
│   ├── boundary.ts    # sugartown_check_boundary
│   ├── governance.ts  # sugartown_get_rule, sugartown_validate_field
│   ├── epic.ts         # sugartown_get_epic
│   └── changelog.ts    # sugartown_get_changelog
└── lib/
    ├── repo-root.ts    # __dirname-relative monorepo root resolution
    └── file-reader.ts  # shared file I/O
```

## Governance rule accuracy

`governance.ts` copies rule text from CLAUDE.md and sibling convention docs at authoring
time. It will drift silently if those docs change and `governance.ts` isn't updated in
lockstep — there is no automated sync. When editing a rule this file quotes, update
`governance.ts` in the same commit.

## Known non-goals (v1)

Write operations to Sanity, git operations, Storybook rendering, Netlify deploy
orchestration, and `sugartown_get_gate_status` are all out of scope — see the PRD's
Non-Goals and Out of Scope sections.
