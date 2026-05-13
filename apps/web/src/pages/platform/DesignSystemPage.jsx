import SeoHead from '../../components/SeoHead'
import usePlatformHero from '../../components/PlatformLayout/PlatformHero'
import Tile from '../../design-system/components/tile/Tile'
import SectionContainer from '../../design-system/components/section-container/SectionContainer'
import SectionLabel from '../../design-system/components/section-label/SectionLabel'
import Card from '../../design-system/components/card/Card'
import { MermaidDiagram } from '../../components/PageSections'
import { PLATFORM_ROUTES, TRUST_LINKS, FIGJAM_URLS } from '../../lib/routes'
import stats from '../../generated/stats.json'
import styles from './PlatformHubPage.module.css'

const ds = stats.ds ?? {}

const REGISTRY_PREVIEW = [
  { name: 'Card', desc: 'Content surface — folio, metadata, listing, and KPI variants.' },
  { name: 'Tile', desc: 'Labeled metric display. Replaces StatTile + TickerCard.' },
  { name: 'SectionLabel', desc: '3-zone folio row: number · name (mono) | Cormorant title | kicker.' },
]

const ARTIFACTS = [
  {
    eyebrow: 'PRD',
    title: 'Design System PRD',
    body: 'Pink Moon v3.0 — sharp surfaces, hot colour signal, EB Garamond headings, zero radius.',
    href: 'https://github.com/bex-sugartown/sugartown/blob/main/docs/briefs/design-system/design-system-prd.md',
  },
  {
    eyebrow: 'Brand',
    title: 'Pink Moon Manifesto',
    body: 'Visual direction, typographic voice, and colour philosophy for the Ledger Tradition aesthetic.',
    href: 'https://github.com/bex-sugartown/sugartown/blob/main/docs/brand/brand-voice-guide.md',
  },
  {
    eyebrow: 'Conventions',
    title: 'Token Naming',
    body: 'Concept-not-placement naming rules for --st-* tokens. Covers semantic, primitive, and theme layers.',
    href: 'https://github.com/bex-sugartown/sugartown/blob/main/docs/conventions/token-naming.md',
  },
  {
    eyebrow: 'Ruleset',
    title: 'DS Ruleset (CLAUDE.md)',
    body: 'Token-first rule, fallback syntax rule, theme cascade audit, and status chip convention.',
    href: 'https://github.com/bex-sugartown/sugartown/blob/main/CLAUDE.md',
  },
]

const TOKEN_DIAGRAM = {
  _key: 'ds-token-architecture',
  code: `flowchart TB
    BASE["Base Tokens\\ncolor.pink.500\\nradius.sm\\nspace.4"] -->|"map to intent"| SEMANTIC["Semantic Tokens\\ncolor.brand.primary\\ncolor.bg.canvas\\nradius.button"]
    SEMANTIC -->|"scope to surface"| COMPONENT["Component Tokens\\ncard.bg\\ncard.radius\\npill.text"]
    COMPONENT -->|"consumed by"| RENDER["React Components\\nCard · Button · Pill\\nCallout · Citation"]

    style BASE fill:#1a2436,stroke:#7b82a8,color:#f5f7fa
    style SEMANTIC fill:#1a2436,stroke:#ff247d,color:#f5f7fa
    style COMPONENT fill:#1a2436,stroke:#2bd4aa,color:#f5f7fa
    style RENDER fill:#1a2436,stroke:#D1FF1D,color:#f5f7fa`,
  width: null,
  caption: 'Token architecture',
}

export default function DesignSystemPage() {
  usePlatformHero({
    title: 'Design System',
    subtitle: 'Pink Moon — sharp neutral surfaces, hot colour signal, and a Ledger Tradition typographic identity. Three packages, two themes, one token pipeline.',
  })
  return (
    <>
      <SeoHead
        title="Design System — Platform"
        description="Pink Moon design system — components, tokens, themes, and architecture for sugartown.io."
      />
      <div className={styles.hub}>

        <SectionContainer className={styles.statsSection}>
          <Tile
            label="Design tokens"
            value={ds.tokens?.total ?? '—'}
            legend
            bar={ds.tokens?.primitives != null ? {
              segments: [
                { label: 'Primitive',  value: ds.tokens.primitives, color: 'var(--st-color-accent)' },
                { label: 'Semantic',   value: ds.tokens.semantic,   color: 'var(--st-color-seafoam)' },
                { label: 'Component',  value: ds.tokens.component,  color: 'var(--st-color-violet)' },
              ],
            } : undefined}
            href={TRUST_LINKS.storybook}
          />
          <Tile
            label="DS components"
            value={ds.dsComponents ?? '—'}
            sub={ds.webAdapters != null ? `+ ${ds.webAdapters} web adapters` : undefined}
            href={PLATFORM_ROUTES.dsRegistry}
          />
          <Tile
            label="Story coverage"
            value={ds.dsComponents ? `${Math.round((ds.dsComponentsWithStories / ds.dsComponents) * 100)}%` : '—'}
            sub={ds.dsComponentsWithStories != null && ds.dsComponents != null ? `${ds.dsComponentsWithStories} of ${ds.dsComponents} DS components` : undefined}
            href={TRUST_LINKS.storybook}
          />
          <Tile
            label="Token compliance"
            value={ds.tokenCompliance != null ? `${ds.tokenCompliance}%` : '—'}
            sub="CSS var refs using --st-* tokens"
          />
        </SectionContainer>

        <section id="token-architecture" className={styles.section}>
          <SectionLabel name="Token architecture" kicker="Base → semantic → component" />
          <MermaidDiagram section={TOKEN_DIAGRAM} />
        </section>

        <section id="component-registry" className={styles.section}>
          <SectionLabel name="Component registry" kicker="Preview — 3 of 42" />
          <div className={styles.registryTeaser}>
            {REGISTRY_PREVIEW.map((c) => (
              <div key={c.name} className={styles.registryRow}>
                <span className={styles.registryName}>{c.name}</span>
                <span className={styles.registryDesc}>{c.desc}</span>
              </div>
            ))}
            <div className={styles.registryFooter}>
              <a href={PLATFORM_ROUTES.dsRegistry}>Full registry → /platform/design-system/registry (SUG-103)</a>
            </div>
          </div>
        </section>

        <section id="architecture-figjam" className={styles.section}>
          <SectionLabel name="Architecture — FigJam" kicker="Component layer diagram" />
          <iframe
            className={styles.figJam}
            height="450"
            src={FIGJAM_URLS.dsArchitecture}
            allowFullScreen
            loading="lazy"
            title="Sugartown Design System Architecture — FigJam"
          />
        </section>

        <section id="storybook" className={styles.section}>
          <SectionLabel name="Storybook" kicker="Live component catalogue" />
          <div className={styles.trustLinks}>
            <a href={TRUST_LINKS.storybook} className={styles.trustLink} target="_blank" rel="noreferrer">
              pinkmoon.sugartown.io ↗
            </a>
          </div>
        </section>

        <section id="ds-artifacts" className={styles.section}>
          <SectionLabel name="Artifacts" className={styles.labelFlush} />
          <SectionContainer columns={2}>
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
