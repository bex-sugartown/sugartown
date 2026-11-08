/**
 * schema-parity-rules.cjs — the judging half of validate-schema-parity.js (SUG-269, #93).
 *
 * Pure: local and deployed schema types in, drift findings out. No CLI calls, no
 * filesystem, no process.exit, no console output. validate-schema-parity.js
 * extracts the two schemas and prints; the liveness probe (scripts/validate-liveness-probes.js)
 * feeds this same code two manifests that differ.
 */

// Canonicalize for structural comparison: sort object keys recursively,
// leave array order intact (field order is semantically meaningful).
function canonicalize(value) {
  if (Array.isArray(value)) {
    return value.map(canonicalize)
  }
  if (value !== null && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = canonicalize(value[key])
        return acc
      }, {})
  }
  return value
}

function fieldNames(type) {
  return Array.isArray(type.fields) ? type.fields.map((f) => f.name) : null
}

function diffFieldNames(localType, deployedType) {
  const localFields = fieldNames(localType)
  const deployedFields = fieldNames(deployedType)
  if (!localFields || !deployedFields) return null
  const deployedSet = new Set(deployedFields)
  const localSet = new Set(localFields)
  return {
    addedFields: localFields.filter((f) => !deployedSet.has(f)),
    removedFields: deployedFields.filter((f) => !localSet.has(f)),
  }
}

/** Find the deployed record for a workspace. Falls back to the only record when none matches by name. */
function matchDeployedRecord(workspaceName, deployedRecords) {
  const untaggedId = `_.schemas.${workspaceName}`
  const exact = deployedRecords.find(
    (r) => r.workspace?.name === workspaceName && r._id === untaggedId,
  )
  if (exact) return { record: exact, usedFallback: false }
  if (deployedRecords.length === 1) return { record: deployedRecords[0], usedFallback: true }
  return { record: undefined, usedFallback: false }
}

/** Compare one workspace's local and deployed types. `drifted` is true when the validator exits 1. */
function diffWorkspace(localTypes, deployedTypes) {
  const localByName = new Map(localTypes.map((t) => [t.name, t]))
  const deployedByName = new Map(deployedTypes.map((t) => [t.name, t]))

  const addedLocally = [...localByName.keys()].filter((n) => !deployedByName.has(n)).sort()
  const removedLocally = [...deployedByName.keys()].filter((n) => !localByName.has(n)).sort()
  const commonNames = [...localByName.keys()].filter((n) => deployedByName.has(n)).sort()

  const changed = []
  for (const name of commonNames) {
    const localCanon = JSON.stringify(canonicalize(localByName.get(name)))
    const deployedCanon = JSON.stringify(canonicalize(deployedByName.get(name)))
    if (localCanon !== deployedCanon) {
      changed.push({ name, fieldDiff: diffFieldNames(localByName.get(name), deployedByName.get(name)) })
    }
  }

  return {
    addedLocally,
    removedLocally,
    changed,
    drifted: addedLocally.length > 0 || removedLocally.length > 0 || changed.length > 0,
  }
}

module.exports = { canonicalize, diffFieldNames, matchDeployedRecord, diffWorkspace }
