/**
 * taxonomy-rules.cjs — the judging half of validate-taxonomy.js (SUG-269, #93).
 *
 * Pure: the six fetched document lists in, findings out. No client, no env, no
 * process.exit, no console output. validate-taxonomy.js fetches and prints; the
 * liveness probe feeds this same function a deliberately broken fixture.
 *
 * Errors (exit 1): dangling tools[], tags[] and authors[] references.
 * Warnings (exit 0): categories outside 1 to 2, entity docs missing a slug or
 * name, dangling projects[] references.
 */
function judgeTaxonomy({ docs, toolDocs, tagDocs, personDocs, projectDocs, contentRefs }) {
  const allTagIds = new Set(tagDocs.map((t) => t._id))

  // Check A: category count
  const overCategorized = docs.filter((d) => (d.categoryCount ?? 0) > 2)
  const uncategorized = docs.filter((d) => (d.categoryCount ?? 0) === 0)

  // Check B: tools[] references valid tool docs
  const allToolIds = new Set(toolDocs.map((t) => t._id))
  const toolErrors = []
  for (const doc of docs) {
    const toolIds = doc.toolIds ?? []
    for (const toolId of toolIds) {
      if (!allToolIds.has(toolId)) {
        toolErrors.push({ doc, toolId })
      }
    }
  }
  const toolsWithoutSlug = toolDocs.filter((t) => !t.slug)

  // Check C: tags[] references valid tag docs
  const dangling = []
  for (const doc of docs) {
    const tagIds = doc.tagIds ?? []
    for (const tagId of tagIds) {
      if (!allTagIds.has(tagId)) {
        dangling.push({ doc, tagId })
      }
    }
  }

  // Checks E, F, G: entity docs missing slug or name
  const personsWithoutSlug = personDocs.filter((p) => !p.slug)
  const personsWithoutName = personDocs.filter((p) => !p.name)
  const projectsWithoutSlug = projectDocs.filter((p) => !p.slug)

  // Checks H, I: dangling authors[] and projects[] refs
  const allPersonIds = new Set(personDocs.map((p) => p._id))
  const allProjectIds = new Set(projectDocs.map((p) => p._id))
  const danglingPersonRefs = []
  for (const doc of contentRefs) {
    const authorIds = doc.authorIds ?? []
    for (const authorId of authorIds) {
      if (!allPersonIds.has(authorId)) {
        danglingPersonRefs.push({ doc, authorId })
      }
    }
  }
  const danglingProjectRefs = []
  for (const doc of contentRefs) {
    const projectIds = doc.projectIds ?? []
    for (const projectId of projectIds) {
      if (!allProjectIds.has(projectId)) {
        danglingProjectRefs.push({ doc, projectId })
      }
    }
  }

  const errors = toolErrors.length + dangling.length + danglingPersonRefs.length
  // Category issues and entity slug/name issues are warnings only — not schema errors.
  // danglingProjectRefs are also WARN level.
  const warnings =
    overCategorized.length +
    uncategorized.length +
    toolsWithoutSlug.length +
    personsWithoutSlug.length +
    personsWithoutName.length +
    projectsWithoutSlug.length +
    danglingProjectRefs.length

  return {
    overCategorized, uncategorized, toolErrors, toolsWithoutSlug, dangling,
    personsWithoutSlug, personsWithoutName, projectsWithoutSlug,
    danglingPersonRefs, danglingProjectRefs, errors, warnings,
  }
}

module.exports = { judgeTaxonomy }
