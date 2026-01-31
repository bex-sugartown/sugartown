# Sugartown Sanity MVP - Project Blueprint

**Created:** January 19, 2026  
**Status:** Phase 1 Complete - Foundation Layer Operational  
**Version:** 1.0.0

---

## Executive Summary

Built a headless CMS system using Sanity.io (backend) + React (frontend) as the foundation layer for Sugartown's content management needs. The system demonstrates atomic design principles, singleton content patterns, and real-time content updates. This serves as both a working prototype and the architectural foundation for the Resume Factory v3 migration.

**Live URLs:**
- Sanity Studio: http://localhost:3333
- React Frontend: http://localhost:5173
- GitHub: 
  - https://github.com/bex-sugartown/sugartown-sanity
  - https://github.com/bex-sugartown/sugartown-frontend

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    SUGARTOWN CMS                        │
└─────────────────────────────────────────────────────────┘

┌──────────────────────┐          ┌──────────────────────┐
│   SANITY STUDIO      │          │   REACT FRONTEND     │
│   (localhost:3333)   │◄────────►│   (localhost:5173)   │
│                      │   GROQ   │                      │
│  Content Authoring   │  Queries │  Public Website      │
└──────────────────────┘          └──────────────────────┘
         │                                 │
         │                                 │
         ▼                                 ▼
┌──────────────────────┐          ┌──────────────────────┐
│  SANITY CLOUD API    │          │   USER BROWSER       │
│  (Content Storage)   │          │   (Visitors)         │
└──────────────────────┘          └──────────────────────┘
```

### Data Flow

1. **Content Creation:** Editor creates/edits content in Sanity Studio
2. **Publishing:** Content saved to Sanity Cloud API (dataset: production)
3. **Fetching:** React app queries Sanity API using GROQ
4. **Rendering:** React components render content in browser
5. **Real-time Updates:** Changes in Studio appear in React on refresh

---

## Tech Stack

### Backend (Sanity Studio)
- **Sanity CLI:** v3+
- **Node.js:** 18+ (installed via Homebrew)
- **TypeScript:** Schema definitions in .ts files
- **Dataset:** production
- **Project ID:** poalmzla

### Frontend (React)
- **React:** 18+
- **Vite:** Build tool and dev server
- **@sanity/client:** API communication
- **@sanity/image-url:** Image optimization
- **@portabletext/react:** Rich text rendering
- **CSS Modules:** Component-scoped styling

### Design System
- **Primary:** Sugartown Pink (#ff247d)
- **Secondary:** Sugartown Lime (#D1FF1D)
- **Accent:** Maroon (#b91c68) - errors and inline code
- **Typography:** System fonts
- **Spacing:** 8px grid system
- **Methodology:** Atomic Design + BEM-ish naming

---

## Project Structure

### Sanity Studio (`sugartown-sanity/`)

```
sugartown-sanity/
├── schemas/
│   ├── objects/              # Atomic building blocks
│   │   ├── link.ts          # Basic hyperlink
│   │   ├── logo.ts          # Image + link + width
│   │   ├── media.ts         # Image + caption
│   │   ├── navigationItem.ts # Link + active state
│   │   └── socialLink.ts    # Platform-aware link
│   ├── documents/           # Top-level content types
│   │   ├── header.ts        # Site header (singleton)
│   │   ├── footer.ts        # Site footer (singleton)
│   │   ├── hero.ts          # Hero banner
│   │   └── contentBlock.ts  # Rich text content
│   └── index.ts             # Schema registry
├── sanity.config.ts         # Studio configuration
├── sanity.cli.ts            # CLI configuration
└── package.json
```

**Key Files:**
- `schemas/index.ts` - Exports all schemas for Studio
- `sanity.config.ts` - Defines singleton structure, project settings
- Project ID: `poalmzla`
- Dataset: `production`

### React Frontend (`sugartown-frontend/`)

```
sugartown-frontend/
├── src/
│   ├── lib/
│   │   ├── sanity.js        # Sanity client + urlFor helper
│   │   └── queries.js       # GROQ queries
│   ├── components/
│   │   ├── atoms/           # Reusable primitives
│   │   │   ├── Link.jsx + .module.css
│   │   │   ├── Logo.jsx + .module.css
│   │   │   ├── Media.jsx + .module.css
│   │   │   ├── NavigationItem.jsx + .module.css
│   │   │   └── SocialLink.jsx + .module.css
│   │   ├── Header.jsx + .module.css      # Composite
│   │   ├── Footer.jsx + .module.css      # Composite
│   │   ├── Hero.jsx + .module.css        # Composite
│   │   └── ContentBlock.jsx + .module.css # Composite
│   ├── styles/
│   │   └── design-tokens.css  # CSS variables
│   ├── App.jsx               # Main app component
│   ├── App.css               # Global styles
│   └── main.jsx              # Entry point
├── .env.local                # Environment variables
├── package.json
└── vite.config.js
```

**Key Files:**
- `.env.local` - Sanity project credentials (not in git)
- `src/lib/sanity.js` - Sanity client configuration
- `src/lib/queries.js` - All GROQ queries for fetching content
- `src/styles/design-tokens.css` - Design system variables

---

## Content Model

### Atomic Objects (Reusable Building Blocks)

**1. Link**
- label (string, required)
- url (url, required)
- openInNewTab (boolean)

**2. Logo**
- image (image with alt, required)
- linkUrl (url, default: "/")
- width (number, default: 120px)

**3. Media**
- image (image with alt, required)
- caption (string, optional)

**4. NavigationItem**
- label (string, required)
- url (url, required)
- isActive (boolean) - for current page highlighting
- openInNewTab (boolean)

**5. SocialLink**
- platform (select: linkedin, github, twitter, etc.)
- url (url, required)
- label (string, required) - for accessibility

### Document Types (Top-Level Content)

**1. Header (Singleton)**
- logo (logo object)
- navigation (array of navigationItem)
- ctaButton (link object, optional)

**2. Footer (Singleton)**
- logo (logo object)
- tagline (string)
- navigationColumns (array of {heading, links[]})
- socialLinks (array of socialLink)
- copyrightText (string)
- legalLinks (array of link)

**3. Hero Banner**
- heading (string, required, max 80 chars)
- subheading (text, max 200 chars)
- ctas[] (link object array)
- backgroundMedia (media object)
- backgroundStyle (select: pink, seafoam, white, image)

**4. Content Block**
- title (string) - internal reference
- content (Portable Text array) - rich text with:
  - Headings: H2, H3
  - Formatting: bold, italic, code
  - Links: inline external links
  - Media: embedded images with captions
  - Blockquotes

---

## Key Architectural Patterns

### 1. Atomic Design Methodology

**Hierarchy:**
```
Atoms (primitives)
  └─> Compose into Molecules (not used yet)
      └─> Compose into Organisms (Header, Footer, etc.)
          └─> Compose into Templates (not used yet)
              └─> Compose into Pages (App.jsx)
