/**
 * github-projects.js — githubRoadmap collector (ST-117)
 *
 * Replaces linear.js. Fetches every item on GitHub Projects v2 board "Sugartown
 * Roadmap" (project 1, owner bex-sugartown, a user account — not an org, hence
 * `user(login:)` rather than `organization(login:)` below) and groups them by
 * the board's own `Status` field, the same grouping linear.js built from Linear
 * workflow-state types.
 *
 * Requires: GH_PROJECTS_TOKEN env var. Projects v2 GraphQL data is not reachable
 * with the default Actions GITHUB_TOKEN — it has no `read:project` scope and none
 * of the `permissions:` block's grantable scopes cover Projects — so this needs a
 * token with project read access (fine-grained PAT, "Projects" repository or
 * account permission: Read-only), stored as its own repo secret.
 *
 * Output shape (kept identical to linear.js's linearRoadmap, field-for-field,
 * so GovernancePage.jsx and TablesDevPage.jsx need no shape change beyond the
 * top-level key rename to githubRoadmap):
 * {
 *   fetchedAt: "2026-...",
 *   inProgress: [{ identifier, title, url, priority, status, projects[], updatedAt }],
 *   backlog:    [...],
 *   completed:  [...],   // most recent 20 only, by updatedAt desc
 * }
 *
 * `projects: []` on every item, always — this repo uses no GitHub Issue labels
 * (`gh issue view` on #107 and #117 both returned `"labels":[]`), so there is no
 * real per-item grouping to put there. Linear's `project { name, color }` has no
 * clean GitHub analog; leaving the array empty is honest, not a lost feature.
 *
 * `completedAt` from linear.js is gone — nothing rendered it (only used
 * internally there to sort the completed bucket) and GitHub Projects items have
 * no completion timestamp of their own. Sorting here uses the issue's own
 * `updatedAt`, exposed on each item under that real name instead of being
 * relabelled into a field it isn't.
 *
 * Graceful degradation: if GH_PROJECTS_TOKEN is missing or the API fails,
 * returns { stale: true } so the page can render a "data unavailable" fallback
 * — unchanged behaviour from linear.js.
 */

const GITHUB_GRAPHQL = 'https://api.github.com/graphql'
const PROJECT_OWNER = 'bex-sugartown'
const PROJECT_NUMBER = 1

const PROJECT_ITEMS_QUERY = `
  query RoadmapItems($login: String!, $number: Int!, $after: String) {
    user(login: $login) {
      projectV2(number: $number) {
        items(first: 100, after: $after) {
          pageInfo { hasNextPage endCursor }
          nodes {
            content {
              ... on Issue {
                number
                title
                url
                updatedAt
              }
            }
            status: fieldValueByName(name: "Status") {
              ... on ProjectV2ItemFieldSingleSelectValue { name }
            }
            priority: fieldValueByName(name: "Priority") {
              ... on ProjectV2ItemFieldSingleSelectValue { name }
            }
          }
        }
      }
    }
  }
`

function normalise(node) {
  return {
    identifier: `#${node.content.number}`,
    title:      node.content.title,
    url:        node.content.url,
    updatedAt:  node.content.updatedAt ?? null,
    priority:   node.priority?.name ?? 'No priority',
    status:     node.status?.name ?? '',
    projects:   [],
  }
}

async function githubGraphql(token, query, variables) {
  const res = await fetch(GITHUB_GRAPHQL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'User-Agent': 'sugartown-stats/1.0',
    },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '(unreadable)')
    throw new Error(`GitHub GraphQL → ${res.status} ${res.statusText}: ${body.slice(0, 500)}`)
  }
  const json = await res.json()
  if (json.errors?.length) throw new Error(`GitHub GraphQL errors: ${JSON.stringify(json.errors)}`)
  return json.data
}

export async function collectGithubProjects() {
  const token = process.env.GH_PROJECTS_TOKEN
  if (!token) {
    console.warn('  [stats] githubProjects: GH_PROJECTS_TOKEN not set — skipping')
    return { stale: true, inProgress: [], backlog: [], completed: [] }
  }

  const nodes = []
  let after = null
  let hasNextPage = true
  while (hasNextPage) {
    const data = await githubGraphql(token, PROJECT_ITEMS_QUERY, {
      login: PROJECT_OWNER,
      number: PROJECT_NUMBER,
      after,
    })
    const page = data?.user?.projectV2?.items
    if (!page) throw new Error(`GitHub GraphQL: user "${PROJECT_OWNER}" project ${PROJECT_NUMBER} not found`)
    nodes.push(...(page.nodes ?? []))
    hasNextPage = page.pageInfo?.hasNextPage ?? false
    after = page.pageInfo?.endCursor ?? null
  }

  const inProgress = []
  const backlog    = []
  const completed  = []

  for (const node of nodes) {
    // Draft items (no linked Issue) carry content: null — nothing to show.
    if (!node.content) continue
    const status = node.status?.name

    if (status === 'In Progress') {
      inProgress.push(normalise(node))
    } else if (status === 'Todo' || status === 'Backlog') {
      backlog.push(normalise(node))
    } else if (status === 'Done' || status === 'Shipped') {
      completed.push(normalise(node))
    }
    // 'On Hold' and 'Canceled' are deliberately excluded from every bucket,
    // matching linear.js's exclusion of Linear's `canceled` state type.
  }

  // Most recent 20 completed, sorted newest first by last-updated.
  completed.sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''))
  const completedTrimmed = completed.slice(0, 20)

  console.log(`  githubProjects  ${inProgress.length} in progress, ${backlog.length} backlog, ${completedTrimmed.length} recently completed`)

  return {
    fetchedAt: new Date().toISOString(),
    inProgress,
    backlog,
    completed: completedTrimmed,
  }
}
