/**
 * @sugartown/storybook-docs — shared Storybook documentation-page helpers.
 *
 * These lived at `apps/storybook/.storybook/helpers/` until SUG-254. That
 * location made every consumer outside `apps/storybook` an architectural
 * boundary violation: `packages/design-system`'s own stories reached across
 * five directory levels into `apps/` to render their Guidelines pages, which is
 * exactly what `boundaries.js` Rule 1 forbids. The rule never fired, so the
 * violations accrued unnoticed for 176 days.
 *
 * Moving the helpers into a package resolves the tension rather than exempting
 * it: a package importing a package is not a boundary crossing, so no rule
 * exception is needed and `apps/storybook` stays an app.
 *
 * Deliberately NOT folded into `packages/design-system`: that package's
 * tsconfig includes `src/`, so doc scaffolding would emit `.d.ts` into its
 * public build output unless given a second exclude — another "inside `src/`
 * but invisible to the build" island, which is the same shape of blind spot
 * that hid these violations to begin with.
 *
 * Source-only by design: `main`/`types` point straight at TypeScript. Every
 * consumer (Storybook via Vite, and tsc for typecheck) compiles from source, so
 * a build step would add a staleness failure mode for zero benefit.
 */

export {
  DocSection,
  OverviewItem,
  NotItem,
  DoDontGrid,
  DoGroup,
  DontGroup,
  DoItem,
  DontItem,
  A11yItem,
  TokenGroup,
  TokenRow,
  RelatedCard,
  ChangelogEntry,
  ChangelogItem,
  AiGeneratedFooter,
  docStyles,
} from './docs'

export { ChipGuidelinesPage } from './ChipDocs'
