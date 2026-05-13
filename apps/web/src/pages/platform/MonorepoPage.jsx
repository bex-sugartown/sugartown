import SeoHead from '../../components/SeoHead'
import usePlatformHero from '../../components/PlatformLayout/PlatformHero'
import Tile from '../../design-system/components/tile/Tile'
import SectionContainer from '../../design-system/components/section-container/SectionContainer'
import SectionLabel from '../../design-system/components/section-label/SectionLabel'
import Card from '../../design-system/components/card/Card'
import { MermaidDiagram } from '../../components/PageSections'
import { PLATFORM_ROUTES, TRUST_LINKS } from '../../lib/routes'
import styles from './PlatformHubPage.module.css'

const ARTIFACTS = [
  {
    eyebrow: 'PRD',
    title: 'Monorepo PRD',
    body: 'Monorepo architecture — pnpm workspaces, Turbo pipeline, package boundaries, and build conventions.',
    href: 'https://github.com/bex-sugartown/sugartown/blob/main/docs/briefs/monorepo-prd.md',
  },
  {
    eyebrow: 'Architecture',
    title: 'Monorepo Overview',
    body: 'Package topology, workspace structure, and dependency graph for the sugartown monorepo.',
    href: 'https://github.com/bex-sugartown/sugartown/blob/main/docs/architecture/monorepo-overview.md',
  },
  {
    eyebrow: 'Architecture',
    title: 'Architecture Diagram',
    body: 'System-level diagram of app, studio, design system, and tooling layers.',
    href: 'https://github.com/bex-sugartown/sugartown/blob/main/docs/architecture/architecture-diagram.md',
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
  usePlatformHero({
    title: 'Monorepo',
    subtitle: 'pnpm workspaces + Turborepo. Four packages share a single dependency graph with cached builds, enforced boundaries, and a gated release process.',
  })
  return (
    <>
      <SeoHead
        title="Monorepo — Platform"
        description="Workspace topology, build pipeline, and dependency structure for sugartown.io."
      />
      <div className={styles.hub}>

        <SectionContainer className={styles.statsSection}>
          <Tile label="Packages" value="4" />
          <Tile label="Apps" value="2" />
          <Tile label="Shared libs" value="2" />
          <Tile label="Build cache hits" value="~80%" href={TRUST_LINKS.commits} />
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

        <section id="monorepo-artifacts" className={styles.section}>
          <SectionLabel name="Artifacts" className={styles.labelFlush} />
          <SectionContainer columns={3}>
            {ARTIFACTS.map((a) => (
              <Card
                key={a.title}
                eyebrow={a.eyebrow}
                title={a.title}
                excerpt={a.body}
                href={a.href}
              />
            ))}
          </SectionContainer>
        </section>
      </div>
    </>
  )
}
