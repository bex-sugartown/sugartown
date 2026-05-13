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

const QUERY = `
  query SugIssues {
    team(key: "SUG") {
      issues(
        filter: { state: { type: { in: [started, backlog, unstarted, completed] } } }
        first: 250
      ) {
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

  if (!res.ok) throw new Error(`Linear API → ${res.status} ${res.statusText}`)

  const json = await res.json()
  if (json.errors?.length) throw new Error(`Linear API errors: ${JSON.stringify(json.errors)}`)

  const nodes = json.data?.team?.issues?.nodes ?? []

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
