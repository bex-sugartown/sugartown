import { Link } from 'react-router-dom'
import SeoHead from '../../components/SeoHead'
import usePlatformHero from '../../components/PlatformLayout/PlatformHero'
import SectionLabel from '../../design-system/components/section-label/SectionLabel'
import Callout from '../../design-system/components/callout/Callout'
import Grid from '../../design-system/components/grid/Grid'
import StatCard from '../../components/StatCard'
import CodeBlock from '../../design-system/components/codeblock/CodeBlock'
import SchemaERD from '../../components/SchemaERD/SchemaERD'
import { entities, relationships } from '../../data/schemaManifest'
import { FIGJAM_URLS, PLATFORM_ROUTES } from '../../lib/routes'
import styles from './PlatformHubPage.module.css'

const ARTIFACTS = [
  {
    eyebrow: 'PRD',
    title: 'CMS PRD',
    body: 'Product requirements for the Sanity CMS layer — schema strategy, section builder, and content types.',
    href: 'https://github.com/bex-sugartown/sugartown/blob/main/docs/briefs/cms-prd.md',
  },
  {
    eyebrow: 'Conventions',
    title: 'Schema Conventions',
    body: 'Field naming, preview blocks, paired schema rules, and taxonomy pre-flight checks.',
    href: 'https://github.com/bex-sugartown/sugartown/blob/main/docs/conventions/schema-conventions.md',
  },
  {
    eyebrow: 'Conventions',
    title: 'Image Naming',
    body: 'Asset upload naming convention — docType prefix, subject, descriptor, index.',
    href: 'https://github.com/bex-sugartown/sugartown/blob/main/docs/conventions/image-naming-convention.md',
  },
  {
    eyebrow: 'Audit',
    title: 'Structured Content Audit',
    body: 'Inventory of all content types, field coverage, and migration decisions.',
    href: 'https://github.com/bex-sugartown/sugartown/blob/main/docs/briefs/structured-content-audit.md',
  },
]

export default function CmsPage() {
  usePlatformHero({
    title: 'CMS',
    subtitle: 'Content architecture and schema design for the Sanity layer. The Schema ERD is the canonical content model document.',
  })
  return (
    <>
      <SeoHead
        title="CMS — Platform"
        description="Content architecture and schema design for the Sanity CMS layer powering sugartown.io."
      />
      <div className={styles.hub}>

        <section id="schema-erd" className={styles.section}>
          <SectionLabel level="h3" number="§01" name="SCHEMA ERD" title="Content types and their relations" kicker="Built from Sanity schemas" />
          <SchemaERD entities={entities} relationships={relationships} />
        </section>

        <section id="schema-architecture" className={styles.section}>
          <SectionLabel level="h3" number="§02" name="SCHEMA ARCHITECTURE" title="Visual architecture overview" kicker="FigJam" />
          <iframe
            className={styles.figJam}
            height="450"
            src={FIGJAM_URLS.cmsContentModel}
            allowFullScreen
            loading="lazy"
            title="Sugartown Sanity.io Schema Architecture — FigJam"
          />
        </section>

        <section id="relationships" className={styles.section}>
          <SectionLabel level="h3" number="§03" name="RELATIONSHIPS" title="How documents link to taxonomy" kicker="Document → taxonomy" />
          <CodeBlock
            code={`article   ──── tags[]     ──► tag\narticle   ──── tools[]    ──► tool\narticle   ──── authors[]  ──► person\narticle   ──── projects[] ──► project\ncaseStudy ──── tags[]     ──► tag\ncaseStudy ──── tools[]    ──► tool\ncaseStudy ──── client     ──► person\nnode      ──── tags[]     ──► tag\nnode      ──── tools[]    ──► tool\npage      ──── sections[] ──► section builder objects`}
            language="text"
            filename="relationships.txt"
          />
        </section>

        <section className={styles.section}>
          <Callout title="Content Models — field-level reference">
            Field names, types, required flags, enum values, and display-field rules for every doc type.{' '}
            <Link to={PLATFORM_ROUTES.cmsContentModels}>Open Content Models →</Link>
          </Callout>
        </section>

        <section id="cms-artifacts" className={styles.section}>
          <SectionLabel level="h3" number="§04" name="ARTIFACTS" title="PRDs, conventions, decisions" kicker={`${ARTIFACTS.length} documents`} className={styles.labelFlush} />
          <Grid spacing="0" accentTop accentColor="ink" columns={2}>
            {ARTIFACTS.map((a) => (
              <StatCard key={a.title} label={a.eyebrow} value={a.title} body={a.body} href={a.href} titleSize="xl" />
            ))}
          </Grid>
        </section>
      </div>
    </>
  )
}
