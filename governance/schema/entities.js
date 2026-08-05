/**
 * entities.js — the governance source schema, as data.
 *
 * Five entity types per `docs/briefs/governance-data-layer-prd.md` §5.2. Field
 * specs are declarative so the validator engine stays generic and the schema
 * stays readable by someone who is not reading the engine.
 *
 * Hand-rolled rather than ajv/zod: PRD §8 Decision 1 chose JSON partly for
 * "zero new dependencies", and §9's mitigation for the generator is "plain Node
 * script, no framework". The rule set here is small enough that a dependency
 * would cost more in error-message shaping than it saves — and PRD §10 requires
 * failures to name the offending record ID and field, which is easier to
 * guarantee when we own the message.
 *
 * Field spec keys:
 *   type          'string' | 'integer' | 'date' | 'array'
 *   required      true, or a predicate (record) => boolean
 *   nullable      true if an explicit null is a legal value
 *   nonEmpty      string must not be empty or whitespace
 *   enum          array of legal values
 *   pattern       RegExp the value must match
 *   min / max     integer bounds, inclusive
 *   notFuture     date must not be after the build's reference date
 *   minItems      array minimum length
 *   itemEnum      every array entry must be one of these
 *   ref           entity name this value must resolve to; the engine resolves it
 *                 generically (validate.js pass 2). A declared ref that nothing
 *                 read would be an inert control inside the tool built to stop
 *                 inert controls, so this key is wired, not decorative.
 *   refDenyStatus when ref is set, target statuses that are NOT citable
 *   forbidden     predicate (record) => boolean; field must be ABSENT when true
 */

export const EVIDENCE_CLASSES = ['enforced-by-code', 'measured', 'convention', 'roadmap']
export const AIRMF_FUNCTIONS = ['GOVERN', 'MAP', 'MEASURE', 'MANAGE']

/** Reserved controls carry only id, status and reservedFor (PRD §5.2). */
const isReserved = (r) => r.status === 'reserved'
const isNotReserved = (r) => r.status !== 'reserved'