```

**Implementation:**
- **Atoms:** Single-purpose, no data fetching, pure presentation
- **Composites:** Fetch data, compose atoms, handle state
- **Separation:** Atomic components in `/atoms`, composites in `/components`

### 2. Singleton Pattern

**What:** Content types that should only have ONE instance (header, footer)

**Implementation in Sanity:**
```typescript
// In sanity.config.ts
structureTool({
  structure: (S) =>
    S.list()
      .items([
        S.listItem()
          .title('🎀 Site Header')
          .child(
            S.document()
              .schemaType('header')
              .documentId('singleton-header')  // Fixed ID
          ),
        // ... same for footer
      ])
})
```

**Querying Singletons:**
```javascript
*[_type == "header" && _id == "singleton-header"][0]
```

### 3. GROQ Query Pattern

**Structure:**
```javascript
export const headerQuery = `
  *[_type == "header" && _id == "singleton-header"][0]{
    logo{
      image{
        asset,        // Just reference, not asset->{url}
        alt
      },
      linkUrl,
      width
    },
    navigation[]{      // Array notation
      label,
      url,
      isActive,
      openInNewTab
    }
  }
`
```

**Important:** Use `asset` not `asset->{url}` - the `urlFor()` helper needs the reference.

### 4. Image Optimization

**Pattern:**
```javascript
// In sanity.js
import imageUrlBuilder from '@sanity/image-url'

const builder = imageUrlBuilder(client)
export function urlFor(source) {
  return builder.image(source)
}

