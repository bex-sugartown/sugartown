// The axe rule tags both accessibility gates check: the page-level gate
// (tests/smoke/a11y.spec.ts, ST-159) and the Storybook gate
// (apps/storybook/.storybook/preview.ts, #50). One list, so the two cannot drift.
// Import-free, so Storybook's preview can load it too.
// Automated rules catch a minority of WCAG criteria; a pass is not a conformance claim (#153).
export const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']
