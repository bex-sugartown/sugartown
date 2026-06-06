import React from 'react'
/**
 * Pages/TaxonomyArchivePage — taxonomy listing page template.
 *
 * Documents the four layout variants of TaxonomyArchivePage.jsx:
 *   - RowLayout      — /tags, /categories (row list with count)
 *   - AlphaBucketLayout — /tools (A–Z grouped grid with AlphaFilter)
 *   - PeopleLayout   — /people (row list with avatar)
 *   - ProjectsLayout — /projects (flat-grid, wide layout)
 *
 * Production routes: /tags, /categories, /tools, /people, /projects
 */
import { MemoryRouter } from 'react-router-dom'
import { Container, Breadcrumb, PageHeader } from '../design-system'
import AlphaFilter from './AlphaFilter'
import styles from '../pages/TaxonomyArchivePage.module.css'

function withRouter(StoryFn) { return React.createElement(MemoryRouter, null, React.createElement(StoryFn)) }

export default {
  title: 'Pages/TaxonomyArchivePage',
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [withRouter],
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockTags = [
  { _id: 't1', name: 'Design Systems', slug: { current: 'design-systems' }, count: 12 },
  { _id: 't2', name: 'Content Strategy', slug: { current: 'content-strategy' }, count: 8 },
  { _id: 't3', name: 'CSS', slug: { current: 'css' }, count: 7 },
  { _id: 't4', name: 'AI', slug: { current: 'ai' }, count: 15 },
  { _id: 't5', name: 'Workflow', slug: { current: 'workflow' }, count: 4 },
  { _id: 't6', name: 'Typography', slug: { current: 'typography' }, count: 3 },
  { _id: 't7', name: 'CMS', slug: { current: 'cms' }, count: 6 },
  { _id: 't8', name: 'Sanity', slug: { current: 'sanity' }, count: 9 },
]

const mockPeople = [
  { _id: 'p1', name: 'Bex Walton', slug: { current: 'bex-walton' }, role: 'Design Engineer', count: 34 },
  { _id: 'p2', name: 'Ada Lovelace', slug: { current: 'ada-lovelace' }, role: 'Mathematician', count: 5 },
  { _id: 'p3', name: 'Grace Hopper', slug: { current: 'grace-hopper' }, role: 'Computer Scientist', count: 3 },
]

const mockTools = {
  C: [
    { _id: 'tool-1', name: 'Claude Code', slug: { current: 'claude-code' }, count: 22 },
    { _id: 'tool-2', name: 'Contentful', slug: { current: 'contentful' }, count: 4 },
  ],
  F: [
    { _id: 'tool-3', name: 'Figma', slug: { current: 'figma' }, count: 18 },
  ],
  S: [
    { _id: 'tool-4', name: 'Sanity', slug: { current: 'sanity' }, count: 31 },
    { _id: 'tool-5', name: 'Storybook', slug: { current: 'storybook' }, count: 9 },
  ],
  V: [
    { _id: 'tool-6', name: 'Vite', slug: { current: 'vite' }, count: 7 },
  ],
}

const mockProjects = [
  { _id: 'proj-1', name: 'Sugartown Digital', slug: { current: 'sugartown-digital' }, colorHex: '#FF247D', count: 45 },
  { _id: 'proj-2', name: 'Media Rebuild', slug: { current: 'media-rebuild' }, colorHex: '#D4A853', count: 12 },
  { _id: 'proj-3', name: 'Knowledge Graph', slug: { current: 'knowledge-graph' }, colorHex: '#4A90D9', count: 8 },
]

// ─── Row Layout — Tags / Categories ──────────────────────────────────────────

export const RowLayout = {
  name: 'Row Layout (/tags, /categories)',
  render: () => (
    <main className={styles.archivePage}>
      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: 'Library', href: '/library' }]} />}
        title="Tags"
        count={mockTags.length}
        italic
      />
      <Container>
        <ul className={styles.itemList}>
          {mockTags.map((tag) => (
            <li key={tag._id} className={styles.item}>
              <a href={`/tags/${tag.slug.current}`} className={styles.itemLink}>
                <span className={styles.itemText}>
                  <span className={styles.itemLabel}>{tag.name}</span>
                </span>
                <span className={styles.itemCount}>{tag.count}</span>
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </main>
  ),
}

// ─── Alpha Bucket Layout — Tools ──────────────────────────────────────────────

export const AlphaBucketLayout = {
  name: 'Alpha Bucket Layout (/tools)',
  render: () => {
    const activeLetters = new Set(Object.keys(mockTools))
    return (
      <main className={`${styles.archivePage} ${styles.archivePageWide}`}>
        <PageHeader
          breadcrumb={<Breadcrumb items={[{ label: 'Library', href: '/library' }]} />}
          title="Tools & Platforms"
          count={Object.values(mockTools).flat().length}
          italic
        />
        <Container>
          <AlphaFilter
            activeLetters={activeLetters}
            filterLetter={null}
            onSelect={() => {}}
          />
          <div className={styles.indexGroup}>
            <div className={styles.indexGrid}>
              {Object.entries(mockTools).map(([letter, items]) => (
                <div key={letter}>
                  <h2>{letter}</h2>
                  <ul>
                    {items.map((tool) => (
                      <li key={tool._id} className={styles.listItem}>
                        <span className={styles.listItemInner}>
                          <span className={styles.listItemLabel}>{tool.name}</span>
                          <span className={styles.listItemCount}>{tool.count}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </main>
    )
  },
}

// ─── People Layout — /people ──────────────────────────────────────────────────

export const PeopleLayout = {
  name: 'People Layout (/people)',
  render: () => (
    <main className={styles.archivePage}>
      <PageHeader
        title="People"
        count={mockPeople.length}
      />
      <Container>
        <ul className={styles.itemList}>
          {mockPeople.map((person) => (
            <li key={person._id} className={styles.item}>
              <a href={`/people/${person.slug.current}`} className={styles.itemLink}>
                <div className={styles.itemAvatarFallback} aria-hidden="true">
                  {person.name.charAt(0)}
                </div>
                <span className={styles.itemText}>
                  <span className={styles.itemLabel}>{person.name}</span>
                  {person.role && <span className={styles.itemSublabel}>{person.role}</span>}
                </span>
                <span className={styles.itemCount}>{person.count}</span>
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </main>
  ),
}

// ─── Projects Layout — /projects ──────────────────────────────────────────────

export const ProjectsLayout = {
  name: 'Projects Layout (/projects)',
  render: () => (
    <main className={`${styles.archivePage} ${styles.archivePageWide}`}>
      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: 'Library', href: '/library' }]} />}
        title="Projects"
        count={mockProjects.length}
      />
      <Container>
        <ul className={styles.itemList}>
          {mockProjects.map((project) => (
            <li key={project._id} className={styles.item}>
              <a href={`/projects/${project.slug.current}`} className={styles.itemLink}>
                {project.colorHex && (
                  <span
                    className={styles.itemColorDot}
                    style={{ backgroundColor: project.colorHex }}
                    aria-hidden="true"
                  />
                )}
                <span className={styles.itemText}>
                  <span className={styles.itemLabel}>{project.name}</span>
                </span>
                <span className={styles.itemCount}>{project.count}</span>
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </main>
  ),
}
