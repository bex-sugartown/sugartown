import { Link } from 'react-router-dom'
import SeoHead from '../../components/SeoHead'
import Tile from '../../design-system/components/tile/Tile'
import SectionContainer from '../../design-system/components/section-container/SectionContainer'
import SectionLabel from '../../design-system/components/section-label/SectionLabel'
import Card from '../../design-system/components/card/Card'
import { PLATFORM_ROUTES } from '../../lib/routes'
import styles from './PlatformHubPage.module.css'

const ARTIFACTS = [
  {
    eyebrow: 'Conventions',
    title: 'CLAUDE.md',
    body: 'Session discipline, CSS protocol, schema conventions, and commit rules enforced by Claude Code.',
    href: 'https://github.com/bex-sugartown/sugartown/blob/main/CLAUDE.md',
  },
  {
    eyebrow: 'Conventions',
    title: 'AI Assist Conventions',
    body: 'How AI tooling is used in this repo — prompting, review gates, and anti-slop rules.',
    href: 'https://github.com/bex-sugartown/sugartown/blob/main/CLAUDE.md',
  },
  {
    eyebrow: 'Toolchain',
    title: 'pnpm + Turbo',
    body: 'pnpm workspaces with Turborepo for task orchestration, caching, and build ordering.',
    href: 'https://github.com/bex-sugartown/sugartown/blob/main/turbo.json',
  },
]

export default function MonorepoPage() {
  return (
    <>
      <SeoHead
        title="Monorepo — Platform"
        description="Workspace topology, build pipeline, and dependency structure for sugartown.io."
      />
      <div className={styles.hub}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            <Link to={PLATFORM_ROUTES.root} className={styles.eyebrowLink}>Platform</Link>
          </p>
          <h1 className={styles.heading}>Monorepo</h1>
          <p className={styles.intro}>
            pnpm workspaces + Turborepo. Four packages share a single dependency graph
            with cached builds, enforced boundaries, and a gated release process.
          </p>
        </header>

        <SectionContainer>
          <Tile label="Packages" value="4" />
          <Tile label="Apps" value="2" />
          <Tile label="Shared libs" value="2" />
          <Tile label="Build cache hits" value="~80%" />
        </SectionContainer>

        <section id="workspace-topology" className={styles.section}>
          <SectionLabel name="Workspace topology" />
          <div className={styles.diagramBlock}>
            {`sugartown/ (monorepo root)
├── apps/
│   ├── web/          React 19 + Vite 7 (SPA)
│   └── studio/       Sanity Studio v5
├── packages/
│   ├── design-system/  DS primitives (shared)
│   └── storybook/      Component catalogue
└── tokens/
    └── source/       Style Dictionary v5 source`}
          </div>
        </section>

        <section id="build-pipeline" className={styles.section}>
          <SectionLabel name="Build pipeline" />
          <div className={styles.diagramBlock}>
            {`tokens:build  →  validate:tokens  →  type-check
      ↓
  storybook (chromatic VRT)
      ↓
  web build  →  validate:urls  →  validate:content
      ↓
  Netlify deploy  →  LHCI audit  →  CWV snapshot`}
          </div>
        </section>

        <section id="artifacts" className={styles.section}>
          <SectionLabel name="Artifacts" />
          <div className={styles.artifactGrid}>
            {ARTIFACTS.map((a) => (
              <Card
                key={a.title}
                eyebrow={a.eyebrow}
                title={a.title}
                body={a.body}
                titleLink={a.href}
              />
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