// In components
<img 
  src={urlFor(image.asset).width(800).quality(90).url()} 
  alt={image.alt}
/>
```

**Benefits:**
- Automatic responsive images
- On-the-fly resizing
- CDN caching
- Format optimization (WebP, etc.)

### 5. CSS Architecture

**Hierarchy (Gravitational Weight):**
```
1. Design Tokens (CSS variables)
2. Global Styles (App.css)
3. Component Styles (CSS Modules)
```

**Namespace Convention:**
- CSS variables: `--st-*` (Sugartown)
- Component classes: BEM-ish with CSS Modules scope

**Example:**
```css
/* design-tokens.css */
:root {
  --st-pink: #ff247d;
  --st-space-md: 1.5rem;
}

/* Header.module.css */
.header {
  padding: var(--st-space-md);
  background: var(--st-pink);
}
```

---

## Environment Configuration

### Sanity Studio

**sanity.config.ts:**
```typescript
{
  projectId: 'poalmzla',        // Your Sanity project
  dataset: 'production',         // Content dataset
  plugins: [
    structureTool(),             // Content editor
    visionTool()                 // GROQ testing
  ]
}
```

**sanity.cli.ts:**
```typescript
{
  api: {
    projectId: 'poalmzla',
    dataset: 'production'
  }
}
```

### React Frontend

**.env.local:** (not in git)
```
VITE_SANITY_PROJECT_ID=poalmzla
VITE_SANITY_DATASET=production
VITE_SANITY_API_VERSION=2024-01-01
```

**CORS Configuration:**
```bash
sanity cors add http://localhost:5173 --credentials
```

This allows React app to fetch from Sanity API.

---

## Development Workflow

### Daily Development

**Terminal 1: Sanity Studio**
```bash
cd ~/SUGARTOWN_DEV/sugartown-sanity
sanity dev
# Studio runs at localhost:3333
```

**Terminal 2: React Frontend**
```bash
cd ~/SUGARTOWN_DEV/sugartown-frontend
npm run dev
# Frontend runs at localhost:5173
```

**Terminal 3: Git/Commands**
```bash
# Make changes, commit, push
git add .
git commit -m "Description of changes"
git push
```

### Content Editing Flow

1. Open Sanity Studio (localhost:3333)
2. Navigate to content type (Header, Footer, Hero, Content Block)
3. Edit content
4. Click **Publish** (critical - unpublished content won't appear)
5. Refresh React app (localhost:5173) to see changes

### Code Editing Flow

**Adding a new content type:**

1. **Create schema** in `sugartown-sanity/schemas/`
2. **Export** in `schemas/index.ts`
3. **Test** in Studio (localhost:3333)
4. **Create GROQ query** in `sugartown-frontend/src/lib/queries.js`
5. **Create React component** in `src/components/`
6. **Import and use** in App.jsx or other components

---

## Critical Setup Steps

### First-Time Setup (Already Completed)

**1. Install Node.js:**
```bash
brew install node
```

**2. Initialize Sanity:**
```bash
cd ~/SUGARTOWN_DEV
sanity init
# Creates sugartown-sanity/
```

**3. Create React App:**
```bash
npm create vite@latest sugartown-frontend -- --template react
cd sugartown-frontend
npm install
```

**4. Install Sanity Dependencies (React):**
```bash
npm install @sanity/client @sanity/image-url @portabletext/react
```

**5. Configure CORS:**
```bash
cd sugartown-sanity
sanity cors add http://localhost:5173 --credentials
```

**6. Initialize Git:**
```bash
cd sugartown-sanity
git init
git add .
git commit -m "Initial commit"

cd ../sugartown-frontend
git init
git add .
git commit -m "Initial commit"
```

### Troubleshooting Reference

**Problem: "Cannot resolve module '../../../lib/sanity'"**
- Fix: Check import paths in atomic components
- Should be: `../../lib/sanity` (from atoms/)

**Problem: "CORS blocked"**
- Fix: Add localhost to CORS origins
- `sanity cors add http://localhost:5173 --credentials`

**Problem: "Unable to resolve image URL"**
- Fix: GROQ query returning wrong format
- Use: `asset` not `asset->{url}`

