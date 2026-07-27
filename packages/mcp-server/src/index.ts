#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'

import { checkBoundary, checkBoundaryInputSchema } from './tools/boundary.js'
import { getChangelog, getChangelogInputSchema } from './tools/changelog.js'
import { getComponent, getComponentInputSchema } from './tools/component.js'
import { getEpic, getEpicInputSchema } from './tools/epic.js'
import { getRule, getRuleInputSchema, validateField, validateFieldInputSchema } from './tools/governance.js'
import { getSchema, getSchemaInputSchema, listDocTypes } from './tools/schema.js'
import { getTokens, getTokensInputSchema } from './tools/tokens.js'

const READ_ONLY = { readOnlyHint: true, destructiveHint: false } as const

const server = new McpServer({ name: 'sugartown-mcp-server', version: '0.1.0' })

function ok(data: unknown): CallToolResult {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
}

function err(error: unknown): CallToolResult {
  const message = error instanceof Error ? error.message : String(error)
  return { content: [{ type: 'text', text: message }], isError: true }
}

server.registerTool(
  'sugartown_get_schema',
  {
    title: 'Get Sanity schema',
    description: 'Returns the live field/type/validation data for a Sanity document type, read from apps/studio/schemas/documents/*.ts via AST parsing.',
    inputSchema: getSchemaInputSchema,
    annotations: READ_ONLY,
  },
  async ({ docType }) => {
    try {
      return ok(getSchema(docType))
    } catch (e) {
      return err(e)
    }
  }
)

server.registerTool(
  'sugartown_get_tokens',
  {
    title: 'Get design tokens',
    description: 'Returns design tokens from tokens.css (optionally filtered by tier or name substring), with resolved values and mirror-drift detection between the web and DS-package copies.',
    inputSchema: getTokensInputSchema,
    annotations: READ_ONLY,
  },
  async (input) => {
    try {
      return ok(getTokens(input))
    } catch (e) {
      return err(e)
    }
  }
)

server.registerTool(
  'sugartown_get_component',
  {
    title: 'Get design system component',
    description: 'Checks whether a named component exists in packages/design-system, returning its path and Storybook story count, or not_found with nearest-name suggestions.',
    inputSchema: getComponentInputSchema,
    annotations: READ_ONLY,
  },
  async ({ name }) => {
    try {
      return ok(getComponent(name))
    } catch (e) {
      return err(e)
    }
  }
)

server.registerTool(
  'sugartown_check_boundary',
  {
    title: 'Check architectural import boundary',
    description: 'Checks whether an import from one repo-relative path to another is permitted under packages/eslint-config/boundaries.js.',
    inputSchema: checkBoundaryInputSchema,
    annotations: READ_ONLY,
  },
  async ({ from, to }) => {
    try {
      return ok(checkBoundary(from, to))
    } catch (e) {
      return err(e)
    }
  }
)

server.registerTool(
  'sugartown_get_rule',
  {
    title: 'Get governance rule',
    description: 'Returns the canonical status and instruction text for a named Sugartown governance rule.',
    inputSchema: getRuleInputSchema,
    annotations: READ_ONLY,
  },
  async ({ ruleName }) => {
    try {
      return ok(getRule(ruleName))
    } catch (e) {
      return err(e)
    }
  }
)

server.registerTool(
  'sugartown_validate_field',
  {
    title: 'Validate field name',
    description: 'Checks a proposed Sanity field name against known Single Field Authority violations (e.g. deprecated/superseded fields).',
    inputSchema: validateFieldInputSchema,
    annotations: READ_ONLY,
  },
  async ({ fieldName, schema }) => {
    try {
      return ok(validateField(fieldName, schema))
    } catch (e) {
      return err(e)
    }
  }
)

server.registerTool(
  'sugartown_get_epic',
  {
    title: 'Get active epic',
    description: 'Returns the content of an epic from docs/backlog/ by ID, or the most recently modified epic if no ID is given.',
    inputSchema: getEpicInputSchema,
    annotations: READ_ONLY,
  },
  async ({ id }) => {
    try {
      return ok(getEpic(id))
    } catch (e) {
      return err(e)
    }
  }
)

server.registerTool(
  'sugartown_get_changelog',
  {
    title: 'Get changelog entries',
    description: 'Returns the last N CHANGELOG.md entries, counting [Unreleased] as the first entry when it has content.',
    inputSchema: getChangelogInputSchema,
    annotations: READ_ONLY,
  },
  async ({ n }) => {
    try {
      return ok(getChangelog(n))
    } catch (e) {
      return err(e)
    }
  }
)

async function main() {
  // Fail fast and loud if the schema source directory can't be found — every other
  // tool depends on the same repo-root resolution succeeding.
  listDocTypes()

  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('sugartown-mcp-server running on stdio')
}

main().catch((error) => {
  console.error('sugartown-mcp-server failed to start:', error)
  process.exit(1)
})
