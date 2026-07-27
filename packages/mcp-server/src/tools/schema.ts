import { Node, Project, type ObjectLiteralExpression } from 'ts-morph'
import { z } from 'zod'
import { listRepoDir, repoFileExists } from '../lib/file-reader.js'
import { repoPath } from '../lib/repo-root.js'

const SCHEMA_DIR = ['apps', 'studio', 'schemas', 'documents']

export const getSchemaInputSchema = {
  docType: z.string().describe('Sanity document type name, e.g. "caseStudy" or "article"'),
}

export interface ValidationCall {
  method: string
  args: string[]
}

export interface SchemaField {
  name: string
  title?: string
  type: string
  description?: string
  group?: string
  hidden?: string
  deprecatedReason?: string
  required: boolean
  hasCustomValidation: boolean
  validation: ValidationCall[]
  arrayOf?: string[]
  fields?: SchemaField[]
  unparsed?: boolean
}

export interface SchemaResult {
  docType: string
  title?: string
  type: string
  fields: SchemaField[]
}

export function listDocTypes(): string[] {
  return listRepoDir(...SCHEMA_DIR)
    .filter((e) => !e.isDirectory && e.name.endsWith('.ts'))
    .map((e) => e.name.replace(/\.ts$/, ''))
    .sort()
}

function getStringProp(obj: ObjectLiteralExpression, name: string): string | undefined {
  const prop = obj.getProperty(name)
  if (!prop || !Node.isPropertyAssignment(prop)) return undefined
  const init = prop.getInitializer()
  if (!init) return undefined
  if (Node.isStringLiteral(init) || Node.isNoSubstitutionTemplateLiteral(init)) {
    return init.getLiteralText()
  }
  return init.getText()
}

function getObjectProp(obj: ObjectLiteralExpression, name: string): ObjectLiteralExpression | undefined {
  const prop = obj.getProperty(name)
  if (!prop || !Node.isPropertyAssignment(prop)) return undefined
  const init = prop.getInitializer()
  if (init && Node.isObjectLiteralExpression(init)) return init
  return undefined
}

/** Walks a `(Rule) => Rule.required().max(60).error('...')`-shaped validation chain. */
function parseValidationChain(obj: ObjectLiteralExpression): { calls: ValidationCall[]; hasCustom: boolean } {
  const prop = obj.getProperty('validation')
  if (!prop || !Node.isPropertyAssignment(prop)) return { calls: [], hasCustom: false }
  const init = prop.getInitializer()
  if (!init || !Node.isArrowFunction(init)) return { calls: [], hasCustom: false }

  const body = init.getBody()
  const calls: ValidationCall[] = []
  let hasCustom = false

  let current: Node | undefined = Node.isCallExpression(body)
    ? body
    : body.getFirstDescendant((d) => Node.isCallExpression(d))

  const chain: Node[] = []
  while (current && Node.isCallExpression(current)) {
    chain.unshift(current)
    const callee = current.getExpression()
    if (Node.isPropertyAccessExpression(callee)) {
      current = callee.getExpression()
    } else {
      current = undefined
    }
  }

  for (const call of chain) {
    if (!Node.isCallExpression(call)) continue
    const callee = call.getExpression()
    const method = Node.isPropertyAccessExpression(callee) ? callee.getName() : callee.getText()
    if (method === 'custom') hasCustom = true
    const args = call.getArguments().map((a) => {
      if (Node.isStringLiteral(a) || Node.isNoSubstitutionTemplateLiteral(a)) return a.getLiteralText()
      if (Node.isNumericLiteral(a)) return a.getText()
      return '<expr>'
    })
    calls.push({ method, args })
  }

  return { calls, hasCustom }
}

function parseArrayOf(obj: ObjectLiteralExpression): string[] | undefined {
  const prop = obj.getProperty('of')
  if (!prop || !Node.isPropertyAssignment(prop)) return undefined
  const init = prop.getInitializer()
  if (!init || !Node.isArrayLiteralExpression(init)) return undefined

  const types: string[] = []
  for (const el of init.getElements()) {
    if (Node.isCallExpression(el)) {
      const arg = el.getArguments()[0]
      if (arg && Node.isObjectLiteralExpression(arg)) {
        const t = getStringProp(arg, 'type')
        if (t) types.push(t)
      }
    }
  }
  return types.length > 0 ? types : undefined
}