**Problem: "No content showing"**
- Check: Is content published in Studio?
- Check: Does dataset name match? (production vs test)
- Check: Browser console for API errors

**Problem: Port 3333 already in use**
- Fix: Kill existing process
- `kill -9 $(lsof -ti:3333)`

---

## File Locations Reference

### Important Paths

```
~/SUGARTOWN_DEV/
├── sugartown-sanity/
│   ├── schemas/              ← Schema definitions
│   ├── sanity.config.ts      ← Studio configuration
│   └── sanity.cli.ts         ← CLI configuration
│
└── sugartown-frontend/
    ├── .env.local            ← Sanity credentials (not in git)
    ├── src/lib/              ← Sanity client + queries
    ├── src/components/       ← React components
    └── src/styles/           ← Design tokens
```

### Configuration Files

**Sanity:**
- `sanity.config.ts` - Studio settings, plugins, singleton structure
- `sanity.cli.ts` - CLI project/dataset settings
- `schemas/index.ts` - Schema registry
- `.gitignore` - Excludes node_modules, dist, .sanity

**React:**
- `.env.local` - Environment variables (NOT in git)
- `vite.config.js` - Vite configuration
- `package.json` - Dependencies
- `.gitignore` - Excludes node_modules, dist, .env

---

## Design System Tokens

### Colors

```css
--st-pink: #ff247d;         /* Sugartown Pink - primary brand */
--st-green: #D1FF1D;      /* Sugartown Lime - secondary */
--st-black: #0D1226;        /* Deep Midnight Blue - text */
--st-red: #b91c68;          /* Maroon - errors, code */
--st-gray-medium: #94A3B8;  /* Soft Cloud Gray */
--st-white: #FFFFFF;
--st-gray-light: #F5F5F5;
--st-gray-dark: #2A2A2A;
```

### Typography

```css
--st-font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', ...
--st-font-mono: 'SF Mono', Monaco, 'Courier New', monospace

--st-text-xs: 0.75rem;    /* 12px */
--st-text-sm: 0.875rem;   /* 14px */
--st-text-base: 1rem;     /* 16px */
--st-text-lg: 1.125rem;   /* 18px */
--st-text-xl: 1.25rem;    /* 20px */
--st-text-2xl: 1.5rem;    /* 24px */
--st-text-3xl: 1.875rem;  /* 30px */
--st-text-4xl: 2.25rem;   /* 36px */
--st-text-5xl: 3rem;      /* 48px */
```

### Spacing (8px Grid)

```css
--st-space-xs: 0.5rem;   /* 8px */
--st-space-sm: 1rem;     /* 16px */
--st-space-md: 1.5rem;   /* 24px */
--st-space-lg: 2rem;     /* 32px */
--st-space-xl: 3rem;     /* 48px */
--st-space-2xl: 4rem;    /* 64px */
--st-space-3xl: 6rem;    /* 96px */
```

### Usage Guidelines

