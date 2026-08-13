/**
 * validate.js — the schema engine for governance source records.
 *
 * Two passes:
 *   1. Field validation — types, enums, patterns, conditional requirements
 *   2. Referential integrity — closed-world cross-record resolution
 *
 * Every error names the entity, the record ID, and the field. PRD §10 requires
 * failures to be traceable to a record without reading the engine, and the
 * Phase 1 acceptance criterion is specifically "rejects a record with a bad
 * enum value, naming the field".
 *
 * Closed-world is the load-bearing property (PRD §5.2, US-004): a value that
 * matches no recognized form is an error, never a skipped string. `ctl-021` is
 * a rejection, not an ignored typo.
 */

import { existsSync, statSync, realpathSync } from 'node:fs'
import { resolve, relative, isAbsolute } from 'node:path'

import { ENTITIES } from './entities.js'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/** Structured finding. `field` is null only for whole-record problems. */
function err(entity, id, field, message) {
  return { entity, id, field, message }
}

function isBlank(value) {
  return typeof value !== 'string' || value.trim() === ''
}

function resolveRequired(spec, record) {
  return typeof spec.required === 'function' ? spec.required(record) : spec.required === true
}

/**
 * Validate one field against its spec. Returns an array of findings.
 * `referenceDate` makes notFuture deterministic — the caller supplies it, the
 * engine never reads a clock (PRD §3, determinism).
 */
function validateField(entity, id, name, spec, record, referenceDate) {
  const present = Object.prototype.hasOwnProperty.call(record, name)
  const value = record[name]
  const findings = []

  if (spec.forbidden && spec.forbidden(record)) {
    if (present) {
      findings.push(err(entity, id, name, `must be absent on this record (status: ${record.status})`))
    }
    return findings
  }

  if (!present || value === undefined) {
    if (resolveRequired(spec, record)) {
      findings.push(err(entity, id, name, 'is required but missing'))
    }
    return findings
  }

  if (value === null) {
    if (!spec.nullable) {
      findings.push(err(entity, id, name, 'must not be null'))
    }
    return findings
  }

  switch (spec.type) {
    case 'string':
      if (typeof value !== 'string') {
        findings.push(err(entity, id, name, `must be a string, got ${typeof value}`))
        return findings
      }
      if (spec.nonEmpty && isBlank(value)) {
        findings.push(err(entity, id, name, 'must not be empty'))
      }
      if (spec.pattern && !spec.pattern.test(value)) {
        findings.push(err(entity, id, name, `"${value}" does not match ${spec.pattern}`))
      }
      if (spec.enum && !spec.enum.includes(value)) {
        findings.push(
          err(entity, id, name, `"${value}" is not a valid value — expected one of: ${spec.enum.join(', ')}`)
        )
      }
      break

    case 'integer':
      if (!Number.isInteger(value)) {
        findings.push(err(entity, id, name, `must be an integer, got ${JSON.stringify(value)}`))
        return findings
      }
      if (spec.min !== undefined && value < spec.min) {
        findings.push(err(entity, id, name, `must be >= ${spec.min}, got ${value}`))
      }
      if (spec.max !== undefined && value > spec.max) {
        findings.push(err(entity, id, name, `must be <= ${spec.max}, got ${value}`))
      }
      break

    case 'date':
      if (typeof value !== 'string' || !ISO_DATE.test(value)) {
        findings.push(err(entity, id, name, `must be an ISO date (YYYY-MM-DD), got ${JSON.stringify(value)}`))
        return findings
      }
      // Date.parse accepts 2026-02-30 and rolls it forward, so round-tripping
      // is the only way to reject a date that looks well-formed and is not real.
      if (new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) !== value) {
        findings.push(err(entity, id, name, `"${value}" is not a real calendar date`))
        return findings
      }
      if (spec.notFuture && referenceDate) {
        if (!ISO_DATE.test(referenceDate)) {
          // Refuse to compare against a malformed reference. A raw string
          // comparison against e.g. "garbage" silently passes every date while
          // the banner reports the check as configured — the same silent-pass
          // class this pipeline exists to kill, through a second door.
          findings.push(
            err(entity, id, name, `cannot be range-checked: reference date "${referenceDate}" is not an ISO date`)
          )
        } else if (value > referenceDate) {
          findings.push(err(entity, id, name, `"${value}" is in the future (reference date ${referenceDate})`))
        }
      }
      break

    case 'array':
      if (!Array.isArray(value)) {
        findings.push(err(entity, id, name, `must be an array, got ${typeof value}`))
        return findings
      }
      if (spec.minItems !== undefined && value.length < spec.minItems) {
        findings.push(err(entity, id, name, `must have at least ${spec.minItems} entr(y|ies), got ${value.length}`))
      }
      if (spec.itemEnum) {
        value.forEach((item, i) => {
          if (!spec.itemEnum.includes(item)) {
            findings.push(
              err(entity, id, `${name}[${i}]`, `"${item}" is not valid — expected one of: ${spec.itemEnum.join(', ')}`)
            )
          }
        })
      }
      break

    default:
      findings.push(err(entity, id, name, `schema bug: unknown field type "${spec.type}"`))
  }

  return findings
}

