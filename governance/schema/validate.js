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

import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

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
      if (Number.isNaN(Date.parse(value))) {
        findings.push(err(entity, id, name, `"${value}" is not a real calendar date`))
        return findings
      }
      if (spec.notFuture && referenceDate && value > referenceDate) {
        findings.push(err(entity, id, name, `"${value}" is in the future (reference date ${referenceDate})`))
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
      const path = entry.slice('artifact:'.length)
      if (path.trim() === '') {
        findings.push(err('component', record.id, field, 'is an empty artifact: path'))
      } else if (!existsSync(resolve(root, path))) {
        findings.push(err('component', record.id, field, `names artifact path "${path}", which does not exist on disk`))
      }
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
  const probesById = new Map((source.probe ?? []).map((p) => [p.id, p]))

  for (const control of source.control ?? []) {
    if (control.probeId === undefined || control.probeId === null) continue
    if (!probesById.has(control.probeId)) {
      errors.push(err('control', control.id, 'probeId', `cites probe "${control.probeId}", which does not exist`))
    }
  }

  for (const claim of source.claim ?? []) {
    if (claim.controlId === undefined) continue
    const target = controlsById.get(claim.controlId)
    if (!target) {
      errors.push(err('claim', claim.id, 'controlId', `cites ${claim.controlId}, which does not exist`))
    } else if (target.status === 'reserved') {
      errors.push(err('claim', claim.id, 'controlId', `cites ${claim.controlId}, which is a reserved ID, not a control`))
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
