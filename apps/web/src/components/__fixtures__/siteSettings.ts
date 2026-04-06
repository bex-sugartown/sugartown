/**
 * Shared Storybook fixture data for site-level components.
 *
 * Mirrors the siteSettings shape returned by Sanity GROQ queries.
 * Used by Header, Footer, MobileNav, Preheader stories.
 */

export const NAV_ITEMS = [
  {
    label: 'Work',
    linkType: 'archive',
    archiveRef: { slug: 'case-studies' },
  },
  {
    label: 'Library',
    linkType: 'archive',
    archiveRef: { slug: 'knowledge-graph' },
    children: [
      { label: 'Knowledge Graph', linkType: 'archive', archiveRef: { slug: 'knowledge-graph' } },
      { label: 'Articles', linkType: 'archive', archiveRef: { slug: 'articles' } },
    ],
  },
  {
    label: 'Platform',
    linkType: 'internal',
    internalPage: { slug: 'platform' },
  },
  {
    label: 'About',
    linkType: 'internal',
    internalPage: { slug: 'about' },
  },
  {
    label: 'Services',
    linkType: 'internal',
    internalPage: { slug: 'services' },
  },
];

export const HEADER_CTA = {
  url: '/contact',
  label: 'Get in Touch',
  style: 'primary',
  openInNewTab: false,
};

export const FOOTER_COLUMNS = [
  {
    header: 'Navigate',
    items: [
      { label: 'Work', linkType: 'archive', archiveRef: { slug: 'case-studies' } },
      { label: 'Knowledge Graph', linkType: 'archive', archiveRef: { slug: 'knowledge-graph' } },
      { label: 'Articles', linkType: 'archive', archiveRef: { slug: 'articles' } },
      { label: 'About', linkType: 'internal', internalPage: { slug: 'about' } },
    ],
  },
  {
    header: 'Legal',
    items: [
      { label: 'Privacy Policy', linkType: 'internal', internalPage: { slug: 'privacy' } },
      { label: 'Terms of Use', linkType: 'internal', internalPage: { slug: 'terms' } },
      { label: 'Accessibility', linkType: 'internal', internalPage: { slug: 'accessibility' } },
    ],
  },
];

export const SOCIAL_LINKS = [
  { icon: 'github', url: 'https://github.com/sugartown', label: 'GitHub' },
  { icon: 'linkedin', url: 'https://linkedin.com/in/sugartown', label: 'LinkedIn' },
  { icon: 'bluesky', url: 'https://bsky.app/profile/sugartown', label: 'Bluesky' },
];

export const MOCK_LOGO = {
  asset: { _id: 'image-logo-sugartown', url: 'https://cdn.sanity.io/images/poalmzla/production/1a3444ae81dee63959d0386215aba2676f1979f4-780x317.png' },
  alt: 'Sugartown',
};

export const SITE_SETTINGS = {
  siteLogo: MOCK_LOGO,
  siteTitle: 'Sugartown Digital',
  tagline: 'Content-driven digital experiences',
  primaryNav: { items: NAV_ITEMS },
  headerCta: HEADER_CTA,
  preheader: {
    message: 'New: Knowledge Graph v2 is live',
    url: '/knowledge-graph',
    label: 'Explore',
    backgroundColor: 'pink',
    publishAt: '2025-01-01T00:00:00Z',
    unpublishAt: '2030-12-31T23:59:59Z',
  },
  footerColumns: FOOTER_COLUMNS,
  socialLinks: SOCIAL_LINKS,
  copyrightText: 'All rights reserved.',
};