/** Unknown keys are errors, not extras — closed-world applies to shape too. */
function validateNoUnknownFields(entity, id, spec, record) {
  const known = new Set(Object.keys(spec.fields))
  return Object.keys(record)
    .filter((k) => !known.has(k))
    .map((k) => err(entity, id, k, 'is not a recognized field for this entity'))
}

/**
 * An `artifact:` entry must name a tracked file inside the repo. `existsSync`
 * alone treats "resolves on this machine" as "is a repo artifact", which lets
 * through absolute paths, traversal that escapes the repo, and directories.
 *
 * The case check is the one that bites hardest in practice: macOS is
 * case-insensitive and Linux CI is not, so `DOCS/...` passes pre-commit locally
 * and fails in CI on identical bytes.
 */
function validateArtifactPath(recordId, field, path, root) {
  const findings = []
  const f = (msg) => err('component', recordId, field, msg)

  if (path.trim() === '') return [f('is an empty artifact: path')]
  if (isAbsolute(path)) return [f(`"${path}" must be repo-relative, not absolute`)]

  const abs = resolve(root, path)
  const rel = relative(root, abs)
  if (rel.startsWith('..')) return [f(`"${path}" resolves outside the repository`)]

  if (!existsSync(abs)) return [f(`names artifact path "${path}", which does not exist on disk`)]
  if (!statSync(abs).isFile()) return [f(`"${path}" is a directory — name a file`)]

  // Canonical form. `resolve()` preserves whatever casing the caller wrote, so
  // comparing against it would compare the input to itself; realpathSync.native
  // returns the real on-disk spelling. This matters because macOS is
  // case-insensitive and Linux CI is not: without it, `DOCS/...` passes
  // pre-commit locally and fails CI on identical bytes.
  let canonical = rel
  try {
    canonical = relative(root, realpathSync.native(abs))
  } catch {
    // Unreadable path — existence already passed, so leave canonical as-is.
  }

  if (canonical !== path.replace(/^\.\//, '')) {
    findings.push(f(`"${path}" is not the canonical repo-relative path — write it as "${canonical}"`))
  }

  return findings
}

/**
 * `component.enforcedBy` is the closed-world case that carries the most weight:
 * it is the machine-readable form of the mapping SUG-256 had to research by
 * hand. Every entry is either a CTL id resolving to an ACTIVE control, or an
 * `artifact:` path that exists on disk. Nothing else passes.
 */
function validateEnforcedBy(record, controlsById, root) {
  const findings = []
  const entries = Array.isArray(record.enforcedBy) ? record.enforcedBy : []

  entries.forEach((entry, i) => {
    const field = `enforcedBy[${i}]`

    if (typeof entry !== 'string') {
      findings.push(err('component', record.id, field, `must be a string, got ${typeof entry}`))
      return
    }

    if (/^CTL-\d{3}$/.test(entry)) {
      const target = controlsById.get(entry)
      if (!target) {
        findings.push(err('component', record.id, field, `cites ${entry}, which does not exist`))
      } else if (target.status !== 'active') {
        findings.push(
          err('component', record.id, field, `cites ${entry}, which is ${target.status} — only active controls may be cited`)
        )
      }
      return
    }

    if (entry.startsWith('artifact:')) {
      findings.push(...validateArtifactPath(record.id, field, entry.slice('artifact:'.length), root))
      return
    }

    // Closed world. This is the branch that makes `ctl-021` a build failure.
    findings.push(
      err(
        'component',
        record.id,
        field,
        `"${entry}" matches no recognized form — expected a CTL-NNN id or an "artifact:<path>" entry`
      )
    )
  })

  return findings
}

/**
 * @param {Record<string, object[]>} source  entity name -> records
 * @param {{ root: string, referenceDate: string }} opts
 * @returns {{ errors: object[], counts: Record<string, number> }}
 */
export function validateSource(source, { root, referenceDate }) {
  const errors = []
  const counts = {}

  // Pass 1 — per-record field validation.
  for (const [entityName, spec] of Object.entries(ENTITIES)) {
    const records = source[entityName] ?? []
    counts[entityName] = records.length

    const seen = new Map()

    records.forEach((record, index) => {
      const id = record?.[spec.idField] ?? `<index ${index}>`

      if (record === null || typeof record !== 'object' || Array.isArray(record)) {
        errors.push(err(entityName, id, null, 'must be an object'))
        return
      }

      for (const [fieldName, fieldSpec] of Object.entries(spec.fields)) {
        errors.push(...validateField(entityName, id, fieldName, fieldSpec, record, referenceDate))
      }

      errors.push(...validateNoUnknownFields(entityName, id, spec, record))

      // Uniqueness, on whichever field the entity declares unique.
      for (const [fieldName, fieldSpec] of Object.entries(spec.fields)) {
        if (!fieldSpec.unique) continue
        const value = record[fieldName]
        if (value === undefined || value === null) continue
        const key = `${fieldName}:${value}`
        if (seen.has(key)) {
          errors.push(err(entityName, id, fieldName, `duplicate value "${value}" (first seen at index ${seen.get(key)})`))
        } else {
          seen.set(key, index)
        }
      }
    })
  }

  // Pass 2 — referential integrity, closed-world.
  const controlsById = new Map((source.control ?? []).map((c) => [c.id, c]))

  // Index every entity by its declared id field, so `ref` resolves generically.
  const byEntity = {}
  for (const [entityName, spec] of Object.entries(ENTITIES)) {
    byEntity[entityName] = new Map((source[entityName] ?? []).map((r) => [r[spec.idField], r]))
  }

  // Driven by the `ref` key on the field spec rather than hand-coded per field.
  // A declared ref that nothing resolved would be exactly the inert control this
  // pipeline exists to eliminate.
  for (const [entityName, spec] of Object.entries(ENTITIES)) {
    for (const record of source[entityName] ?? []) {
      for (const [fieldName, fieldSpec] of Object.entries(spec.fields)) {
        if (!fieldSpec.ref) continue
        const value = record[fieldName]
        if (value === undefined || value === null) continue

        const targetIndex = byEntity[fieldSpec.ref]
        if (!targetIndex) {
          errors.push(err(entityName, record[spec.idField], fieldName, `schema bug: unknown ref entity "${fieldSpec.ref}"`))
          continue
        }

        const target = targetIndex.get(value)
        if (!target) {
          errors.push(
            err(entityName, record[spec.idField], fieldName, `cites ${fieldSpec.ref} "${value}", which does not exist`)
          )
        } else if (fieldSpec.refDenyStatus?.includes(target.status)) {
          errors.push(
            err(
              entityName,
              record[spec.idField],
              fieldName,
              `cites ${value}, which is ${target.status} — a ${target.status} record cannot be cited here`
            )
          )
        }
      }
    }
  }

  for (const component of source.component ?? []) {
    errors.push(...validateEnforcedBy(component, controlsById, root))
  }

  // Retirement protection (US-004): retiring a cited control must fail loudly
  // rather than leave a component pointing at a dead reference.
  const citers = new Map()
  for (const component of source.component ?? []) {
    for (const entry of component.enforcedBy ?? []) {
      if (typeof entry !== 'string' || !/^CTL-\d{3}$/.test(entry)) continue
      if (!citers.has(entry)) citers.set(entry, [])
      citers.get(entry).push(component.id)
    }
  }
  for (const [ctlId, citedBy] of citers) {
    const target = controlsById.get(ctlId)
    if (target && target.status === 'retired') {
      errors.push(
        err('control', ctlId, 'status', `is retired but still cited by: ${citedBy.join(', ')}`)
      )
    }
  }

  return { errors, counts }
}

/** Human-readable rendering. One line per finding, record and field named. */
export function formatErrors(errors) {
  return errors
    .map((e) => {
      const where = e.field ? `${e.id}.${e.field}` : e.id
      return `   ✗  ${e.entity} ${where} — ${e.message}`
    })
    .join('\n')
}
