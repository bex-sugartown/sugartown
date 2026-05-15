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

// Linear's `team(key:)` is not valid — team() only accepts a UUID id.
// Use a two-step approach: first get the SUG team UUID via `teams`, then
// query only that team's issues. Fetching issues nested under all teams
// at once exceeds Linear's complexity limit (~60k vs max 10k).
const TEAMS_QUERY = `
  query SugTeams {
    teams {
      nodes { id key }
    }
  }
`

const ISSUES_QUERY = `
  query SugIssues($teamId: String!) {
    team(id: $teamId) {
      issues(first: 250) {
        nodes {
          identifier
          title
          url
          priority
          completedAt
          state { name type }
          project { name color }
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
    projects:   node.project ? [{ name: node.project.name, colorHex: node.project.color }] : [],
    completedAt: node.completedAt ?? null,
  }
}

async function linearPost(key, query, variables) {
  const res = await fetch(LINEAR_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': key },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '(unreadable)')
    throw new Error(`Linear API → ${res.status} ${res.statusText}: ${body.slice(0, 500)}`)
  }
  const json = await res.json()
  if (json.errors?.length) throw new Error(`Linear API errors: ${JSON.stringify(json.errors)}`)
  return json.data
}

export async function collectLinear() {
  const key = process.env.LINEAR_API_KEY
  if (!key) {
    console.warn('  [stats] linear: LINEAR_API_KEY not set — skipping')
    return { stale: true, inProgress: [], backlog: [], shipped: [] }
  }

  // Step 1: find the SUG team UUID (low complexity query)
  const teamsData = await linearPost(key, TEAMS_QUERY)
  const team = (teamsData?.teams?.nodes ?? []).find(t => t.key === 'SUG')
  if (!team) throw new Error('Linear API: team with key "SUG" not found')

  // Step 2: fetch issues for that team by UUID (avoids complexity explosion
  // that occurs when fetching issues nested under all teams at once)
  const issuesData = await linearPost(key, ISSUES_QUERY, { teamId: team.id })
  const nodes = issuesData?.team?.issues?.nodes ?? []

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
