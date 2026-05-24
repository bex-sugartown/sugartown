import esbuild from 'esbuild';
import cssModulesPlugin from 'esbuild-css-modules-plugin';

// Build the DS package with esbuild directly rather than tsup. tsup's built-in
// CSS handling intercepts *.module.css imports and hands the JS an empty {},
// so styles.button is undefined and components render unstyled. Driving esbuild
// ourselves lets the CSS-Modules plugin (Lightning CSS) be the only CSS handler:
// it emits scoped class names in dist/index.css plus a matching name map as the
// module's default export. `packages: 'external'` keeps react, lucide, prismjs
// etc. out of the bundle (same as tsup's dependency externalisation).
//
// Type declarations (dist/index.d.ts) are NOT regenerated here — DTS is blocked by
// a lucide-react x React 19 @types skew (separate finding). The last-good d.ts is
// retained until that skew is resolved.

const shared = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  packages: 'external',
  jsx: 'automatic',
  sourcemap: false,
  plugins: [cssModulesPlugin({ force: true, inject: false })],
  logLevel: 'info',
};

const watch = process.argv.includes('--watch');

if (watch) {
  const ctxEsm = await esbuild.context({ ...shared, format: 'esm', outfile: 'dist/index.mjs' });
  const ctxCjs = await esbuild.context({ ...shared, format: 'cjs', outfile: 'dist/index.js' });
  await Promise.all([ctxEsm.watch(), ctxCjs.watch()]);
  console.log('watching…');
} else {
  await esbuild.build({ ...shared, format: 'esm', outfile: 'dist/index.mjs' });
  await esbuild.build({ ...shared, format: 'cjs', outfile: 'dist/index.js' });
}
