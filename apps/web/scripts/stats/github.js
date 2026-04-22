/**
 * github.js — github namespace collector (SUG-67)
 *
 * Fetches public repo stats from the GitHub REST API.
 * Unauthenticated: 60 req/hr (sufficient for daily CI run).
 * Authenticated (GITHUB_TOKEN): 5,000 req/hr.
 *
 * Output shape:
 * {
 *   fetchedAt: "2026-04-22T...",
 *   repo: "sugartown-dev/sugartown",
 *   stars: 0, watchers: 0, forks: 0, openIssues: 0,
 *   contributors: 1, lastCommit: "2026-04-22T..."
 * }
 */

const REPO = 'bex-sugartown/sugartown'
const API  = 'https://api.github.com'

async function ghFetch(path) {
  const headers = { 'User-Agent': 'sugartown-stats/1.0', Accept: 'application/vnd.github+json' }
  if (process.env.GITHUB_TOKEN) headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`
  const res = await fetch(`${API}${path}`, { headers })
  if (!res.ok) throw new Error(`GitHub API ${path} → ${res.status}`)
  return res.json()
}

export async function collectGithub() {
  const [repoData, commits] = await Promise.all([
    ghFetch(`/repos/${REPO}`),
    ghFetch(`/repos/${REPO}/commits?per_page=1`),
  ])

  let lastCommit = null
  if (Array.isArray(commits) && commits[0]?.commit?.committer?.date) {
    lastCommit = commits[0].commit.committer.date
  }

  let contributors = null
  try {
    const contribs = await ghFetch(`/repos/${REPO}/contributors?per_page=1&anon=false`)
    // contributors endpoint returns array; page 1 with 1 per page gives us
    // the Link header for total count — parse it for accuracy if available.
    // Fall back to length of full list if repo is small.
    const full = await ghFetch(`/repos/${REPO}/contributors?per_page=100&anon=false`)
    contributors = Array.isArray(full) ? full.length : null
  } catch {}

  return {
    fetchedAt: new Date().toISOString(),
    repo: REPO,
    stars:       repoData.stargazers_count ?? 0,
    watchers:    repoData.watchers_count ?? 0,
    forks:       repoData.forks_count ?? 0,
    openIssues:  repoData.open_issues_count ?? 0,
    contributors,
    lastCommit,
  }
}
