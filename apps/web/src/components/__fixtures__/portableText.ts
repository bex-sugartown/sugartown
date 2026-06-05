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

/** Full text options — all prose block types, no image/table/citation */
export const allTextOptions = [
  {
    _type: 'block', _key: 'h2a', style: 'h2', markDefs: [],
    children: [{ _type: 'span', _key: 's1', text: 'H2 Section Heading', marks: [] }],
  },
  {
    _type: 'block', _key: 'p1', style: 'normal', markDefs: [],
    children: [
      { _type: 'span', _key: 's2', text: 'Normal paragraph. Design systems are ', marks: [] },
      { _type: 'span', _key: 's3', text: 'opinionated', marks: ['strong'] },
      { _type: 'span', _key: 's4', text: ' by definition — they encode ', marks: [] },
      { _type: 'span', _key: 's5', text: 'editorial decisions', marks: ['em'] },
      { _type: 'span', _key: 's6', text: ' about spacing, colour, and type. The token ', marks: [] },
      { _type: 'span', _key: 's7', text: '--st-color-brand-primary', marks: ['code'] },
      { _type: 'span', _key: 's8', text: ' encodes one such decision.', marks: [] },
    ],
  },
  {
    _type: 'block', _key: 'h3a', style: 'h3', markDefs: [],
    children: [{ _type: 'span', _key: 's9', text: 'H3 Subsection', marks: [] }],
  },
  {
    _type: 'block', _key: 'p2', style: 'normal',
    markDefs: [{ _type: 'link', _key: 'lnk1', href: 'https://sugartown.io' }],
    children: [
      { _type: 'span', _key: 's10', text: 'A paragraph with an ', marks: [] },
      { _type: 'span', _key: 's11', text: 'inline link', marks: ['lnk1'] },
      { _type: 'span', _key: 's12', text: ' and a mix of ', marks: [] },
      { _type: 'span', _key: 's13', text: 'bold', marks: ['strong'] },
      { _type: 'span', _key: 's14', text: ' and ', marks: [] },
      { _type: 'span', _key: 's15', text: 'italic', marks: ['em'] },
      { _type: 'span', _key: 's16', text: ' text.', marks: [] },
    ],
  },
  {
    _type: 'block', _key: 'h4a', style: 'h4', markDefs: [],
    children: [{ _type: 'span', _key: 's17', text: 'H4 Detail Heading', marks: [] }],
  },
  {
    _type: 'block', _key: 'bq1', style: 'blockquote', markDefs: [],
    children: [{ _type: 'span', _key: 's18', text: 'Blockquote: the best interfaces feel inevitable — as if they could have been no other way.', marks: [] }],
  },
  {
    _type: 'block', _key: 'ul1', style: 'normal', listItem: 'bullet', level: 1, markDefs: [],
    children: [{ _type: 'span', _key: 's19', text: 'Unordered list item one', marks: [] }],
  },
  {
    _type: 'block', _key: 'ul2', style: 'normal', listItem: 'bullet', level: 1, markDefs: [],
    children: [{ _type: 'span', _key: 's20', text: 'Unordered list item two', marks: [] }],
  },
  {
    _type: 'block', _key: 'ul3', style: 'normal', listItem: 'bullet', level: 1, markDefs: [],
    children: [{ _type: 'span', _key: 's21', text: 'Unordered list item three', marks: [] }],
  },
  {
    _type: 'block', _key: 'ol1', style: 'normal', listItem: 'number', level: 1, markDefs: [],
    children: [{ _type: 'span', _key: 's22', text: 'Ordered list item one', marks: [] }],
  },
  {
    _type: 'block', _key: 'ol2', style: 'normal', listItem: 'number', level: 1, markDefs: [],
    children: [{ _type: 'span', _key: 's23', text: 'Ordered list item two', marks: [] }],
  },
  {
    _type: 'block', _key: 'ol3', style: 'normal', listItem: 'number', level: 1, markDefs: [],
    children: [{ _type: 'span', _key: 's24', text: 'Ordered list item three', marks: [] }],
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
