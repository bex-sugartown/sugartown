# Sugartown MCP Server — Product Requirements Document

**PRD Version:** v1.0
**Status:** In implementation
**Author:** Bex Head
**Domain:** Mixed (Platform / Tooling / AI Workflow)
**Last updated:** 2026-07-13
**Related epics:** SUG-208 _(user-created in Linear; not independently verified via API — see epic doc header)_, `docs/backlog/SUG-208-sugartown-mcp-server-v1.md`
**Sits alongside:** `CLAUDE.md`, `epic-template.md`, `SUGARTOWN_DESIGN_SYSTEM_RULESET.md`

---

## 1. Problem Statement

Every Claude Code session for Sugartown starts from zero. The operating contract lives in `CLAUDE.md`. The design system rules live in `SUGARTOWN_DESIGN_SYSTEM_RULESET.md`. Schema definitions live in `apps/studio/schemas/`. Token declarations live in `packages/design-system/src/styles/tokens.css`. The epic template lives in `docs/epic-template.md`. None of these are callable — they are documents that must be manually pasted, summarised, or hoped-to-be-remembered.

The result: sessions drift. Boundary rules are recited from memory instead of enforced at query time. Schema field types are reconstructed rather than read. Token names are guessed. The "orient before acting" principle from `CLAUDE.md` is honoured in spirit but not mechanically enforced.

A Sugartown MCP server turns the governance documents and live repo state into callable tools — making Claude Code a Sugartown-aware collaborator rather than a generic coding assistant.

---

## 2. Goals and Non-Goals

### Goals

| Goal | Description |
|------|-------------|
| Live schema access | Claude Code can query any Sanity schema by document type without the file being pasted into context |
| Token lookup | Claude Code can retrieve the full token inventory for any tier (primitive, semantic, component) by name or category |
| Boundary enforcement | Claude Code can query whether a proposed import is permitted under the ESLint boundary rules before writing code |
| Component inventory | Claude Code can check whether a named component exists in `packages/design-system` and its current Storybook status |
| Governance rules as callable logic | Single Field Authority, Atomic Reuse Gate, `featuredImage` deprecation, and the web adapter rule are queryable facts, not documents |
| Epic and changelog context | Claude Code can retrieve the active epic content and the last N CHANGELOG entries at session start |
| Reduced session startup friction | A standard MCP-primed session requires zero document pasting; all operating context is callable on demand |

### Non-Goals

| Non-Goal | Why excluded |
|----------|--------------|
| Write operations to Sanity | The MCP is read-and-validate only. Mutations are Claude Code's job, not the MCP's. |
| Git operations | Commits, branches, and PRs are out of scope. The five-gate pipeline is a process, not an automation target here. |
| Storybook rendering | Component visual state is not callable via MCP; visual QA remains a human-gated deliverable per the visual QA principle. |
| Netlify deploy orchestration | Build and deploy triggers are handled by GitHub Actions; not in scope for v1. |
| Resume Factory or commerce adapter tools | Deferred to a v2 scope once the core repo tools are proven. |

---

## 3. User Stories

