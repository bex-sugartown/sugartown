/**
 * linear.js — linearRoadmap collector (SUG-110)
 *
 * Fetches all SUG issues from the Linear GraphQL API and groups them by
 * workflow state type: inProgress, backlog, shipped.
 *
 * Requires: LINEAR_API_KEY env var (read-only personal token scoped to Issues)
 *
 * Output shape:
 * {
 *   fetchedAt: "2026-...",
 *   inProgress: [{ id, identifier, title, url, priority, labels[], status }],
 *   backlog:    [...],
 *   shipped:    [...],   // most recent 20 only, sorted by completedAt desc
 * }
 *
 * Graceful degradation: if LINEAR_API_KEY is missing or the API fails, returns
 * { stale: true } so the page can render a "data unavailable" fallback.
 */

const LINEAR_API = 'https://api.linear.app/graphql'

const PRIORITY_LABEL = { 0: 'No priority', 1: 'Urgent', 2: 'High', 3: 'Medium', 4: 'Low' }

// Linear's `team()` query only accepts a UUID id, not a key string.
// Use `teams` and match by key in JS instead.
// Filter by state type in JS rather than GraphQL to avoid schema-dependent
// inline enum syntax that triggers 400 on some token scopes.
const QUERY = `
  query SugIssues {
    teams {
      nodes {
        key
        issues(first: 250) {
          nodes {
            identifier
            title
            url
            priority
            completedAt
            state { name type }
            labels { nodes { name } }
          }
        }
      }
    }
  }
`

function normalise(node) {
  return {
    identifier: node.identifier,
    title:      node.title,
    url:        node.url,
    priority:   PRIORITY_LABEL[node.priority] ?? 'No priority',
    status:     node.state?.name ?? '',
    labels:     (node.labels?.nodes ?? []).map(l => l.name),
    completedAt: node.completedAt ?? null,
  }
}

export async function collectLinear() {
  const key = process.env.LINEAR_API_KEY
  if (!key) {
    console.warn('  [stats] linear: LINEAR_API_KEY not set — skipping')
    return { stale: true, inProgress: [], backlog: [], shipped: [] }
  }

  const res = await fetch(LINEAR_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': key,
    },
    body: JSON.stringify({ query: QUERY }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '(unreadable)')
    throw new Error(`Linear API → ${res.status} ${res.statusText}: ${body.slice(0, 500)}`)
  }

  const json = await res.json()
  if (json.errors?.length) throw new Error(`Linear API errors: ${JSON.stringify(json.errors)}`)

  const team = (json.data?.teams?.nodes ?? []).find(t => t.key === 'SUG')
  if (!team) throw new Error('Linear API: team with key "SUG" not found')
  const nodes = team.issues?.nodes ?? []

  const inProgress = []
  const backlog    = []
  const shipped    = []

  for (const node of nodes) {
    const type = node.state?.type
    if (type === 'started') {
      inProgress.push(normalise(node))
    } else if (type === 'backlog' || type === 'unstarted') {
      backlog.push(normalise(node))
    } else if (type === 'completed') {
      shipped.push(normalise(node))
    }
  }

  // Most recent 20 shipped, sorted newest first
  shipped.sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''))
  const shippedTrimmed = shipped.slice(0, 20)

  console.log(`  linear    ${inProgress.length} in progress, ${backlog.length} backlog, ${shippedTrimmed.length} recently shipped`)

  return {
    fetchedAt:  new Date().toISOString(),
    inProgress,
    backlog,
    shipped: shippedTrimmed,
  }
}