**Primary Pink (#ff247d):**
- Primary CTAs
- Active navigation states
- Links
- H2 headings
- Brand elements

**Lime Green (#D1FF1D):**
- Secondary CTAs
- Hover states
- Accent elements

**Maroon (#b91c68):**
- Error messages
- Inline code text
- Warning states

---

## Component Inventory

### Atomic Components (src/components/atoms/)

**Link**
- Props: `label, url, openInNewTab, className`
- Usage: Basic hyperlinks throughout site
- Auto-detects external links

**Logo**
- Props: `image, linkUrl, width`
- Usage: Header and footer branding
- Retina-ready (2x image)

**Media**
- Props: `image, caption`
- Usage: Content images with optional captions
- Optimized with urlFor helper

**NavigationItem**
- Props: `label, url, isActive, openInNewTab`
- Usage: Navigation menu items
- Active state with underline

**SocialLink**
- Props: `platform, url, label`
- Usage: Social media links with platform icons
- Emoji icons (LinkedIn 💼, GitHub 🐙, etc.)

### Composite Components (src/components/)

**Header**
- Fetches: Singleton header
- Renders: Logo + Navigation + CTA
- Sticky positioning

**Footer**
- Fetches: Singleton footer
- Renders: Logo + Navigation columns + Social links + Legal
- Dark background

**Hero**
- Props: `hero` (hero banner data)
- Renders: Heading + Subheading + CTAs (0-2 array )
- Background: Solid color or image

**ContentBlock**
- Props: `content` (Portable Text array)
- Renders: Rich text with custom styling
- Supports: H2, H3, bold, italic, code, links, images

---

## Next Steps & Roadmap

### Immediate Priorities

**1. Additional Content Types**
- Projects/Portfolio items
- Testimonials
- Team members
- FAQ sections

**2. Multi-Page Routing**
- Install React Router
- Create About, Projects, Contact pages
- Implement navigation

**3. Resume Factory v3 Migration**
- Port master_resume_data.json to Sanity schemas
- Create resume variant schemas
- Build React resume builder UI
- PDF export functionality

### Phase 2: Production Deployment

**Frontend Deployment (Vercel/Netlify):**
1. Connect GitHub repo
2. Configure build command: `npm run build`
3. Configure environment variables
4. Deploy to custom domain

**OR Pair Server Deployment:**
1. Build: `npm run build`
2. Deploy via SSH/rsync to pair server
3. Configure GitHub Actions for auto-deploy

**Sanity Deployment:**
- Already cloud-hosted
- Configure production CORS for live domain
- Set up access controls

### Phase 3: Enhancements

**Content Features:**
- Search functionality
- Content filtering/sorting
- Dynamic page generation
- SEO optimization

**UX Improvements:**
- Loading states
- Error boundaries
- Animations/transitions
- Mobile menu

**Developer Experience:**
- Storybook for component library
- Unit tests (Vitest)
- E2E tests (Playwright)
- CI/CD pipeline

---

## Dependencies

### Sanity Studio (package.json)

```json
{
  "@sanity/cli": "^3.x",
  "@sanity/vision": "^3.x",
  "sanity": "^3.x",
  "react": "^18.x",
  "react-dom": "^18.x",
  "styled-components": "^6.x"
}
```

### React Frontend (package.json)

```json
{
  "react": "^18.x",
  "react-dom": "^18.x",
  "vite": "^7.x",
  "@sanity/client": "latest",
  "@sanity/image-url": "latest",
  "@portabletext/react": "latest"
}
```

---

## Git Repository Structure

### Branches (Current)

- `main` - Production-ready code
- Future: Feature branches, develop branch

### Commit Message Format

```
type: brief description

- Detailed change 1
- Detailed change 2
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting, CSS
- `refactor:` Code restructuring
- `test:` Testing
- `chore:` Maintenance

### .gitignore Essentials

**Sanity:**
- `/node_modules`
- `/dist`
- `/.sanity`
- `*.log`

**React:**
- `/node_modules`
- `/dist`
- `.env.local`
- `*.log`

---

## Commands Reference

### Sanity

```bash
# Development
sanity dev                    # Start Studio (localhost:3333)
sanity build                  # Build Studio for production
sanity deploy                 # Deploy Studio to Sanity hosting

# Content Management
sanity dataset list           # List datasets
sanity dataset create NAME    # Create new dataset
sanity documents create       # Create document via CLI

# CORS
sanity cors add URL           # Add CORS origin
sanity cors list              # List CORS origins

# Project Management
sanity projects list          # List your projects
sanity manage                 # Open project dashboard
```

### React (Vite)

```bash
# Development
npm run dev                   # Start dev server (localhost:5173)
npm run build                 # Build for production
npm run preview               # Preview production build

# Dependencies
npm install                   # Install all dependencies
npm install PACKAGE           # Add new package
```

### Git

```bash
# Daily Workflow
git status                    # Check status
git add .                     # Stage all changes
git commit -m "message"       # Commit changes
git push                      # Push to GitHub

# Branching
git checkout -b feature-name  # Create new branch
git checkout main             # Switch to main
git merge feature-name        # Merge branch

# History
git log --oneline             # View commit history
git show --stat HEAD          # Show last commit details
```

---

## Architecture Decisions & Rationale

### Why Sanity?

1. **Structured Content:** Strong content modeling
2. **Real-time:** Live preview, instant updates
3. **Portable Text:** Flexible rich text format
4. **Image Pipeline:** Automatic optimization
5. **API-first:** Headless architecture
6. **TypeScript Support:** Type-safe schemas

### Why React (Not WordPress)?

1. **Performance:** Faster than WordPress
2. **Modern Stack:** Component-based architecture
3. **Flexibility:** No theme constraints
4. **Developer Experience:** Better tooling
5. **Scalability:** Easier to maintain long-term

### Why Atomic Design?

1. **Reusability:** Build once, use everywhere
2. **Consistency:** Shared components = consistent UI
3. **Maintainability:** Changes cascade properly
4. **Testability:** Easier to test small components
5. **Scalability:** Easy to add new features

### Why Singletons for Header/Footer?

1. **Prevents Duplicates:** Can't create multiple headers
2. **Better UX:** Editors know exactly what to edit
3. **Type Safety:** Fixed document IDs
4. **Cleaner Queries:** No need to filter/sort

---

## Known Limitations & Considerations

### Current Limitations

1. **No Routing:** Single page app (can add React Router)
2. **No Authentication:** All content is public
3. **No Search:** Manual filtering only
4. **No Caching:** Fresh API calls on each page load
5. **Dev Only:** Not deployed to production yet

### Performance Considerations

**Optimization Opportunities:**
- Implement ISR (Incremental Static Regeneration)
- Add Redis caching layer
- Lazy load images
- Code splitting for routes
- Service worker for offline support

### Security Considerations

**Current Setup:**
- Studio requires Sanity login
- API uses public CDN token (read-only)
- CORS restricts origins

**Production Requirements:**
- Configure production CORS
- Set up access control in Sanity
- Environment variable management
- Rate limiting on API

---

## Success Metrics

### Phase 1 (Completed) ✅

- [x] Sanity Studio operational
- [x] 9 schemas created (5 objects + 4 documents)
- [x] React frontend operational
- [x] 9 React components (5 atoms + 4 composites)
- [x] Content flowing Sanity → React
- [x] Git repos initialized
- [x] Both repos on GitHub
- [x] Design system implemented

### Phase 2 Goals (Next)

- [ ] 3+ additional content types
- [ ] React Router with 3+ pages
- [ ] Production deployment
- [ ] Custom domain configured
- [ ] Resume Factory schemas designed

---

## Contact & Resources

### Key URLs

- **Sanity Studio:** http://localhost:3333
- **React Frontend:** http://localhost:5173
- **Sanity Dashboard:** https://www.sanity.io/manage/project/poalmzla
- **GitHub Org:** https://github.com/bex-sugartown

### Documentation References

- **Sanity Docs:** https://www.sanity.io/docs
- **Sanity Schema Types:** https://www.sanity.io/docs/schema-types
- **GROQ Cheat Sheet:** https://www.sanity.io/docs/query-cheat-sheet
- **Portable Text:** https://portabletext.org/
- **React Docs:** https://react.dev
- **Vite Docs:** https://vitejs.dev

### PRD References

See full implementation details in:
- `/mnt/project/sugartown_sanity_mvp_prd.md`
- Complete schema definitions
- Full component code
- Deployment configuration
- GitHub Actions setup

---

## Version History

**v1.0.0 - January 19, 2026**
- Initial architecture established
- Foundation layer complete
- Sanity Studio + React frontend operational
- Git repositories initialized
- Documentation created

---

## Blueprint Usage Guide

**For Future Development Sessions:**

1. **Read this document first** - Understand the architecture
2. **Check file locations** - Know where everything lives
3. **Review content model** - Understand data structure
4. **Check component inventory** - See what's already built
5. **Follow patterns** - Use established conventions
6. **Reference commands** - Use the commands section
7. **Check next steps** - See roadmap priorities

**For Onboarding New Developers:**

1. Clone both GitHub repos
2. Install dependencies (`npm install` in both)
3. Create `.env.local` in frontend with Sanity credentials
4. Run both dev servers (Sanity + React)
5. Read this blueprint
6. Make a small change to verify setup
7. Commit and push to test workflow

**For AI Assistants (Future Sessions):**

This blueprint provides complete context for:
- Project structure and architecture
- Design patterns and conventions
- File organization
- Command references
- Troubleshooting common issues
- Next steps and priorities

Use this as the authoritative source for project architecture and development patterns.

---

**End of Blueprint - Ready for Next Phase** 🎀
