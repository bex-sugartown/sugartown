# Sugartown Sanity MVP - Architecture Blueprint

**Built:** January 19, 2025  
**Status:** ✅ Fully functional, deployed to GitHub  
**Purpose:** Headless CMS foundation for Sugartown.io with atomic design system

---

## What We Built

A **headless CMS architecture** where content lives in Sanity Studio and is consumed by a React frontend. This separates content management from presentation, allowing:
- Non-technical editors to manage content in Sanity Studio
- Developers to build with modern React/Vite stack
- Instant content updates without code deployments
- Reusable atomic components following design system principles

**Live Endpoints:**
- Sanity Studio: http://localhost:3333
- React Frontend: http://localhost:5173

**GitHub Repositories:**
- https://github.com/bex-sugartown/sugartown-sanity
- https://github.com/bex-sugartown/sugartown-frontend

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CONTENT LAYER                          │
│  Sanity Studio (localhost:3333)                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Content Management Interface                         │   │
│  │ - Visual editor for non-technical users              │   │
│  │ - Schemas define content structure                   │   │
│  │ - Real-time preview                                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Sanity API (poalmzla.api.sanity.io)                  │   │
│  │ - Project ID: poalmzla                               │   │
│  │ - Dataset: production                                │   │
│  │ - GROQ query language                                │   │
│  │ - CDN-cached responses                               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
                     HTTP / JSON API
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                        │
│  React Frontend (localhost:5173)                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ @sanity/client                                       │   │
│  │ - Fetches content via GROQ queries                   │   │
│  │ - Converts Sanity image refs to CDN URLs            │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ React Components                                     │   │
│  │ - Atomic: Link, Logo, Media, NavigationItem, etc.   │   │
│  │ - Composite: Header, Footer, Hero, ContentBlock     │   │
│  │ - CSS Modules for scoped styling                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Design System (Sugartown Brand)                      │   │
│  │ - Pink: #ff247d, Lime: #D1FF1D                       │   │
│  │ - 8px spacing grid, BEM-style naming                │   │
│  │ - CSS custom properties                              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Content Model (Sanity Schemas)

### Atomic Objects (Reusable Building Blocks)
These are **not** top-level content types. They're composable pieces used within documents.

**Location:** `schemas/objects/`

| Object | Purpose | Key Fields |
|--------|---------|------------|
| `link` | Basic hyperlink | label, url, openInNewTab |
| `logo` | Image + link + size | image (with alt), linkUrl, width |
| `media` | Image with caption | image (with alt), caption |
| `navigationItem` | Link with active state | label, url, isActive, openInNewTab |
| `socialLink` | Platform-aware social link | platform (LinkedIn/GitHub/etc), url, label |

### Document Schemas (Top-Level Content)
These appear in Sanity Studio's main navigation and can be created/edited.

**Location:** `schemas/documents/`

| Document | Type | Purpose | Key Fields |
|----------|------|---------|------------|
| `header` | Singleton | Site header | logo, navigation[], ctaButton |
| `footer` | Singleton | Site footer | logo, tagline, navigationColumns[], socialLinks[], copyrightText, legalLinks[] |
| `hero` | Multiple | Hero banners | heading, subheading, ctas[], secondaryCta, backgroundMedia, backgroundStyle |
| `contentBlock` | Multiple | Rich text content | title (internal), content (Portable Text) |

**Singletons:** Only ONE instance allowed (enforced in `sanity.config.ts` structure tool)  
**Multiple:** Can create many instances (e.g., multiple hero banners for different pages)

---

## React Component Architecture

### Design Pattern: Atomic Design + Composition

```
Atoms (Basic building blocks)
  ↓
Composite Components (Combine atoms + fetch data)
  ↓
Pages (Combine composites)
```

### Atomic Components
**Location:** `src/components/atoms/`

