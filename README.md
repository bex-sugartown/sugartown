# Sugartown Monorepo

> Mini-monorepo composable MACH reference architecture

A production-ready monorepo showcasing modern web architecture with strict boundary enforcement, CMS portability, and design system best practices.

## Architecture

### Apps

- **apps/web** - Frontend application (Vite + React + TypeScript)
- **apps/studio** - Sanity Studio (CMS)
- **apps/storybook** - Component documentation

### Packages

- **packages/design-system** - CMS-agnostic React component library
- **packages/tsconfig** - Shared TypeScript configurations
- **packages/eslint-config** - Shared ESLint configurations with boundary enforcement

### Tooling

- **tooling/scripts** - Build and deployment scripts
- **tooling/ci** - CI/CD configurations

## Architectural Boundaries

### Import Rules (Enforced via ESLint)

1. **Packages CANNOT import from apps** - Ensures reusability
2. **Apps CAN import from packages** - Standard consumption pattern
3. **apps/web CANNOT import from apps/studio** - Prevents coupling
4. **packages/design-system is CMS-agnostic** - No Sanity, GROQ, or CMS imports

### CMS Portability

- **apps/web** accesses CMS only through future `packages/content` adapter
- **packages/design-system** remains framework and CMS agnostic
- **apps/studio** is the only place for Sanity-specific code

This architecture enables switching CMSes without rewriting the design system or core application logic.

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0

### Installation

```bash
pnpm install
```

### Development

```bash
# Run web app and studio concurrently
pnpm dev

# Run Storybook
pnpm storybook
```

### Build

```bash
# Build all apps and packages
pnpm build

# Build Storybook static site
pnpm storybook:build
```

### Linting & Type Checking

```bash
# Lint all workspaces
pnpm lint

# Type check all workspaces
pnpm typecheck
```

## Project Structure

```
sugartown/
├── apps/
│   ├── web/           # Frontend application
│   ├── studio/        # Sanity Studio
│   └── storybook/     # Component docs
├── packages/
│   ├── design-system/ # Component library
│   ├── eslint-config/ # Shared linting
│   └── tsconfig/      # Shared TS config
├── tooling/
│   ├── scripts/       # Build scripts
│   └── ci/            # CI configs
├── turbo.json         # Turborepo config
└── package.json       # Workspace root
```

## Future Extensions

### Planned Packages

- **packages/content** - CMS adapter layer for content fetching
- **packages/analytics** - Analytics abstraction
- **packages/auth** - Authentication utilities

### Documentation

Place PRDs and architectural decision records in `/docs` directory (to be created).

## Technology Stack

- **Build**: Turborepo + pnpm workspaces
- **Frontend**: Vite + React + TypeScript
- **CMS**: Sanity v3
- **Components**: Custom design system
- **Docs**: Storybook
- **Styling**: CSS Modules + Design Tokens

## License

MIT