| ID | Title | User Story | Acceptance Criteria | Priority |
|----|-------|-----------|---------------------|----------|
| US-001 | Schema on demand | As Claude Code, I want to call `sugartown_get_schema("caseStudy")` so that I have the live field definitions without Bex pasting the file | Tool returns all fields, types, required flags, and validation rules for the requested doc type | P0 |
| US-002 | Token lookup | As Claude Code, I want to call `sugartown_get_tokens("semantic")` so that I use correct token names instead of guessing | Tool returns all tokens in the requested tier with their resolved values and source file paths | P0 |
| US-003 | Boundary check | As Claude Code, I want to call `sugartown_check_boundary("apps/web", "packages/design-system")` so that I confirm whether a proposed import is legal before writing it | Tool returns `permitted: true/false` with the rule source from `boundaries.js` | P0 |
| US-004 | Component existence check | As Claude Code, I want to call `sugartown_get_component("Button")` so that I know whether a component exists before creating a duplicate | Tool returns component path, props interface, and Storybook story count; or returns `not_found` with a `search_alternatives` suggestion | P1 |
| US-005 | Governance rule query | As Claude Code, I want to call `sugartown_get_rule("featuredImage")` so that I get the canonical deprecation statement rather than reconstructing it | Tool returns the rule name, status (`deprecated`/`active`/`enforced`), and the canonical instruction | P0 |
| US-006 | Active epic context | As Bex, I want to call `sugartown_get_epic()` at session start so that Claude Code has the current epic scope without me pasting it | Tool returns the content of the active epic from `docs/prompts/` (most recently modified EPIC-*.md file) | P1 |
| US-007 | Changelog access | As Bex, I want to call `sugartown_get_changelog(5)` so that Claude Code knows what shipped recently before proposing changes | Tool returns the last N release entries from `CHANGELOG.md` with version, date, and summary | P1 |
| US-008 | Validate field name | As Claude Code, I want to call `sugartown_validate_field("featuredImage", "caseStudy")` so that I catch Single Field Authority violations before committing | Tool returns `valid: false` with the canonical alternative field name when a violation is detected | P1 |
| US-009 | Release gate status | As Bex, I want to call `sugartown_get_gate_status()` so that I know which of the five release gates is currently open | Tool returns the current gate number, gate name, and blocking conditions if any | P2 |

---

## 4. Technical Architecture

### Server type

Local stdio MCP server. Not a remote HTTP server. Runs on the same machine as Claude Code, communicates over stdin/stdout. No authentication surface, no network exposure.

### Language and runtime

TypeScript, Node.js >= 20. Uses the official `@modelcontextprotocol/sdk` package. Compiled to `dist/` and invoked via `node dist/index.js`. Lives at `packages/mcp-server/` in the monorepo.

### Monorepo placement

```
sugartown/
└── packages/
    └── mcp-server/
        ├── package.json
        ├── tsconfig.json
        └── src/
            ├── index.ts          # Server entry point
            ├── tools/
            │   ├── schema.ts     # sugartown_get_schema
            │   ├── tokens.ts     # sugartown_get_tokens
            │   ├── component.ts  # sugartown_get_component
            │   ├── boundary.ts   # sugartown_check_boundary
            │   ├── governance.ts # sugartown_get_rule, sugartown_validate_field
            │   ├── epic.ts       # sugartown_get_epic
            │   └── changelog.ts  # sugartown_get_changelog
            └── lib/
                ├── repo-root.ts  # Resolves monorepo root path
                └── file-reader.ts # Shared file I/O utilities
```

### Architectural boundary

`packages/mcp-server` is read-only against the repo. It imports nothing from `apps/*`. It imports no Sanity client libraries — it reads schema files as TypeScript AST or raw text, not via the Sanity API. This keeps it CMS-agnostic and avoids credential dependencies.

The one exception: if Sanity schema files use TypeScript `defineType` and `defineField`, the reader must handle TypeScript parsing. A static file parser (ts-morph or a simple regex-over-AST approach) is sufficient for v1. No Sanity client, no `@sanity/client` dependency.

### Tool inventory (v1)

| Tool name | Input | Output | Read-only |
|-----------|-------|--------|-----------|
| `sugartown_get_schema` | `docType: string` | Fields array with name, type, required, validation | Yes |
| `sugartown_get_tokens` | `tier?: "primitive" \| "semantic" \| "component"` | Token array with name, value, source | Yes |
| `sugartown_get_component` | `name: string` | Component path, props, story count, or `not_found` | Yes |
| `sugartown_check_boundary` | `from: string, to: string` | `{ permitted: boolean, rule: string, source: string }` | Yes |
| `sugartown_get_rule` | `ruleName: string` | `{ rule: string, status: string, instruction: string }` | Yes |
| `sugartown_validate_field` | `fieldName: string, schema?: string` | `{ valid: boolean, reason?: string, alternative?: string }` | Yes |
| `sugartown_get_epic` | `id?: string` | Epic markdown content as string | Yes |
| `sugartown_get_changelog` | `n?: number` (default 5) | Array of release entries | Yes |
| `sugartown_get_gate_status` | none | `{ gate: number, name: string, blocking?: string[] }` | Yes |