| Component | Props | Purpose |
|-----------|-------|---------|
| `Link` | label, url, openInNewTab, className | Basic styled link with external detection |
| `Logo` | image, linkUrl, width | Optimized image link (2x for retina) |
| `Media` | image, caption | Image with optional caption in figure |
| `NavigationItem` | label, url, isActive, openInNewTab | Link with active state styling |
| `SocialLink` | platform, url, label | Platform-aware icon link |

**Characteristics:**
- No data fetching
- Presentational only
- Reusable across entire site
- CSS Modules for scoped styling

### Composite Components
**Location:** `src/components/`

| Component | Data Source | Purpose |
|-----------|-------------|---------|
| `Header` | `headerQuery` (singleton) | Site header with logo, nav, CTA |
| `Footer` | `footerQuery` (singleton) | Site footer with columns, social, legal |
| `Hero` | Passed as prop | Hero banner with backgrounds, CTAs |
| `ContentBlock` | Passed as prop | Portable Text renderer with custom components |

**Characteristics:**
- Fetch data from Sanity (or receive as props)
- Compose atomic components
- Handle loading/error states
- CSS Modules for layout

---

## Data Flow

### 1. Content Creation (Sanity Studio)
```
Editor opens Sanity Studio (localhost:3333)
  ↓
Creates/edits content (e.g., Hero banner)
  ↓
Clicks "Publish"
  ↓
Content saved to Sanity API (dataset: production)
```

### 2. Content Retrieval (React Frontend)
```
React app loads (localhost:5173)
  ↓
Components call client.fetch(query)
  ↓
GROQ query sent to Sanity API
  ↓
JSON response with content + asset references
  ↓
urlFor() converts asset refs to CDN URLs
  ↓
Components render with data
```

### 3. Image Optimization
```
Sanity stores image → Asset ID (e.g., image-abc123-1920x1080-jpg)
  ↓
urlFor(asset).width(800).quality(90).url()
  ↓
CDN generates optimized image
  ↓
Browser receives: https://cdn.sanity.io/images/poalmzla/production/...?w=800&q=90
```

---

## Key Technologies

### Backend (Content Layer)
- **Sanity v3:** Headless CMS with React-based Studio
- **GROQ:** Query language for fetching structured content
- **Sanity CLI:** Project management, dataset operations, deployment

### Frontend (Presentation Layer)
- **React 18:** Component-based UI library
- **Vite:** Fast build tool and dev server
- **@sanity/client:** Official Sanity JavaScript client
- **@sanity/image-url:** Image URL builder for CDN optimization
- **@portabletext/react:** Render Sanity's Portable Text (rich text format)
- **CSS Modules:** Scoped component styling

### Developer Tools
- **Node.js 18+:** JavaScript runtime
- **npm:** Package manager
- **Git:** Version control
- **GitHub:** Code hosting
- **VS Code:** Recommended IDE

---

## File Structure

### Sanity Repository (`sugartown-sanity`)
```
sugartown-sanity/
├── schemas/
│   ├── objects/              # Atomic components (5 files)
│   │   ├── link.ts
│   │   ├── logo.ts
│   │   ├── media.ts
│   │   ├── navigationItem.ts
│   │   └── socialLink.ts
│   ├── documents/            # Top-level content types (4 files)
│   │   ├── header.ts
│   │   ├── footer.ts
│   │   ├── hero.ts
│   │   └── contentBlock.ts
│   └── index.ts             # Schema registry (exports all schemas)
├── sanity.config.ts         # Studio configuration, singleton structure
├── sanity.cli.ts            # CLI configuration (project ID, dataset)
├── package.json             # Dependencies
└── .gitignore               # Excludes node_modules, dist, .sanity
```

