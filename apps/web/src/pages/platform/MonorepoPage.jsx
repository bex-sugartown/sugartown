import SeoHead from '../../components/SeoHead'
import usePlatformHero from '../../components/PlatformLayout/PlatformHero'
import StatCard from '../../components/StatCard'
import Grid from '../../design-system/components/grid/Grid'
import SectionLabel from '../../design-system/components/section-label/SectionLabel'
import CodeBlock from '../../design-system/components/codeblock/CodeBlock'
import { MermaidDiagram } from '../../components/PageSections'
import { TRUST_LINKS } from '../../lib/routes'
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

        <Grid spacing="0" accentTop accentColor="ink" tabletColumns={2} className={styles.statsSection}>
          <StatCard label="Packages" value="4" />
          <StatCard label="Apps" value="2" />
          <StatCard label="Shared libs" value="2" />
          <StatCard label="Build cache hits" value="~80%" href={TRUST_LINKS.commits} />
        </Grid>

        <section id="workspace-topology" className={styles.section}>
          <SectionLabel level="h3" number="§01" name="ARCHITECTURE" title="Workspace topology" kicker="4 packages" />
          <MermaidDiagram section={ARCHITECTURE_DIAGRAM} />
        </section>

        <section id="build-pipeline" className={styles.section}>
          <SectionLabel level="h3" number="§02" name="BUILD PIPELINE" title="How turbo moves work" />
          <CodeBlock
            code={`tokens:build  →  validate:tokens  →  type-check\n      ↓\n  storybook (chromatic VRT)\n      ↓\n  web build  →  validate:urls  →  validate:content\n      ↓\n  Netlify deploy  →  LHCI audit  →  CWV snapshot`}
            language="text"
            filename="build-pipeline.txt"
          />
        </section>

        <section id="monorepo-artifacts" className={styles.section}>
          <SectionLabel level="h3" number="§03" name="ARTIFACTS" title="Docs and configs" kicker={`${ARTIFACTS.length} documents`} className={styles.labelFlush} />
          <Grid spacing="0" columns={3}>
            {ARTIFACTS.map((a) => (
              <StatCard key={a.title} label={a.eyebrow} value={a.title} body={a.body} href={a.href} titleSize="xl" />
            ))}
          </Grid>
        </section>
      </div>
    </>
  )
}
