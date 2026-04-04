import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

const sugartownTheme = create({
  base: 'dark',

  // Brand
  brandTitle: 'Sugartown Pink — Design System',
  brandUrl: 'https://sugartown.io',
  brandTarget: '_blank',

  // Colours — Sugartown dark palette
  colorPrimary: '#FF247D',    // --st-color-brand-primary (pink)
  colorSecondary: '#2BD4AA',  // --st-color-brand-secondary (green)

  // UI chrome
  appBg: '#0D1226',           // --st-color-bg (dark navy)
  appContentBg: '#111833',    // slightly lighter nav/content bg
  appPreviewBg: '#0D1226',
  appBorderColor: 'rgba(255, 255, 255, 0.08)',
  appBorderRadius: 6,

  // Typography
  fontBase: '"Fira Sans", system-ui, -apple-system, sans-serif',
  fontCode: '"Fira Code", "JetBrains Mono", monospace',

  // Text
  textColor: 'rgba(255, 255, 255, 0.85)',
  textInverseColor: '#0D1226',
  textMutedColor: 'rgba(255, 255, 255, 0.5)',

  // Toolbar
  barTextColor: 'rgba(255, 255, 255, 0.7)',
  barHoverColor: '#FF247D',
  barSelectedColor: '#FF247D',
  barBg: '#0D1226',

  // Inputs
  inputBg: '#111833',
  inputBorder: 'rgba(255, 255, 255, 0.12)',
  inputTextColor: 'rgba(255, 255, 255, 0.85)',
  inputBorderRadius: 4,

  // Booleans
  booleanBg: '#111833',
  booleanSelectedBg: '#FF247D',

  // Button
  buttonBg: '#FF247D',
  buttonBorder: 'transparent',
});

addons.setConfig({
  theme: sugartownTheme,
  sidebar: {
    showRoots: true,
  },
});