### React Repository (`sugartown-frontend`)
```
sugartown-frontend/
├── src/
│   ├── lib/
│   │   ├── sanity.js         # Sanity client config + urlFor helper
│   │   └── queries.js        # GROQ queries for all content types
│   ├── components/
│   │   ├── atoms/            # Atomic components (5 × 2 files)
│   │   │   ├── Link.jsx + Link.module.css
│   │   │   ├── Logo.jsx + Logo.module.css
│   │   │   ├── Media.jsx + Media.module.css
│   │   │   ├── NavigationItem.jsx + NavigationItem.module.css
│   │   │   └── SocialLink.jsx + SocialLink.module.css
│   │   ├── Header.jsx + Header.module.css
│   │   ├── Footer.jsx + Footer.module.css
│   │   ├── Hero.jsx + Hero.module.css
│   │   └── ContentBlock.jsx + ContentBlock.module.css
│   ├── styles/
│   │   └── design-tokens.css  # CSS custom properties (colors, spacing, etc.)
│   ├── App.jsx                # Main app component
│   ├── App.css                # Global app styles
│   └── main.jsx               # React entry point
├── .env.local                 # Environment variables (NOT in git)
├── package.json               # Dependencies
├── vite.config.js             # Vite configuration
└── .gitignore                 # Excludes node_modules, dist, .env.local
```

---

## Environment Configuration

### Sanity (`sanity.config.ts`)
```typescript
export default defineConfig({
  projectId: 'poalmzla',        // Unique project identifier
  dataset: 'production',         // Data environment
  // ...
})
```

### React (`.env.local`)
```bash
VITE_SANITY_PROJECT_ID=poalmzla
VITE_SANITY_DATASET=production
VITE_SANITY_API_VERSION=2024-01-01
```

**⚠️ CRITICAL:** `.env.local` is gitignored. Never commit it. For production deployment, set these as environment variables in your hosting platform.

---

## Design System

### Brand Colors
```css
--st-pink: #ff247d;         /* Primary brand color */
--st-seafoam: #D1FF1D;      /* Secondary (Sugartown Lime) */
--st-black: #0D1226;        /* Deep Midnight Blue */
--st-red: #b91c68;          /* Maroon (errors, inline code) */
--st-gray-medium: #94A3B8;  /* Soft Cloud Gray */
```

### Spacing System (8px Grid)
```css
--st-space-xs: 0.5rem;   /* 8px */
--st-space-sm: 1rem;     /* 16px */
--st-space-md: 1.5rem;   /* 24px */
--st-space-lg: 2rem;     /* 32px */
--st-space-xl: 3rem;     /* 48px */
--st-space-2xl: 4rem;    /* 64px */
--st-space-3xl: 6rem;    /* 96px */
```