function parseFieldObject(obj: ObjectLiteralExpression): SchemaField {
  const name = getStringProp(obj, 'name') ?? '<unnamed>'
  const type = getStringProp(obj, 'type') ?? '<unknown>'
  const { calls, hasCustom } = parseValidationChain(obj)
  const deprecatedObj = getObjectProp(obj, 'deprecated')

  const field: SchemaField = {
    name,
    title: getStringProp(obj, 'title'),
    type,
    description: getStringProp(obj, 'description'),
    group: getStringProp(obj, 'group'),
    hidden: getStringProp(obj, 'hidden'),
    deprecatedReason: deprecatedObj ? getStringProp(deprecatedObj, 'reason') : undefined,
    required: calls.some((c) => c.method === 'required'),
    hasCustomValidation: hasCustom,
    validation: calls,
  }

  const arrayOf = parseArrayOf(obj)
  if (arrayOf) field.arrayOf = arrayOf

  const nestedFields = getArrayProp(obj, 'fields')
  if (nestedFields) {
    field.fields = nestedFields
      .map((el) => (Node.isCallExpression(el) ? el.getArguments()[0] : undefined))
      .filter((arg): arg is ObjectLiteralExpression => !!arg && Node.isObjectLiteralExpression(arg))
      .map(parseFieldObject)
  }

  return field
}

function getArrayProp(obj: ObjectLiteralExpression, name: string) {
  const prop = obj.getProperty(name)
  if (!prop || !Node.isPropertyAssignment(prop)) return undefined
  const init = prop.getInitializer()
  if (!init || !Node.isArrayLiteralExpression(init)) return undefined
  return init.getElements()
}

export class DocTypeNotFoundError extends Error {
  constructor(public readonly docType: string, public readonly validDocTypes: string[]) {
    super(`Unknown doc type "${docType}". Valid doc types: ${validDocTypes.join(', ')}`)
  }
}

export function getSchema(docType: string): SchemaResult {
  const fileSegments = [...SCHEMA_DIR, `${docType}.ts`]
  if (!repoFileExists(...fileSegments)) {
    throw new DocTypeNotFoundError(docType, listDocTypes())
  }

  const project = new Project({ useInMemoryFileSystem: false, skipAddingFilesFromTsConfig: true })
  const sourceFile = project.addSourceFileAtPath(repoPath(...fileSegments))

  const exportAssignment = sourceFile.getExportAssignments().find((ea) => !ea.isExportEquals())
  if (!exportAssignment) {
    throw new Error(
      `Cannot parse ${docType}.ts: no "export default" found. This file may use a non-standard export shape not yet supported by sugartown_get_schema.`
    )
  }

  let expr = exportAssignment.getExpression()
  if (Node.isAsExpression(expr) || Node.isParenthesizedExpression(expr)) {
    expr = expr.getExpression()
  }

  if (!Node.isCallExpression(expr)) {
    throw new Error(
      `Cannot parse ${docType}.ts: default export is not a direct defineType(...) call (found "${expr.getKindName()}"). Non-standard export shapes (e.g. a factory function wrapping defineType) are not yet supported — see SUG-225 risk note.`
    )
  }

  const arg = expr.getArguments()[0]
  if (!arg || !Node.isObjectLiteralExpression(arg)) {
    throw new Error(`Cannot parse ${docType}.ts: defineType(...) call has no object literal argument.`)
  }

  const fieldsElements = getArrayProp(arg, 'fields') ?? []
  const fields = fieldsElements.map((el) => {
    if (Node.isCallExpression(el)) {
      const fieldArg = el.getArguments()[0]
      if (fieldArg && Node.isObjectLiteralExpression(fieldArg)) {
        return parseFieldObject(fieldArg)
      }
    }
    return {
      name: '<unparsed>',
      type: '<unparsed>',
      required: false,
      hasCustomValidation: false,
      validation: [],
      unparsed: true,
    } satisfies SchemaField
  })

  return {
    docType,
    title: getStringProp(arg, 'title'),
    type: getStringProp(arg, 'type') ?? 'document',
    fields,
  }
}
