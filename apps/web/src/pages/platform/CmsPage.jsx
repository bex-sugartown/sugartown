import { Link } from 'react-router-dom'
import SeoHead from '../../components/SeoHead'
import SectionLabel from '../../design-system/components/section-label/SectionLabel'
import Grid from '../../design-system/components/grid/Grid'
import Card from '../../design-system/components/card/Card'
import SchemaERD from '../../components/SchemaERD/SchemaERD'
import { entities, relationships } from '../../data/schemaManifest'
import { PLATFORM_ROUTES, FIGJAM_URLS } from '../../lib/routes'
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
  return (
    <>
      <SeoHead
        title="CMS — Platform"
        description="Content architecture and schema design for the Sanity CMS layer powering sugartown.io."
      />
      <div className={styles.hub}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            <Link to={PLATFORM_ROUTES.root} className={styles.eyebrowLink}>Platform</Link>
          </p>
          <h1 className={styles.heading}>CMS</h1>
          <p className={styles.intro}>
            Content architecture and schema design for the Sanity layer.
            The Schema ERD is the canonical content model document — interactive explorer,
            FigJam visual, and relationship diagram all below.
          </p>
        </header>

        <section id="schema-erd" className={styles.section}>
          <SectionLabel name="Schema ERD" kicker="Interactive explorer" />
          <SchemaERD entities={entities} relationships={relationships} />
        </section>

        <section id="content-model" className={styles.section}>
          <SectionLabel name="Content model — FigJam" kicker="Visual overview" />
          <iframe
            className={styles.figJam}
            height="450"
            src={FIGJAM_URLS.cmsContentModel}
            allowFullScreen
            loading="lazy"
            title="Sugartown Sanity.io Content Model — FigJam"
          />
        </section>

        <section id="relationships" className={styles.section}>
          <SectionLabel name="Relationships" kicker="Document → taxonomy" />
          <div className={styles.diagramBlock}>
            {`article   ──── tags[]     ──► tag
article   ──── tools[]    ──► tool
article   ──── authors[]  ──► person
article   ──── projects[] ──► project
caseStudy ──── tags[]     ──► tag
caseStudy ──── tools[]    ──► tool
caseStudy ──── client     ──► person
node      ──── tags[]     ──► tag
node      ──── tools[]    ──► tool
page      ──── sections[] ──► section builder objects`}
          </div>
        </section>

        <section id="cms-artifacts" className={styles.section}>
          <SectionLabel name="Artifacts" className={styles.labelFlush} />
          <Grid spacing="0" accentTop>
            {ARTIFACTS.map((a) => (
              <Card
                key={a.title}
                eyebrow={a.eyebrow}
                title={a.title}
                excerpt={a.body}
                href={a.href}
              />
            ))}
          </Grid>
        </section>
      </div>
    </>
  )
}