### Typography
- **Font family:** System fonts (native to user's OS)
- **Font sizes:** Modular scale from 0.75rem to 3rem
- **Mono font:** SF Mono, Monaco, Courier New (for code)

### Naming Conventions
- **CSS classes:** BEM-inspired with `st-` namespace
- **CSS Modules:** `styles.className` (auto-scoped)
- **Component files:** PascalCase (e.g., `NavigationItem.jsx`)
- **Schema files:** camelCase (e.g., `navigationItem.ts`)

---

## Development Workflow

### Daily Development

**Terminal 1: Sanity Studio**
```bash
cd ~/SUGARTOWN_DEV/sugartown-sanity
sanity dev
# Opens Studio at localhost:3333
```

**Terminal 2: React Frontend**
```bash
cd ~/SUGARTOWN_DEV/sugartown-frontend
npm run dev
# Opens site at localhost:5173
```

**Terminal 3: Git Operations**
```bash
# Make changes in VS Code
git add .
git commit -m "Add feature X"
git push origin main
```

### Content Updates (No Code Deploy)
1. Edit content in Sanity Studio
2. Click "Publish"
3. Refresh React frontend → **content updates instantly**

**Why?** React fetches from Sanity API on each page load. Content changes don't require code deployment.

### Code Updates (Require Deploy)
1. Edit component files in VS Code
2. Test locally (`npm run dev`)
3. Commit and push to GitHub
4. Deploy (see "Deployment" section below)

---

## Common Tasks

### Add a New Content Type

**1. Create schema in Sanity:**
```bash
cd ~/SUGARTOWN_DEV/sugartown-sanity

# Create new document schema
cat > schemas/documents/testimonial.ts << 'EOF'
import {defineType} from 'sanity'

export default defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    {name: 'author', type: 'string', validation: (Rule) => Rule.required()},
    {name: 'quote', type: 'text', validation: (Rule) => Rule.required()},
    {name: 'company', type: 'string'},
    {name: 'photo', type: 'media'},
  ],
})
EOF

# Add to schema registry
# Edit schemas/index.ts and add:
# import testimonial from './documents/testimonial'
# Add 'testimonial' to schemaTypes array
```

**2. Create GROQ query in React:**
```javascript
// src/lib/queries.js
export const testimonialsQuery = `
  *[_type == "testimonial"] | order(_createdAt desc){
    _id,
    author,
    quote,
    company,
    photo{image{asset, alt}, caption}
  }
`
```

**3. Create React component:**
```bash
# Create src/components/TestimonialGrid.jsx
# Fetch data with client.fetch(testimonialsQuery)
# Render using atomic components
```

### Update Colors
```bash
cd ~/SUGARTOWN_DEV/sugartown-frontend

# Edit src/styles/design-tokens.css
# Change --st-pink, --st-seafoam values
# Save → Vite hot-reloads automatically
```

### Add CORS Origin (For New Domains)
```bash
cd ~/SUGARTOWN_DEV/sugartown-sanity

# Add production domain
sanity cors add https://sugartown.io --credentials

# Or manage in GUI
sanity manage
# → API tab → CORS Origins → Add origin
```

---

## Deployment Strategy

### Current State: Development Only
- ✅ Sanity Studio: localhost:3333
- ✅ React Frontend: localhost:5173
- ❌ Not accessible from internet

### Production Deployment (Future)

**Option 1: Sanity Studio**
```bash
cd ~/SUGARTOWN_DEV/sugartown-sanity

# Deploy Studio to Sanity's hosting
sanity deploy

# Result: studio-poalmzla.sanity.studio (free subdomain)
# Or configure custom domain in Sanity dashboard
```

**Option 2: React Frontend**
- **Recommended:** Vercel or Netlify (free tier, automatic deploys from GitHub)
- **Alternative:** Build and deploy to pair server

**GitHub Actions Workflow (Automated Deploy):**
1. Push to `main` branch on GitHub
2. GitHub Actions runs `npm run build`
3. Uploads `dist/` folder to hosting
4. Site goes live automatically

**Configuration in PRD:** See `sugartown_sanity_mvp_prd.md` Section 8.5 for complete GitHub Actions workflow.

---

## Troubleshooting

### Sanity Studio Issues

**Problem:** "Dataset not found"  
**Fix:** Check `sanity.config.ts` dataset matches React `.env.local`

**Problem:** "Project ID not found"  
**Fix:** Verify project ID in both `sanity.config.ts` and `sanity.cli.ts`

**Problem:** Schemas not appearing  
**Fix:** Check `schemas/index.ts` exports all schemas, restart dev server

### React Frontend Issues

**Problem:** CORS errors  
**Fix:** Add localhost:5173 to CORS origins: `sanity cors add http://localhost:5173 --credentials`

**Problem:** Images not loading  
**Fix:** Ensure GROQ queries return `asset` (not `asset->{url}`), use `urlFor()` helper

**Problem:** Content not updating  
**Fix:** Verify content is published in Sanity Studio (green checkmark)

**Problem:** Environment variables not working  
**Fix:** Restart dev server after changing `.env.local`

### Git Issues

**Problem:** Files not in GitHub  
**Fix:** Check `.gitignore` isn't excluding them, verify `git status` shows files

**Problem:** "Remote already exists"  
**Fix:** `git remote remove origin` then re-add

---

## Security Considerations

### Sanity Studio
- ✅ Password protected (Google/GitHub OAuth)
- ✅ User management in Sanity dashboard
- ✅ CORS configured for allowed origins only
- ⚠️ Keep project ID public, but manage users carefully

### React Frontend
- ✅ `.env.local` in `.gitignore` (never commit secrets)
- ✅ API requests read-only (no write access from frontend)
- ✅ Uses CDN for assets (Sanity's image CDN)
- ⚠️ Consider adding rate limiting for production

### Environment Variables
**Never commit:**
- `.env.local` (development)
- API keys or tokens

**For production:** Set environment variables in hosting platform (Vercel, Netlify, etc.)

---

## Performance Optimizations

### Already Implemented
✅ **Image CDN:** Sanity automatically optimizes images  
✅ **CSS Modules:** Scoped styles, automatic code splitting  
✅ **Vite:** Fast HMR (Hot Module Replacement)  
✅ **CDN Caching:** Sanity API responses cached at edge

### Future Optimizations
- [ ] Add React Router for multi-page app
- [ ] Implement lazy loading for images
- [ ] Add service worker for offline support
- [ ] Set up monitoring (Vercel Analytics, Sentry)
- [ ] Optimize GROQ queries (fetch only needed fields)

---

## Testing Strategy

### Current State: Manual Testing
- Visual QA in browser (localhost:5173)
- Content workflow testing in Studio (localhost:3333)

### Future Testing (Recommended)
- **Unit tests:** Vitest for component testing
- **E2E tests:** Playwright for user flows
- **Visual regression:** Percy or Chromatic
- **Sanity validation:** Schema validation rules in Studio

---

## Next Steps & Roadmap

### Immediate (Phase 2)
1. **Add routing:** React Router for About, Projects, Contact pages
2. **More content types:** Projects, Testimonials, Case Studies
3. **Deploy to production:** Get site live on the web

### Short-term (Phase 3)
4. **Resume Factory v3:** Migrate resume builder to Sanity
5. **Form handling:** Contact form with email notifications
6. **SEO optimization:** Meta tags, sitemap, structured data

### Long-term (Phase 4)
7. **Multi-language support:** i18n with Sanity localization
8. **Advanced features:** Search, filtering, pagination
9. **Performance monitoring:** Analytics, error tracking
10. **Documentation site:** Storybook for component library

---

## Resources & References

### Official Documentation
- **Sanity:** https://www.sanity.io/docs
- **GROQ:** https://www.sanity.io/docs/groq
- **React:** https://react.dev
- **Vite:** https://vitejs.dev

### Project Files
- **PRD:** `/mnt/project/sugartown_sanity_mvp_prd.md` (complete implementation spec)
- **Design System:** `/mnt/project/SUGARTOWN_DESIGN_SYSTEM_RULESET.md`
- **Namespace Guide:** `/mnt/project/SUGARTOWN_NAMESPACE_GUIDE.md`

### GitHub Repositories
- **Sanity:** https://github.com/bex-sugartown/sugartown-sanity
- **React:** https://github.com/bex-sugartown/sugartown-frontend

---

## Key Decisions & Rationale

### Why Headless CMS?
- **Flexibility:** Content can be used in multiple frontends (web, mobile, etc.)
- **Performance:** Static site generation possible
- **Developer experience:** Modern React stack
- **Editor experience:** Non-technical users can manage content

### Why Sanity?
- **Structured content:** Define exact data shapes with schemas
- **Real-time collaboration:** Multiple editors can work simultaneously
- **GROQ:** Powerful query language for complex data relationships
- **Developer-friendly:** React-based Studio, TypeScript support

### Why Atomic Design?
- **Reusability:** Build once, use everywhere
- **Consistency:** Design system enforced at component level
- **Maintainability:** Changes propagate automatically
- **Scalability:** Easy to add new components following pattern

### Why CSS Modules?
- **Scoped styles:** No global CSS conflicts
- **Type safety:** Import styles as objects
- **Performance:** Automatic code splitting
- **Simplicity:** No additional build complexity (built into Vite)

---

## Contact & Support

**Project Lead:** Bex (bex@sugartown.io)  
**GitHub:** @bex-sugartown  
**Built:** January 19, 2025  

**For Questions:**
1. Check this document first
2. Review PRD for detailed specs
3. Search GitHub Issues
4. Create new issue in respective repo

---

**Document Version:** 1.0.0  
**Last Updated:** January 19, 2025  
**Status:** Blueprint for active development
