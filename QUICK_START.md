# Sugartown Monorepo - Quick Start Guide

## 🎯 Your Sanity Configuration

✅ **CONFIGURED AND READY**

```
Project ID: poalmzla
Organization ID: oOTVj6BWp
Dataset: production
```

## 🚀 Getting Started

### 1. Extract and Install

```bash
tar -xzf sugartown-monorepo.tar.gz
cd sugartown
pnpm install
```

### 2. Run Development Servers

**Option A: Run Everything**
```bash
pnpm dev
```
This runs:
- `apps/web` at http://localhost:3000
- `apps/studio` at http://localhost:3333

**Option B: Run Individually**
```bash
# Web app only
pnpm --filter web dev
# → http://localhost:3000

# Studio only
pnpm --filter studio dev
# → http://localhost:3333 (Sanity Studio)

# Storybook
pnpm storybook
# → http://localhost:6006
```

### 3. Sanity Studio Setup

Your studio is **already configured** with project ID `poalmzla`.

**First time running Studio:**
```bash
cd apps/studio
npx sanity login
# → This will open browser to authenticate with Sanity
# → Use your Sanity account credentials
```

**After login, you're ready:**
```bash
pnpm --filter studio dev
# → Opens at http://localhost:3333
```

The placeholder schema includes:
- **Page** document type with title, slug, and content fields

## 🎨 Working with the Design System

### View Components in Storybook

```bash
pnpm storybook
# Opens at http://localhost:6006
```

You'll see:
- **Components/Button** with stories for Primary, Secondary, and Disabled states

### Using Components in Web App

The web app already imports the Button component:

```typescript
// apps/web/src/App.tsx
import { Button } from '@sugartown/design-system';

function App() {
  return (
    <Button onClick={() => alert('Hello!')}>
      Click Me
    </Button>
  );
}
```

### Adding New Components

1. Create component in `packages/design-system/src/components/`:
   ```
   ComponentName/
   ├── ComponentName.tsx
   ├── ComponentName.module.css
   └── ComponentName.stories.tsx
   ```

2. Export from `packages/design-system/src/index.ts`:
   ```typescript
   export { ComponentName } from './components/ComponentName';
   export type { ComponentNameProps } from './components/ComponentName';
   ```

3. Build design system:
   ```bash
   pnpm --filter @sugartown/design-system build
   ```

4. Use in apps:
   ```typescript
   import { ComponentName } from '@sugartown/design-system';
   ```

## 🏗️ Building for Production

### Build Everything

```bash
pnpm build
```

This builds:
- ✅ `@sugartown/design-system` → `packages/design-system/dist/`
- ✅ `apps/web` → `apps/web/dist/`
- ⚠️ `apps/studio` → Requires `npx sanity login` first

### Build Individual Apps

```bash
# Design system
pnpm --filter @sugartown/design-system build

# Web app
pnpm --filter web build

# Storybook static site
pnpm --filter storybook storybook:build
# → outputs to apps/storybook/storybook-static/

# Studio (after sanity login)
pnpm --filter studio build
```

## 🔍 Linting & Type Checking

```bash
# Lint all workspaces
pnpm lint

# Type check all workspaces
pnpm typecheck

# Format code
pnpm format
```

## 📊 Git Workflow

Your repo has **7 clean commits** showing professional progression:

```
9e182e8 feat: configure Sanity Studio with project credentials
a74aaf1 fix: resolve TypeScript project references
650615e fix: add CSS module type declarations and fix tsconfig
82b7587 feat: add design-system package and wire to storybook
532695f feat: scaffold app workspaces
756298b feat: add shared config packages
4a6f074 chore: initialize pnpm workspace and turborepo baseline
```

**To create a new feature:**
```bash
git checkout -b feat/your-feature-name
# ... make changes ...
git add .
git commit -m "feat: add amazing feature"
git push origin feat/your-feature-name
```

## 🎯 Architectural Boundaries (ENFORCED)

ESLint will **automatically block** these violations:

❌ **Packages importing from apps**
```typescript
// ❌ In packages/design-system/src/components/Button.tsx
import { something } from '../../../apps/web/...'
// Error: Packages cannot import from apps
```

