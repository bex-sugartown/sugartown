/**
 * Mock PortableText block fixtures for Storybook stories.
 * These represent common content patterns without requiring Sanity.
 */

/** Simple paragraph block */
export const simpleParagraph = [
  {
    _type: 'block',
    _key: 'p1',
    style: 'normal',
    children: [
      {
        _type: 'span',
        _key: 's1',
        text: 'Token-driven design systems reduce visual inconsistency by constraining every surface to a shared set of values. When a component references ',
        marks: [],
      },
      {
        _type: 'span',
        _key: 's2',
        text: '--st-color-brand-primary',
        marks: ['code'],
      },
      {
        _type: 'span',
        _key: 's3',
        text: ' instead of a hex literal, the entire system updates in one edit.',
        marks: [],
      },
    ],
    markDefs: [],
  },
]

/** Multiple paragraphs with headings */
export const richContent = [
  {
    _type: 'block',
    _key: 'h2-1',
    style: 'h2',
    children: [
      { _type: 'span', _key: 'h2s1', text: 'Why Structured Content Matters', marks: [] },
    ],
    markDefs: [],
  },
  {
    _type: 'block',
    _key: 'p2',
    style: 'normal',
    children: [
      {
        _type: 'span',
        _key: 'p2s1',
        text: 'Structured content separates meaning from presentation. A ',
        marks: [],
      },
      { _type: 'span', _key: 'p2s2', text: 'headless CMS', marks: ['strong'] },
      {
        _type: 'span',
        _key: 'p2s3',
        text: ' stores content as typed objects — not HTML blobs — so the same editorial work can render as a web page, a mobile screen, or an API response.',
        marks: [],
      },
    ],
    markDefs: [],
  },
  {
    _type: 'block',
    _key: 'h3-1',
    style: 'h3',
    children: [
      { _type: 'span', _key: 'h3s1', text: 'The Content Graph Approach', marks: [] },
    ],
    markDefs: [],
  },
  {
    _type: 'block',
    _key: 'p3',
    style: 'normal',
    children: [
      {
        _type: 'span',
        _key: 'p3s1',
        text: 'When content types reference each other through typed relations rather than embedded HTML links, the content graph becomes queryable, versionable, and composable across surfaces.',
        marks: [],
      },
    ],
    markDefs: [],
  },
]

/** Content with a link mark */
export const contentWithLink = [
  {
    _type: 'block',
    _key: 'pl1',
    style: 'normal',
    children: [
      { _type: 'span', _key: 'pls1', text: 'Read more about ', marks: [] },
      { _type: 'span', _key: 'pls2', text: 'content modelling best practices', marks: ['link-1'] },
      { _type: 'span', _key: 'pls3', text: ' in the Sanity documentation.', marks: [] },
    ],
    markDefs: [
      {
        _type: 'link',
        _key: 'link-1',
        href: 'https://www.sanity.io/docs/content-modelling',
      },
    ],
  },
]

/** Card body with citation ref */
export const bodyWithCitation = [
  {
    _type: 'block',
    _key: 'cb1',
    style: 'normal',
    children: [
      {
        _type: 'span',
        _key: 'cbs1',
        text: 'Prompt engineering for structured output requires careful attention to schema constraints',
        marks: ['cite-1'],
      },
      {
        _type: 'span',
        _key: 'cbs2',
        text: '. The model must be guided toward producing valid JSON that matches the target type.',
        marks: [],
      },
    ],
    markDefs: [
      {
        _type: 'citationRef',
        _key: 'cite-1',
        index: 1,
        source: 'Anthropic Documentation',
        url: 'https://docs.anthropic.com',
      },
    ],
  },
]