### Governance rules as data

The following rules are encoded as static data in `governance.ts`, not derived dynamically. They come directly from `CLAUDE.md` and the design system ruleset:

- `featuredImage`: deprecated, never use in new work, use `hero.media[0]` or `sections[]`
- `web-adapter-rule`: `apps/web` does not import directly from `packages/design-system`
- `single-field-authority`: no competing label/field across sibling schemas
- `atomic-reuse-gate`: components validated in Storybook before page template use
- `orient-before-acting`: Claude Code must read and report findings before making changes
- `four-slug-queries`: all four slug queries must be updated together when slugs change

### Registration in `CLAUDE.md`

After implementation, `CLAUDE.md` is updated to include a section at the top:

```
## MCP Server
This project runs a local MCP server at packages/mcp-server.
Start it with: pnpm --filter @sugartown/mcp-server dev
Tools available: sugartown_get_schema, sugartown_get_tokens, sugartown_get_component,
sugartown_check_boundary, sugartown_get_rule, sugartown_validate_field,
sugartown_get_epic, sugartown_get_changelog, sugartown_get_gate_status
Orient-before-acting: call sugartown_get_epic() and sugartown_get_changelog(3) at session start.

## MCP Tool Aliases
When Bex uses a shorthand, map it to the full tool name:
  getschema      → sugartown_get_schema
  gettokens      → sugartown_get_tokens
  getcomponent   → sugartown_get_component
  checkboundary  → sugartown_check_boundary
  getrule        → sugartown_get_rule
  validatefield  → sugartown_validate_field
  getepic        → sugartown_get_epic
  getchangelog   → sugartown_get_changelog
  getgates       → sugartown_get_gate_status
```

### Registration in `packages/mcp-server/README.md`

The README documents the same aliases as a reference table for human readers:

```
## Tool Aliases (CLAUDE.md shorthand)
Full tool names are long by design — they are unambiguous MCP identifiers.
When working in Claude Code, CLAUDE.md maps shorter aliases so you never
type the full names directly.

| Alias           | Full tool name                  |
|-----------------|---------------------------------|
| getschema       | sugartown_get_schema            |
| gettokens       | sugartown_get_tokens            |
| getcomponent    | sugartown_get_component         |
| checkboundary   | sugartown_check_boundary        |
| getrule         | sugartown_get_rule              |
| validatefield   | sugartown_validate_field        |
| getepic         | sugartown_get_epic              |
| getchangelog    | sugartown_get_changelog         |
| getgates        | sugartown_get_gate_status       |

Aliases are defined in CLAUDE.md — that is the single source of truth.
Do not define aliases anywhere else.
```

---

## 5. Design Constraints

This is a tooling package, not a UI surface. Standard Pink Moon design constraints do not apply. The following constraints do apply:

- `packages/mcp-server` cannot import from `apps/*`. ESLint boundary rule applies.
- `packages/mcp-server` cannot import from `packages/design-system`. The MCP reads the design system as data; it does not consume it as a dependency.
- Zero Sanity API calls in v1. File-system reads only.
- All tools are annotated with `readOnlyHint: true` and `destructiveHint: false`.
- Error messages are actionable. "Schema not found" must include a list of valid doc types. "Component not found" must suggest `sugartown_get_component` with a partial name.

---

## 6. Open Decisions — RESOLVED (see epic doc `docs/backlog/SUG-208-sugartown-mcp-server-v1.md` §Open Decisions Resolved)