❌ **Design system importing Sanity**
```typescript
// ❌ In packages/design-system/src/components/Card.tsx
import { client } from '@sanity/client'
// Error: design-system must remain CMS-agnostic
```

❌ **Web app importing from Studio**
```typescript
// ❌ In apps/web/src/App.tsx
import { config } from '../../studio/sanity.config'
// Error: apps/web cannot import from apps/studio
```

## 📁 Key File Locations

```
sugartown/
├── apps/
│   ├── web/src/App.tsx          # Main web app entry
│   ├── studio/sanity.config.ts  # Sanity configuration
│   └── storybook/.storybook/    # Storybook config
├── packages/
│   ├── design-system/src/
│   │   ├── components/          # Add new components here
│   │   ├── styles/
│   │   │   ├── tokens.css       # Design tokens
│   │   │   └── globals.css      # Global styles
│   │   └── index.ts             # Main exports
│   ├── eslint-config/
│   │   └── boundaries.js        # Boundary enforcement rules
│   └── tsconfig/                # Shared TS configs
└── turbo.json                   # Build pipeline config
```

## 🎨 Design Tokens Reference

Available CSS custom properties (use in any component):

```css
/* Colors */
--st-pink: #FF69B4;
--st-black: #000000;
--st-white: #FFFFFF;
--st-gray-light: #F5F5F5;
--st-gray: #6B7280;
--st-green: #2BD4AA;

/* Spacing */
--st-space-1: 0.25rem;
--st-space-2: 0.5rem;
--st-space-3: 0.75rem;
--st-space-4: 1rem;
--st-space-5: 1.5rem;
--st-space-6: 2rem;

/* Border Radius */
--st-radius-1: 0.25rem;
--st-radius-2: 0.5rem;
--st-radius-3: 0.75rem;

/* Typography */
--st-font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--st-font-size-base: 1rem;
--st-font-weight-semibold: 600;

/* Shadow */
--st-shadow-1: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
```

## 🚀 Deployment

### Deploy Storybook (Recommended: Vercel/Netlify)

```bash
# Build static site
pnpm storybook:build

# Deploy the apps/storybook/storybook-static/ folder
# to Vercel, Netlify, or any static host
```

### Deploy Web App

```bash
# Build production bundle
pnpm --filter web build

# Deploy the apps/web/dist/ folder
# to Vercel, Netlify, or any static host
```

### Deploy Sanity Studio

```bash
# First time: login to Sanity
cd apps/studio
npx sanity login

# Deploy to Sanity's hosting
npx sanity deploy

# Or build and host yourself
pnpm --filter studio build
# Deploy apps/studio/dist/ folder
```

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] `pnpm install` completed successfully
- [ ] `pnpm --filter web dev` opens at localhost:3000
- [ ] Web app shows "Sugartown Web App" with clickable button
- [ ] `npx sanity login` completes (in apps/studio/)
- [ ] `pnpm --filter studio dev` opens Sanity Studio
- [ ] Studio shows "Page" document type
- [ ] `pnpm storybook` opens at localhost:6006
- [ ] Storybook shows Button component with 3 stories
- [ ] `pnpm build` completes for web and design-system
- [ ] `pnpm lint` passes with no errors
- [ ] `pnpm typecheck` passes with no errors

## 🆘 Troubleshooting

### "Module not found: @sugartown/design-system"

```bash
# Rebuild the design system
pnpm --filter @sugartown/design-system build
```

### "ENOENT: no such file or directory"

```bash
# Clean and reinstall
pnpm clean
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Sanity Studio won't authenticate

```bash
cd apps/studio
npx sanity login --sso
# Or without SSO:
npx sanity login
```

### TypeScript errors in IDE

```bash
# Restart TypeScript server in your editor
# VS Code: Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

## 📚 Next Steps

1. **Add more components** to the design system
2. **Create schemas** in Sanity Studio for your content
3. **Add `packages/content`** adapter package for CMS abstraction
4. **Set up CI/CD** with GitHub Actions or similar
5. **Deploy** Storybook and Web app to production

## 🎉 You're Ready!

Your monorepo is production-ready with:
- ✅ Sanity Studio configured
- ✅ Design system with tokens
- ✅ Storybook documentation
- ✅ Boundary enforcement active
- ✅ Professional git history

Run `pnpm dev` and start building! 🚀
