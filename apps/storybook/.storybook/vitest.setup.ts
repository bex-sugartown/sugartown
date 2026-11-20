// #50: hands the Vitest project's theme to preview.ts. vitest.config.ts provides
// `a11yTheme` per project; a per-project `define` does not work, because both projects
// share one compiled preview.ts (measured 2026-11-20: the dark project rendered light).
import { inject } from 'vitest';

declare module 'vitest' {
  export interface ProvidedContext {
    a11yTheme: string;
  }
}

(globalThis as { __STORYBOOK_A11Y_THEME__?: string }).__STORYBOOK_A11Y_THEME__ = inject('a11yTheme');
