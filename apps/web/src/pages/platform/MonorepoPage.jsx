import { Link } from 'react-router-dom'
import SeoHead from '../../components/SeoHead'
import Tile from '../../design-system/components/tile/Tile'
import SectionContainer from '../../design-system/components/section-container/SectionContainer'
import SectionLabel from '../../design-system/components/section-label/SectionLabel'
import Grid from '../../design-system/components/grid/Grid'
import Card from '../../design-system/components/card/Card'
import { MermaidDiagram } from '../../components/PageSections'
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

const ARCHITECTURE_DIAGRAM = {
  _key: 'mono-architecture-flow',
  code: `flowchart TB
    subgraph tooling["Tooling"]
        direction LR
        TURBO["Turborepo\\nBuild Orchestration"]
        PNPM["pnpm Workspaces\\nDependency Management"]
        VALIDATORS["Validators\\nURL · Filters · Content · Tokens"]
    end

    subgraph apps["Apps"]
        direction LR
        WEB["apps/web\\nReact + Vite"]
        STUDIO["apps/studio\\nSanity Studio"]
        STORYBOOK["apps/storybook\\nComponent Docs"]
    end

    subgraph packages["Packages"]
        direction LR
        DS["packages/design-system\\nTokens + Components"]
        ESLINT["packages/eslint-config\\nBoundary Enforcement"]
        TS["packages/tsconfig\\nShared Types"]
    end

    tooling ==> apps
    apps ==> packages
    WEB -.->|queries| STUDIO`,
  width: 'wide',
  caption: 'Architecture flow',
}

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
          <SectionLabel name="Architecture" kicker="Workspace topology" />
          <MermaidDiagram section={ARCHITECTURE_DIAGRAM} />
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
          <Grid spacing="0" accentTop>
            {ARTIFACTS.map((a) => (
              <Card
                key={a.title}
                eyebrow={a.eyebrow}
                title={a.title}
                body={a.body}
                titleLink={a.href}
              />
            ))}
          </Grid>
        </section>
      </div>
    </>
  )
}