| Decision | Options | Owner | Resolution |
|----------|---------|-------|------------------|
| How to parse TypeScript schema files | ts-morph (full AST), regex-over-exports, or a build step that pre-compiles schemas to JSON | Bex + Claude Code | **ts-morph** — regex is the exact brittleness risk flagged in §7; a JSON pre-compile step adds staleness risk for no benefit |
| Gate status source of truth | Flat file in `docs/`, CHANGELOG convention, or Linear issue state | Bex | **No resolution needed** — tool is cut from v1 scope per §9, decision only becomes live if v2 picks it back up |
| MCP server startup: manual or pnpm script | Manual `node dist/index.js` vs a `predev` hook in the workspace root | Bex | **Workspace-scoped pnpm script** (`pnpm --filter @sugartown/mcp-server dev`, already shown in §4), not a `predev` hook — MCP servers are spawned by the MCP client, not the app's dev pipeline |
| Whether to publish `@sugartown/mcp-server` externally | Keep internal-only for now; publish to npm later as a reference implementation | Bex | **Internal-only for v1** — confirmed, not re-opened |

---

## 7. Dependencies and Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| TypeScript schema parsing is brittle if file structure varies | High: tool returns incorrect or incomplete field data | Standardise schema file shape first; add a `validate:schemas` script that confirms consistent export pattern before MCP reads them |
| MCP server path resolution breaks on different machines | Med: tools fail silently on non-Bex machines | Use `__dirname`-relative resolution anchored to `packages/mcp-server/`; document in README |
| Governance rules in `governance.ts` drift from `CLAUDE.md` | High: MCP returns stale rules | `CLAUDE.md` is the source of truth; add a note to the `CLAUDE.md` update checklist: "sync governance.ts if rules change" |
| Tool schema changes break Claude Code sessions mid-epic | Med: parameter mismatch errors | SemVer the MCP package; breaking tool changes bump minor version with a CHANGELOG entry |
| `sugartown_get_gate_status` has no reliable data source | Low: tool returns `unknown` | Ship without this tool in v1; add in v2 once gate tracking is formalised |

---

## 8. Success Criteria

| Area | Metric |
|------|--------|
| Session startup | A fresh Claude Code session reaches operating context (schema + active epic + recent changelog) in under 3 tool calls, with no document pasting |
| Schema accuracy | `sugartown_get_schema("node")` returns all fields matching the live `apps/studio/schemas/node.ts` file; zero discrepancies on manual spot-check |
| Boundary enforcement | `sugartown_check_boundary("apps/web", "packages/design-system")` returns `permitted: false` with the correct rule reference |
| Governance rules | `sugartown_get_rule("featuredImage")` returns the deprecation instruction verbatim from `CLAUDE.md` |
| Build | `pnpm --filter @sugartown/mcp-server build` passes with zero TypeScript errors |
| Boundary compliance | `packages/mcp-server` passes `pnpm lint` with zero boundary violations |
| MCP Inspector | All nine v1 tools pass MCP Inspector validation with correct input/output schemas |

---

## 9. Out of Scope (Deferred)

- **Write tools** (Sanity mutations, file creation, git operations): v2 consideration only, after v1 tools are proven.
- **`sugartown_get_gate_status`**: deferred until gate tracking has a machine-readable source of truth.
- **Resume Factory tools**: separate MCP scope, separate epic.
- **Commerce adapter tools**: deferred alongside the commerce adapter itself.
- **External publication of `@sugartown/mcp-server`**: v2 decision pending v1 stability.
- **Claude.ai project integration**: this PRD scopes local stdio for Claude Code only; remote HTTP transport for Claude.ai projects is a separate decision.

---

## 10. Authoring Checklist

- [x] Every claim references a real system, not an aspiration
- [x] Tool input/output schemas are explicit — no TBD on types
- [x] Non-goals name the reason for exclusion, not just the exclusion
- [x] Open decisions have owners
- [x] Success criteria are independently verifiable
- [x] `featuredImage` appears only as a governance rule subject — not as an active field
- [x] Brand voice check: no em dashes, no adjective triads, no future-tense promises
- [x] A senior engineer could start writing the implementation epic from this doc without a meeting
