/**
 * /dev/grid — Grid primitive test bench
 * Dev-only page. Uses real DS components, tokens, and CSS.
 * Not linked in nav; access directly at /dev/grid.
 *
 * SUG-120 — Grid as canonical layout primitive.
 * Section 1: Structural (PlaceholderTile children — spacing modes, column counts)
 * Section 2: Composition patterns (real DS components, naming convention: "N-col Grid + Component")
 */
import Grid from '../../design-system/components/grid/Grid'
import SectionLabel from '../../design-system/components/section-label/SectionLabel'
import Tile from '../../design-system/components/tile/Tile'
import Card from '../../design-system/components/card/Card'
import Callout from '../../design-system/components/callout/Callout'
import styles from './TablesDevPage.module.css'
import pageStyles from './GridDevPage.module.css'

function Section({ id, label, children }) {
  return (
    <section id={id} className={styles.section}>
      <h2 className={styles.sectionTitle}>{label}</h2>
      {children}
    </section>
  )
}

function Sub({ label, children, debug = false }) {
  return (
    <div className={pageStyles.sub}>
      <p className={pageStyles.subLabel}>{label}</p>
      {debug ? <div className={pageStyles.gridDebug}>{children}</div> : children}
    </div>
  )
}

export default function GridDevPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.badge}>DEV</p>
        <h1 className={styles.title}>Grid component test bench</h1>
        <p className={styles.subtitle}>Grid primitive · Real tokens · Real CSS. Not linked in nav.</p>
      </header>

      <nav className={styles.nav}>
        <span className={pageStyles.navGroup}>Structural</span>
        <a href="#spacing-lg">spacing=lg (open gap)</a>
        <a href="#spacing-zero">spacing=0 (hairline)</a>
        <a href="#spacing-accent">spacing=0 + accentTop</a>
        <a href="#columns">Column counts</a>
        <span className={pageStyles.navGroup}>Composition</span>
        <a href="#three-col-tile">3-col Grid + Tile</a>
        <a href="#four-col-tile">4-col Grid + Tile (artifact mode)</a>
        <a href="#three-col-card">3-col Grid + Card</a>
        <a href="#one-col-callout">1-col Grid + Callout</a>
        <a href="#cwv">CWV field metrics</a>
      </nav>

      <main className={styles.main}>

        {/* ── Section 1: Structural ─────────────────────────────────── */}

        <Section id="spacing-lg" label="Grid — spacing=lg (open gap, auto-fit columns)">
          <Sub label='spacing="lg" — 32px open gap, auto-fit minmax(200px, 1fr)' debug>
            <Grid spacing="lg">
              <Tile label="A" value="1" titleSize="2xl" labelColor="ink" />
              <Tile label="B" value="2" titleSize="2xl" labelColor="ink" />
              <Tile label="C" value="3" titleSize="2xl" labelColor="ink" />
            </Grid>
          </Sub>
        </Section>

        <Section id="spacing-zero" label="Grid — spacing=0 (hairline, bg-through-gap)">
          <Sub label='spacing="0" — 1px hairline dividers via bg-through-gap, no accentTop' debug>
            <Grid spacing="0">
              <Tile label="A" value="1" titleSize="2xl" labelColor="ink" />
              <Tile label="B" value="2" titleSize="2xl" labelColor="ink" />
              <Tile label="C" value="3" titleSize="2xl" labelColor="ink" />
            </Grid>
          </Sub>
        </Section>

        <Section id="spacing-accent" label="Grid — spacing=0 + accentTop (ruled section header)">
          <Sub label='spacing="0" accentTop — 2px brand rule top, 1px box border, hairline dividers' debug>
            <Grid spacing="0" accentTop>
              <Tile label="A" value="1" titleSize="2xl" labelColor="ink" />
              <Tile label="B" value="2" titleSize="2xl" labelColor="ink" />
              <Tile label="C" value="3" titleSize="2xl" labelColor="ink" />
            </Grid>
          </Sub>
        </Section>

        <Section id="columns" label="Grid — fixed column counts">
          <Sub label="columns={2}" debug>
            <Grid spacing="0" accentTop columns={2}>
              <Tile label="A" value="1" titleSize="2xl" labelColor="ink" />
              <Tile label="B" value="2" titleSize="2xl" labelColor="ink" />
            </Grid>
          </Sub>
          <Sub label="columns={3}" debug>
            <Grid spacing="0" accentTop columns={3}>
              <Tile label="A" value="1" titleSize="2xl" labelColor="ink" />
              <Tile label="B" value="2" titleSize="2xl" labelColor="ink" />
              <Tile label="C" value="3" titleSize="2xl" labelColor="ink" />
            </Grid>
          </Sub>
          <Sub label="columns={4}" debug>
            <Grid spacing="0" accentTop columns={4}>
              <Tile label="A" value="1" titleSize="2xl" labelColor="ink" />
              <Tile label="B" value="2" titleSize="2xl" labelColor="ink" />
              <Tile label="C" value="3" titleSize="2xl" labelColor="ink" />
              <Tile label="D" value="4" titleSize="2xl" labelColor="ink" />
            </Grid>
          </Sub>
        </Section>

        {/* ── Section 2: Composition patterns ──────────────────────── */}

        <Section id="three-col-tile" label="3-col Grid + Tile (hairline, accentTop)">
          <Grid spacing="0" accentTop columns={3}>
            <Tile label="Time on site"     value="38"  unit="%" sub="up from baseline"  titleSize="display" labelColor="ink" />
            <Tile label="Editorial uplift" value="2.4" unit="×"                         titleSize="display" labelColor="ink" />
            <Tile label="Filter match"     value="91"  unit="%" sub="within 2 filters"  titleSize="display" labelColor="ink" />
          </Grid>
        </Section>

        <Section id="four-col-tile" label="4-col Grid + Tile — artifact mode (hairline, accentTop, foot)">
          <Grid spacing="0" accentTop columns={4}>
            <Tile label="Brief"       value="IA Brief"          foot="Markdown →" href="https://example.com" titleSize="2xl" labelColor="ink" />
            <Tile label="Conventions" value="CLAUDE.md"         foot="Markdown →" href="https://example.com" titleSize="2xl" labelColor="ink" />
            <Tile label="Ethics"      value="AI Ethics"         foot="Markdown →" href="https://example.com" titleSize="2xl" labelColor="ink" />
            <Tile label="Prompt"      value="Release Assistant" foot="Prompt →"   href="https://example.com" titleSize="2xl" labelColor="ink" />
          </Grid>
        </Section>

        <Section id="three-col-card" label="3-col Grid + Card (open gap)">
          <Grid spacing="lg" columns={3}>
            <Card title="Design System" eyebrow="Platform" excerpt="Token pipeline, component registry, and Storybook coverage." />
            <Card title="Content Lake" eyebrow="CMS" excerpt="Sanity v5 schema, GROQ projections, and live preview." />
            <Card title="Monorepo" eyebrow="Tooling" excerpt="pnpm workspaces, Turbo, and shared packages." />
          </Grid>
        </Section>

        <Section id="one-col-callout" label="1-col Grid + Callout (open gap)">
          <Grid spacing="lg" columns={1}>
            <Callout title="Default callout" variant="default">Body text goes here. Use Grid as the outer container when callouts stack with other section types.</Callout>
            <Callout title="Info callout" variant="info">Info variant — pink accent.</Callout>
            <Callout title="Tip callout" variant="tip">Tip variant — violet accent.</Callout>
          </Grid>
        </Section>

        <Section id="cwv" label="CWV field metrics — 3-col Grid + Tile (real-world example)">
          <SectionLabel name="Core Web Vitals" kicker="p75 · field data · desktop" />
          <Grid spacing="0" accentTop columns={3}>
            <Tile label="LCP" value="1.9s"  sub="Good threshold: < 2.5s"  chip="measurement" titleSize="2xl" labelColor="ink" />
            <Tile label="CLS" value="0.040" sub="Good threshold: < 0.1"   chip="measurement" titleSize="2xl" labelColor="ink" />
            <Tile label="INP" value="160ms" sub="Good threshold: < 200ms" chip="measurement" titleSize="2xl" labelColor="ink" />
          </Grid>
        </Section>

      </main>
    </div>
  )
}