export const ENTITIES = {
  control: {
    file: 'controls.json',
    idField: 'id',
    label: 'control',
    fields: {
      id: { type: 'string', required: true, pattern: /^CTL-\d{3}$/, unique: true },
      status: { type: 'string', required: true, enum: ['active', 'retired', 'reserved'] },

      // Reserved rows are ID placeholders, not controls. CTL-026 exists as data
      // so a next-free-ID computation cannot reallocate it.
      reservedFor: { type: 'string', required: isReserved, nonEmpty: true, forbidden: isNotReserved },

      name: { type: 'string', required: isNotReserved, nonEmpty: true, forbidden: isReserved },
      class: { type: 'string', required: isNotReserved, enum: EVIDENCE_CLASSES, forbidden: isReserved },
      probeId: {
        type: 'string',
        required: isNotReserved,
        nullable: true,
        ref: 'probe',
        forbidden: isReserved,
      },
      noProbeReason: {
        type: 'string',
        required: (r) => isNotReserved(r) && r.probeId === null,
        nonEmpty: true,
        forbidden: isReserved,
      },
      reader: { type: 'string', required: isNotReserved, nonEmpty: true, forbidden: isReserved },
      cadence: { type: 'string', required: isNotReserved, enum: ['continuous', 'dated'], forbidden: isReserved },
      nextRead: {
        type: 'date',
        required: (r) => isNotReserved(r) && r.cadence === 'dated',
        forbidden: isReserved,
      },
      bypass: { type: 'string', required: isNotReserved, nonEmpty: true, forbidden: isReserved },
    },
  },

  component: {
    file: 'components.json',
    idField: 'id',
    label: 'coverage component',
    fields: {
      id: { type: 'string', required: true, pattern: /^COMP-\d{3}$/, unique: true },
      name: { type: 'string', required: true, nonEmpty: true },
      layer: { type: 'integer', required: true, min: 1, max: 6 },
      layerStatus: {
        type: 'string',
        required: true,
        enum: ['strong', 'partial', 'inherited', 'not-applicable'],
      },
      statusDate: { type: 'date', required: true, notFuture: true },
      statusEvidence: { type: 'string', required: true, nonEmpty: true },
      // Closed-world: see validateEnforcedBy in validate.js. Anything that is
      // neither a resolving CTL id nor an existing artifact: path is an error,
      // never a skipped string (PRD §5.2, US-004).
      enforcedBy: { type: 'array', required: true, minItems: 1 },
      livenessCaveat: { type: 'string', required: false, nullable: true },
    },
  },

  claim: {
    file: 'claims.json',
    idField: 'id',
    label: 'published claim',
    fields: {
      id: { type: 'string', required: true, pattern: /^CLM-\d{3}$/, unique: true },
      surface: { type: 'string', required: true, nonEmpty: true },
      type: { type: 'string', required: true, enum: ['sufficiency', 'attribution', 'count'] },
      valueSource: { type: 'string', required: true, enum: ['derived', 'external'] },

      // `value` and `statsKey` are NOT in the PRD §5.2 claim table, which is
      // internally inconsistent with the rest of the PRD: §3's "Typed claim
      // contract" goal and US-005's P0 acceptance criterion both require a
      // value, and §5.2's own note on `valueSource: external` says the record
      // "names a pipeline key that must resolve in stats.json" while giving no
      // field to hold that key. Without these two, no claim can produce a
      // number, which is the entity's whole purpose. Flagged for Bex as a PRD
      // correction rather than silently omitted (SUG-268 Phase 1 review).
      value: { type: 'string', required: true, nonEmpty: true },
      statsKey: {
        type: 'string',
        required: (r) => r.valueSource === 'external',
        nonEmpty: true,
        forbidden: (r) => r.valueSource === 'derived',
      },

      // Always a source field, never a build-time stamp. A wall-clock value here
      // would be Date.now() laundered into a measurement date and would break
      // diff-clean on a clean tree the day after the last build (PRD §5.2).
      measuredAt: { type: 'date', required: true, notFuture: true },
      command: { type: 'string', required: true, nonEmpty: true },
      evidenceClass: { type: 'string', required: true, enum: EVIDENCE_CLASSES },
      // A reserved ID is an ID placeholder, not a control; a retired one cannot
      // police a live claim. Both are non-citable.
      controlId: { type: 'string', required: true, ref: 'control', refDenyStatus: ['reserved', 'retired'] },
    },
  },

  probe: {
    file: 'probes.json',
    idField: 'id',
    label: 'probe',
    fields: {
      id: { type: 'string', required: true, nonEmpty: true, unique: true },
      // Two-way checked against the liveness harness via --list-gates (PRD §8
      // Decision 4). Wired in Phase 2; Phase 1 validates shape only.
      //
      // `gate` is the join key for that check, so it must be unique here: two
      // probes claiming one gate make "every harness entry has a probe record"
      // satisfiable twice over and the reverse direction ambiguous. Cheap now,
      // needs a migration later.
      gate: { type: 'string', required: true, nonEmpty: true, unique: true },
      derivation: { type: 'string', required: true, enum: ['derived-from-target', 'static-input'] },
      staticJustification: {
        type: 'string',
        required: (r) => r.derivation === 'static-input',
        nonEmpty: true,
      },
    },
  },

  crosswalk: {
    file: 'crosswalk.json',
    idField: 'layer',
    label: 'framework crosswalk',
    fields: {
      layer: { type: 'integer', required: true, min: 1, max: 6, unique: true },
      airmfFunctions: { type: 'array', required: true, minItems: 1, itemEnum: AIRMF_FUNCTIONS },
      // An RMF version bump is a schema change, deliberately (PRD §5.2).
      airmfVersion: { type: 'string', required: true, enum: ['1.0'] },
      assessedAt: { type: 'date', required: true, notFuture: true },
      rationale: { type: 'string', required: true, nonEmpty: true },
    },
  },
}

export const ENTITY_NAMES = Object.keys(ENTITIES)
