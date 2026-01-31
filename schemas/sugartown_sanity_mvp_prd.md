# Product Requirements Document (PRD)
## Sugartown Sanity Foundation — MVP Setup

---

## 1. Executive Summary

**What:** Set up Sanity CMS infrastructure with basic Sugartown design system (pink/seafoam) for a simple website with header/footer, hero banner, and RTE content blocks.

**Why:** Establish the foundational CMS layer before building Resume Factory v3. Learn Sanity workflows, test design system integration, and validate the local-to-production deployment pipeline.

**Scope:** MVP focuses on **infrastructure and proof-of-concept**, not feature completeness. This is the skeleton; Resume Factory adds the organs.

---

## 2. Problem Statement

You need a working Sanity environment before you can build Resume Factory. This MVP answers:

1. **Environment:** How do I run Sanity Studio locally AND deploy to production?
2. **Content Model:** What's the simplest schema to test CMS capabilities?
3. **Design System:** How do I implement Sugartown Pink branding in Sanity Studio and frontend?
4. **Deployment:** How do I keep local and production in sync?

### 2.1 What This Is NOT

- ❌ Full Resume Factory implementation (see separate PRD)
- ❌ Complex content modeling with references/arrays
- ❌ Multi-page routing or navigation systems
- ❌ User authentication or multi-tenant setup

---

## 3. Goals & Success Criteria

| Goal | Success Criteria |
| :--- | :--- |
| **Local Sanity Studio** | Run `sanity dev` and edit content at `http://localhost:3333` |
| **Production Studio** | Deploy Studio to `[your-project].sanity.studio` with same content |
| **Content Sync** | Changes in production Studio appear locally (and vice versa) |
| **Basic Frontend** | HTML page fetches and displays Sanity content via GROQ API |
| **Design System** | Sugartown Pink (#FF69B4) + Seafoam (#2BD4AA) applied to Studio and frontend |
| **Simple Content Model** | Header, Footer, Hero Banner with RTE working end-to-end |

---

## 4. Technical Architecture

### 4.1 System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                 SANITY CMS (Content Lake)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Studio (Local)         Studio (Production)          │   │
│  │  localhost:3333    ←→   yourproject.sanity.studio    │   │
│  └──────────────────────────────────────────────────────┘   │
│                            ↕                                 │
│                      GROQ API (CDN)                          │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Pair Server)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   Simple HTML/CSS/JS Page (Vanilla or React)         │   │
│  │   - Header (from Sanity)                             │   │
│  │   - Hero Banner (from Sanity)                        │   │
│  │   - RTE Content Block (from Sanity)                  │   │
│  │   - Footer (from Sanity)                             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Tech Stack

| Layer | Technology | Notes |
| :--- | :--- | :--- |
| **CMS** | Sanity.io | Free tier includes 3 users, 10k documents, 500GB bandwidth |
| **Studio** | Sanity Studio (React-based) | Runs on localhost:3333 (dev) or deployed subdomain |
| **Content API** | GROQ (Graph-Relational Object Queries) | RESTful API with rich query language |
| **Frontend** | React 18+ with Vite | Fast dev server, optimized builds |
| **Content Rendering** | @portabletext/react | Official Portable Text → React component library |
| **Hosting** | Pair Server (FTP/SSH) | `/usr/home/bhead/public_html/sugartown` |
| **Deployment** | Git + GitHub Actions | Automated build → SSH deploy |
| **Styling** | CSS Modules + Design Tokens | Component-scoped styles with global tokens |

---

## 5. Environment Setup

### 5.1 Prerequisites

Before you start, you need:

- [x] Node.js 18+ installed (`node --version`)
- [x] npm or yarn package manager
- [x] Sanity account (free signup at sanity.io)
- [x] Git for version control
- [x] Code editor (VS Code recommended)
- [x] Access to your pair web server (SSH/FTP credentials)

### 5.2 Local Development Environment

**Step 1: Install Sanity CLI**
```bash
npm install -g @sanity/cli
```

**Step 2: Create New Sanity Project**
```bash
# Option A: Clean slate (recommended for learning)
sanity init

# Follow prompts:
# - Login with Google/GitHub
# - Create new project: "sugartown-resume-factory"
# - Use schema template: "Clean project with no predefined schemas"
# - Output path: ./sugartown-sanity

cd sugartown-sanity
```

**Step 3: Project Structure**
```
sugartown-sanity/
├── sanity.config.js       # Studio configuration
├── sanity.cli.js          # CLI configuration
├── schemas/               # Content type definitions
│   ├── index.js          # Schema registry
│   ├── header.js         # Header schema
│   ├── footer.js         # Footer schema
│   ├── hero.js           # Hero banner schema
│   └── contentBlock.js   # RTE content block schema
├── package.json
└── README.md
```

**Step 4: Run Local Studio**
```bash
sanity dev
# Opens http://localhost:3333
```

### 5.3 Production Environment

**Deploy Sanity Studio:**
```bash
# From project directory
sanity deploy

# Follow prompts:
# - Studio hostname: sugartown-resume (becomes sugartown-resume.sanity.studio)
```

**API Configuration:**
- **Dataset:** `production` (default)
- **API Version:** `2024-01-01` (use dated versions for stability)
- **CORS Origins:** Add your pair server domain in Sanity dashboard
  - Go to https://sanity.io/manage
  - Select project → API → CORS Origins
  - Add: `https://yourdomain.com` (or `http://localhost` for local testing)

### 5.4 Environment Variables

Create `.env.local` for local development:
```bash
# .env.local (DO NOT COMMIT)
SANITY_PROJECT_ID=your_project_id  # From sanity.json
SANITY_DATASET=production
SANITY_API_VERSION=2024-01-01
SANITY_TOKEN=your_read_token  # Create in Sanity dashboard (read-only for frontend)
```

**Security Notes:**
- ✅ Read-only tokens for frontend (public)
- ⚠️ Write tokens ONLY for server-side operations (never expose to frontend)
- 🔒 Use `.env` files, never hardcode tokens

---

## 6. Sanity Schema Design (MVP)

### 6.1 Core Principles

1. **Atomic Components First:** Build small, reusable objects (link, logo, media) that compose into documents
2. **Singleton Documents:** Header/Footer are singletons (only one instance exists)
3. **Portable Text:** Rich text uses Sanity's Portable Text format (not raw HTML)
4. **Design System Alignment:** Schema objects mirror frontend component library

### 6.2 Atomic Object Library

**Link Object**
```javascript
// schemas/objects/link.js
export default {
  name: 'link',
  title: 'Link',
  type: 'object',
  fields: [
    {
      name: 'label',
      title: 'Link Text',
      type: 'string',
      description: 'Visible text for the link',
      validation: Rule => Rule.required()
    },
    {
      name: 'url',
      title: 'URL',
      type: 'url',
      description: 'External URL or internal path (e.g., /about, https://example.com)',
      validation: Rule => Rule.required().uri({
        scheme: ['http', 'https', 'mailto', 'tel'],
        allowRelative: true
      })
    },
    {
      name: 'openInNewTab',
      title: 'Open in New Tab',
      type: 'boolean',
      description: 'Open link in new browser tab/window',
      initialValue: false
    }
  ],
  preview: {
    select: {
      title: 'label',
      subtitle: 'url'
    },
    prepare({ title, subtitle }) {
      return {
        title: title,
        subtitle: subtitle,
        media: () => '🔗'
      }
    }
  }
}
```

**Logo Object**
```javascript
// schemas/objects/logo.js
export default {
  name: 'logo',
  title: 'Logo',
  type: 'object',
  fields: [
    {
      name: 'image',
      title: 'Logo Image',
      type: 'image',
      options: {
        hotspot: true // Enable focal point selection
      },
      fields: [
        {
          name: 'alt',
          title: 'Alternative Text',
          type: 'string',
          description: 'Describe the logo for screen readers (required for accessibility)',
          validation: Rule => Rule.required()
        }
      ]
    },
    {
      name: 'linkUrl',
      title: 'Logo Link',
      type: 'url',
      description: 'Where should the logo link to? (typically homepage)',
      initialValue: '/',
      validation: Rule => Rule.uri({
        scheme: ['http', 'https'],
        allowRelative: true
      })
    },
    {
      name: 'width',
      title: 'Display Width (px)',
      type: 'number',
      description: 'Logo width in pixels (height auto-scales)',
      initialValue: 120,
      validation: Rule => Rule.min(40).max(400)
    }
  ],
  preview: {
    select: {
      media: 'image',
      alt: 'image.alt'
    },
    prepare({ media, alt }) {
      return {
        title: 'Logo',
        subtitle: alt,
        media: media
      }
    }
  }
}
```

**Media Object**
```javascript
// schemas/objects/media.js
export default {
  name: 'media',
  title: 'Media',
  type: 'object',
  fields: [
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true
      },
      fields: [
        {
          name: 'alt',
          title: 'Alternative Text',
          type: 'string',
          description: 'Describe the image for accessibility',
          validation: Rule => Rule.required()
        }
      ],
      validation: Rule => Rule.required()
    },
    {
      name: 'caption',
      title: 'Caption',
      type: 'string',
      description: 'Optional image caption (shown below image)'
    }
  ],
  preview: {
    select: {
      media: 'image',
      alt: 'image.alt',
      caption: 'caption'
    },
    prepare({ media, alt, caption }) {
      return {
        title: alt,
        subtitle: caption || 'No caption',
        media: media
      }
    }
  }
}
```

**Navigation Item Object**
```javascript
// schemas/objects/navigationItem.js
export default {
  name: 'navigationItem',
  title: 'Navigation Item',
  type: 'object',
  fields: [
    {
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'Text shown in navigation',
      validation: Rule => Rule.required()
    },
    {
      name: 'url',
      title: 'URL',
      type: 'url',
      description: 'Link destination',
      validation: Rule => Rule.required().uri({
        scheme: ['http', 'https'],
        allowRelative: true
      })
    },
    {
      name: 'isActive',
      title: 'Highlight as Active',
      type: 'boolean',
      description: 'Visually indicate this is the current page',
      initialValue: false
    },
    {
      name: 'openInNewTab',
      title: 'Open in New Tab',
      type: 'boolean',
      initialValue: false
    }
  ],
  preview: {
    select: {
      title: 'label',
      subtitle: 'url',
      isActive: 'isActive'
    },
    prepare({ title, subtitle, isActive }) {
      return {
        title: isActive ? `${title} ⭐` : title,
        subtitle: subtitle
      }
    }
  }
}
```

**Social Link Object**
```javascript
// schemas/objects/socialLink.js
export default {
  name: 'socialLink',
  title: 'Social Link',
  type: 'object',
  fields: [
    {
      name: 'platform',
      title: 'Platform',
      type: 'string',
      description: 'Social media platform (determines icon)',
      options: {
        list: [
          { title: 'LinkedIn', value: 'linkedin' },
          { title: 'GitHub', value: 'github' },
          { title: 'Twitter/X', value: 'twitter' },
          { title: 'Instagram', value: 'instagram' },
          { title: 'YouTube', value: 'youtube' },
          { title: 'Facebook', value: 'facebook' },
          { title: 'Dribbble', value: 'dribbble' },
          { title: 'Behance', value: 'behance' }
        ]
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'url',
      title: 'Profile URL',
      type: 'url',
      description: 'Full URL to your profile',
      validation: Rule => Rule.required()
    },
    {
      name: 'label',
      title: 'Accessible Label',
      type: 'string',
      description: 'Screen reader text (e.g., "Visit my LinkedIn profile")',
      validation: Rule => Rule.required()
    }
  ],
  preview: {
    select: {
      platform: 'platform',
      url: 'url'
    },
    prepare({ platform, url }) {
      const icons = {
        linkedin: '💼',
        github: '🐙',
        twitter: '🐦',
        instagram: '📷',
        youtube: '▶️',
        facebook: '👥',
        dribbble: '🏀',
        behance: '🎨'
      }
      return {
        title: platform.charAt(0).toUpperCase() + platform.slice(1),
        subtitle: url,
        media: () => icons[platform] || '🔗'
      }
    }
  }
}
```


### 6.3 Document Schemas (Composites)

**Header (Singleton)**
```javascript
// schemas/documents/header.js
export default {
  name: 'header',
  title: 'Site Header',
  type: 'document',
  fields: [
    {
      name: 'logo',
      title: 'Site Logo',
      type: 'logo',
      description: 'Appears in top-left of header'
    },
    {
      name: 'navigation',
      title: 'Main Navigation',
      type: 'array',
      of: [{ type: 'navigationItem' }],
      description: 'Primary navigation menu items',
      validation: Rule => Rule.max(7).warning('Consider limiting to 7 items for better UX')
    },
    {
      name: 'ctaButton',
      title: 'Call-to-Action Button',
      type: 'link',
      description: 'Optional highlighted button (e.g., "Contact", "Sign Up")'
    }
  ],
  preview: {
    prepare() {
      return {
        title: 'Site Header',
        subtitle: 'Global navigation and branding'
      }
    }
  }
}
```

**Footer (Singleton)**
```javascript
// schemas/documents/footer.js
export default {
  name: 'footer',
  title: 'Site Footer',
  type: 'document',
  fields: [
    {
      name: 'logo',
      title: 'Footer Logo',
      type: 'logo',
      description: 'Optional logo in footer (can differ from header logo)'
    },
    {
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'Short brand statement or mission (e.g., "Building better resumes")'
    },
    {
      name: 'navigationColumns',
      title: 'Footer Navigation Columns',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'navColumn',
          fields: [
            {
              name: 'heading',
              title: 'Column Heading',
              type: 'string',
              description: 'E.g., "Company", "Resources", "Legal"'
            },
            {
              name: 'links',
              title: 'Links',
              type: 'array',
              of: [{ type: 'link' }]
            }
          ],
          preview: {
            select: {
              title: 'heading',
              links: 'links'
            },
            prepare({ title, links }) {
              return {
                title: title,
                subtitle: `${links?.length || 0} links`
              }
            }
          }
        }
      ],
      description: 'Organize footer links into columns'
    },
    {
      name: 'socialLinks',
      title: 'Social Media Links',
      type: 'array',
      of: [{ type: 'socialLink' }],
      description: 'Social media profiles'
    },
    {
      name: 'copyrightText',
      title: 'Copyright Text',
      type: 'string',
      description: 'E.g., © 2025 Sugartown. All rights reserved.',
      initialValue: `© ${new Date().getFullYear()} Sugartown. All rights reserved.`
    },
    {
      name: 'legalLinks',
      title: 'Legal Links',
      type: 'array',
      of: [{ type: 'link' }],
      description: 'Privacy Policy, Terms of Service, etc.'
    }
  ],
  preview: {
    prepare() {
      return {
        title: 'Site Footer',
        subtitle: 'Global footer content'
      }
    }
  }
}
```

**Hero Banner**
```javascript
// schemas/documents/hero.js
export default {
  name: 'hero',
  title: 'Hero Banner',
  type: 'document',
  fields: [
    {
      name: 'heading',
      title: 'Main Heading',
      type: 'string',
      validation: Rule => Rule.required().max(80)
    },
    {
      name: 'subheading',
      title: 'Subheading',
      type: 'text',
      rows: 3,
      validation: Rule => Rule.max(200)
    },
    {
      name: 'ctaButton',
      title: 'Call-to-Action Button',
      type: 'link',
      description: 'Primary action button'
    },
    {
      name: 'secondaryCta',
      title: 'Secondary CTA',
      type: 'link',
      description: 'Optional second button (less prominent styling)'
    },
    {
      name: 'backgroundMedia',
      title: 'Background Image',
      type: 'media',
      description: 'Optional background image (hero text overlays this)'
    },
    {
      name: 'backgroundStyle',
      title: 'Background Style',
      type: 'string',
      options: {
        list: [
          { title: 'Sugartown Pink', value: 'pink' },
          { title: 'Seafoam', value: 'seafoam' },
          { title: 'White', value: 'white' },
          { title: 'Image', value: 'image' }
        ]
      },
      initialValue: 'pink',
      description: 'Solid color or use background image'
    }
  ],
  preview: {
    select: {
      title: 'heading',
      subtitle: 'subheading',
      media: 'backgroundMedia.image'
    }
  }
}
```

**Content Block (Simple RTE)**
```javascript
// schemas/documents/contentBlock.js
export default {
  name: 'contentBlock',
  title: 'Content Block',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Block Title',
      type: 'string',
      description: 'Internal reference (not displayed on frontend)'
    },
    {
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'Quote', value: 'blockquote' }
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
              { title: 'Code', value: 'code' }
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'External Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL'
                  }
                ]
              }
            ]
          }
        },
        {
          type: 'media',
          title: 'Image'
        }
      ]
    }
  ],
  preview: {
    select: {
      title: 'title'
    },
    prepare({ title }) {
      return {
        title: title || 'Untitled Content Block'
      }
    }
  }
}
```


### 6.4 Schema Registry

```javascript
// schemas/index.js
// Import atomic objects (reusable building blocks)
import link from './objects/link'
import logo from './objects/logo'
import media from './objects/media'
import navigationItem from './objects/navigationItem'
import socialLink from './objects/socialLink'

// Import document schemas (top-level content types)
import header from './documents/header'
import footer from './documents/footer'
import hero from './documents/hero'
import contentBlock from './documents/contentBlock'

export const schemaTypes = [
  // Objects first (dependencies for documents)
  link,
  logo,
  media,
  navigationItem,
  socialLink,
  
  // Documents (top-level content types)
  header,
  footer,
  hero,
  contentBlock
]
```

### 6.5 Singleton Configuration

To ensure only ONE header/footer exists, configure in `sanity.config.js`:

```javascript
// sanity.config.js
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemas'

export default defineConfig({
  name: 'default',
  title: 'Sugartown',
  
  projectId: 'your_project_id',
  dataset: 'production',
  
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            // Singletons (only one instance allowed)
            S.listItem()
              .title('🎀 Site Header')
              .icon(() => '📍')
              .child(
                S.document()
                  .schemaType('header')
                  .documentId('singleton-header')
              ),
            S.listItem()
              .title('🎀 Site Footer')
              .icon(() => '📌')
              .child(
                S.document()
                  .schemaType('footer')
                  .documentId('singleton-footer')
              ),
            
            // Divider
            S.divider(),
            
            // Regular documents (can have multiple)
            S.documentTypeListItem('hero')
              .title('Hero Banners'),
            S.documentTypeListItem('contentBlock')
              .title('Content Blocks')
          ])
    }),
    visionTool() // GROQ query playground
  ],
  
  schema: {
    types: schemaTypes,
  },
  
  // Studio appearance (Sugartown branding)
  theme: {
    '--brand-primary': '#FF69B4',        // Sugartown Pink
    '--brand-secondary': '#2BD4AA',      // Seafoam
    '--component-bg': '#FFFFFF',
    '--component-text-color': '#1A1A1A'
  }
})
```

---

## 7. Design System Implementation

### 7.1 Sugartown Brand Tokens

```css
/* design-tokens.css */
:root {
  /* Colors */
  --st-pink: #FF69B4;
  --st-seafoam: #2BD4AA;
  --st-white: #FFFFFF;
  --st-black: #1A1A1A;
  --st-gray-light: #F5F5F5;
  --st-gray-medium: #9E9E9E;
  
  /* Typography */
  --st-font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  --st-font-mono: 'SF Mono', Monaco, 'Courier New', monospace;
  
  /* Spacing (8px grid) */
  --st-space-xs: 0.5rem;   /* 8px */
  --st-space-sm: 1rem;     /* 16px */
  --st-space-md: 1.5rem;   /* 24px */
  --st-space-lg: 2rem;     /* 32px */
  --st-space-xl: 3rem;     /* 48px */
  
  /* Borders */
  --st-radius-sm: 4px;
  --st-radius-md: 8px;
  --st-radius-lg: 16px;
}
```

### 7.2 Studio Branding

Customize Sanity Studio appearance:

```javascript
// sanity.config.js (add to defineConfig)
export default defineConfig({
  // ... existing config
  
  theme: {
    '--brand-primary': '#FF69B4',        // Sugartown Pink
    '--brand-secondary': '#2BD4AA',      // Seafoam
    '--component-bg': '#FFFFFF',
    '--component-text-color': '#1A1A1A'
  }
})
```

### 7.3 Frontend CSS Baseline

```css
/* styles.css */
@import 'design-tokens.css';

/* Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--st-font-sans);
  color: var(--st-black);
  background-color: var(--st-white);
  line-height: 1.6;
}

/* Header Component */
.st-header {
  background-color: var(--st-pink);
  color: var(--st-white);
  padding: var(--st-space-md);
}

.st-header__nav {
  display: flex;
  gap: var(--st-space-md);
  list-style: none;
}

.st-header__link {
  color: var(--st-white);
  text-decoration: none;
  font-weight: 600;
}

.st-header__link:hover {
  text-decoration: underline;
}

/* Hero Component */
.st-hero {
  padding: var(--st-space-xl) var(--st-space-md);
  text-align: center;
}

.st-hero--pink {
  background-color: var(--st-pink);
  color: var(--st-white);
}

.st-hero--seafoam {
  background-color: var(--st-seafoam);
  color: var(--st-white);
}

.st-hero--white {
  background-color: var(--st-white);
  color: var(--st-black);
}

.st-hero__heading {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: var(--st-space-sm);
}

.st-hero__subheading {
  font-size: 1.25rem;
  margin-bottom: var(--st-space-md);
}

.st-hero__cta {
  display: inline-block;
  background-color: var(--st-seafoam);
  color: var(--st-white);
  padding: var(--st-space-sm) var(--st-space-lg);
  border-radius: var(--st-radius-md);
  text-decoration: none;
  font-weight: 600;
}

/* Content Block */
.st-content {
  max-width: 800px;
  margin: var(--st-space-xl) auto;
  padding: 0 var(--st-space-md);
}

.st-content p {
  margin-bottom: var(--st-space-md);
}

.st-content strong {
  font-weight: 700;
}

.st-content em {
  font-style: italic;
}

.st-content a {
  color: var(--st-pink);
  text-decoration: underline;
}

.st-content blockquote {
  border-left: 4px solid var(--st-seafoam);
  padding-left: var(--st-space-md);
  margin: var(--st-space-md) 0;
  font-style: italic;
  color: var(--st-gray-medium);
}

/* Footer Component */
.st-footer {
  background-color: var(--st-black);
  color: var(--st-white);
  padding: var(--st-space-lg) var(--st-space-md);
  text-align: center;
}

.st-footer__social {
  display: flex;
  justify-content: center;
  gap: var(--st-space-md);
  list-style: none;
  margin-bottom: var(--st-space-sm);
}

.st-footer__link {
  color: var(--st-seafoam);
  text-decoration: none;
}

.st-footer__link:hover {
  text-decoration: underline;
}
```

---

## 8. React Frontend Implementation

### 8.1 Project Setup

**Create React App with Vite:**
```bash
npm create vite@latest sugartown-frontend -- --template react
cd sugartown-frontend
npm install

# Install Sanity client and Portable Text renderer
npm install @sanity/client @sanity/image-url @portabletext/react

# Install additional dependencies
npm install react-router-dom
```

**Project Structure:**
```
sugartown-frontend/
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Header.module.css
│   │   ├── Footer.jsx
│   │   ├── Footer.module.css
│   │   ├── Hero.jsx
│   │   ├── Hero.module.css
│   │   ├── ContentBlock.jsx
│   │   ├── ContentBlock.module.css
│   │   └── atoms/
│   │       ├── Link.jsx
│   │       ├── Logo.jsx
│   │       ├── Media.jsx
│   │       ├── NavigationItem.jsx
│   │       └── SocialLink.jsx
│   ├── lib/
│   │   ├── sanity.js (client config)
│   │   └── queries.js (GROQ queries)
│   ├── styles/
│   │   └── design-tokens.css
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.local
└── package.json
```

### 8.2 Sanity Client Configuration

**.env.local**
```bash
VITE_SANITY_PROJECT_ID=your_project_id
VITE_SANITY_DATASET=production
VITE_SANITY_API_VERSION=2024-01-01
```

**src/lib/sanity.js**
```javascript
import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET,
  apiVersion: import.meta.env.VITE_SANITY_API_VERSION,
  useCdn: true, // Use CDN for faster, cached responses
})

// Helper for generating image URLs
const builder = imageUrlBuilder(client)

export function urlFor(source) {
  return builder.image(source)
}
```

**src/lib/queries.js**
```javascript
// GROQ queries for fetching content
export const queries = {
  header: `*[_type == "header" && _id == "singleton-header"][0]{
    logo{
      image{
        asset->{url},
        alt
      },
      linkUrl,
      width
    },
    navigation[]{
      label,
      url,
      isActive,
      openInNewTab
    },
    ctaButton{
      label,
      url,
      openInNewTab
    }
  }`,
  
  footer: `*[_type == "footer" && _id == "singleton-footer"][0]{
    logo{
      image{
        asset->{url},
        alt
      },
      linkUrl,
      width
    },
    tagline,
    navigationColumns[]{
      heading,
      links[]{
        label,
        url,
        openInNewTab
      }
    },
    socialLinks[]{
      platform,
      url,
      label
    },
    copyrightText,
    legalLinks[]{
      label,
      url,
      openInNewTab
    }
  }`,
  
  hero: `*[_type == "hero"][0]{
    heading,
    subheading,
    ctaButton{
      label,
      url,
      openInNewTab
    },
    secondaryCta{
      label,
      url,
      openInNewTab
    },
    backgroundMedia{
      image{
        asset->{url},
        alt
      },
      caption
    },
    backgroundStyle
  }`,
  
  content: `*[_type == "contentBlock"][0]{
    title,
    content[]{
      ...,
      _type == "media" => {
        image{
          asset->{url},
          alt
        },
        caption
      }
    }
  }`
}
```

### 8.3 Atomic React Components

**src/components/atoms/Link.jsx**
```javascript
export default function Link({ label, url, openInNewTab, className = '' }) {
  const attrs = openInNewTab 
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {}
  
  return (
    <a href={url} className={className} {...attrs}>
      {label}
    </a>
  )
}
```

**src/components/atoms/Logo.jsx**
```javascript
export default function Logo({ image, linkUrl, width, className = '' }) {
  if (!image?.asset?.url) return null
  
  return (
    <a href={linkUrl || '/'} className={className}>
      <img 
        src={image.asset.url} 
        alt={image.alt} 
        width={width || 120}
        style={{ height: 'auto' }}
      />
    </a>
  )
}
```

**src/components/atoms/Media.jsx**
```javascript
export default function Media({ image, caption, className = '' }) {
  if (!image?.asset?.url) return null
  
  return (
    <figure className={className}>
      <img src={image.asset.url} alt={image.alt} />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}
```

**src/components/atoms/NavigationItem.jsx**
```javascript
import styles from './NavigationItem.module.css'

export default function NavigationItem({ label, url, isActive, openInNewTab }) {
  const attrs = openInNewTab 
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {}
  
  return (
    <a 
      href={url} 
      className={isActive ? `${styles.link} ${styles.active}` : styles.link}
      aria-current={isActive ? 'page' : undefined}
      {...attrs}
    >
      {label}
    </a>
  )
}
```

**src/components/atoms/SocialLink.jsx**
```javascript
import styles from './SocialLink.module.css'

// Icon mapping (could use react-icons or custom SVGs)
const platformIcons = {
  linkedin: '💼',
  github: '🐙',
  twitter: '🐦',
  instagram: '📷',
  youtube: '▶️',
  facebook: '👥',
  dribbble: '🏀',
  behance: '🎨'
}

export default function SocialLink({ platform, url, label }) {
  return (
    <a 
      href={url} 
      className={styles.link}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className={styles.icon} aria-hidden="true">
        {platformIcons[platform] || '🔗'}
      </span>
      <span className={styles.label}>{label}</span>
    </a>
  )
}
```

### 8.4 Composite Components

**src/components/Header.jsx**
```javascript
import { useEffect, useState } from 'react'
import { client } from '../lib/sanity'
import { queries } from '../lib/queries'
import Logo from './atoms/Logo'
import NavigationItem from './atoms/NavigationItem'
import Link from './atoms/Link'
import styles from './Header.module.css'

export default function Header() {
  const [data, setData] = useState(null)
  
  useEffect(() => {
    client.fetch(queries.header)
      .then(setData)
      .catch(console.error)
  }, [])
  
  if (!data) return null
  
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {data.logo && <Logo {...data.logo} className={styles.logo} />}
        
        <nav className={styles.nav} aria-label="Main navigation">
          {data.navigation?.map((item, i) => (
            <NavigationItem key={i} {...item} />
          ))}
        </nav>
        
        {data.ctaButton && (
          <Link {...data.ctaButton} className={styles.cta} />
        )}
      </div>
    </header>
  )
}
```

**src/components/Header.module.css**
```css
.header {
  background-color: var(--st-pink);
  color: var(--st-white);
  padding: var(--st-space-md);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: var(--st-space-lg);
}

.logo {
  flex-shrink: 0;
}

.nav {
  display: flex;
  gap: var(--st-space-md);
  flex: 1;
}

.cta {
  background-color: var(--st-seafoam);
  color: var(--st-white);
  padding: var(--st-space-sm) var(--st-space-md);
  border-radius: var(--st-radius-md);
  text-decoration: none;
  font-weight: 600;
  white-space: nowrap;
}

.cta:hover {
  opacity: 0.9;
}
```

**src/components/Footer.jsx**
```javascript
import { useEffect, useState } from 'react'
import { client } from '../lib/sanity'
import { queries } from '../lib/queries'
import Logo from './atoms/Logo'
import Link from './atoms/Link'
import SocialLink from './atoms/SocialLink'
import styles from './Footer.module.css'

export default function Footer() {
  const [data, setData] = useState(null)
  
  useEffect(() => {
    client.fetch(queries.footer)
      .then(setData)
      .catch(console.error)
  }, [])
  
  if (!data) return null
  
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          {data.logo && <Logo {...data.logo} className={styles.logo} />}
          {data.tagline && <p className={styles.tagline}>{data.tagline}</p>}
        </div>
        
        {data.navigationColumns && (
          <div className={styles.columns}>
            {data.navigationColumns.map((col, i) => (
              <div key={i} className={styles.column}>
                <h3 className={styles.columnHeading}>{col.heading}</h3>
                <ul className={styles.linkList}>
                  {col.links?.map((link, j) => (
                    <li key={j}>
                      <Link {...link} className={styles.link} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
        
        {data.socialLinks && (
          <div className={styles.social}>
            {data.socialLinks.map((social, i) => (
              <SocialLink key={i} {...social} />
            ))}
          </div>
        )}
        
        <div className={styles.bottom}>
          <p className={styles.copyright}>{data.copyrightText}</p>
          {data.legalLinks && (
            <div className={styles.legal}>
              {data.legalLinks.map((link, i) => (
                <Link key={i} {...link} className={styles.legalLink} />
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}
```

**src/components/Hero.jsx**
```javascript
import { useEffect, useState } from 'react'
import { client } from '../lib/sanity'
import { queries } from '../lib/queries'
import Link from './atoms/Link'
import styles from './Hero.module.css'

export default function Hero() {
  const [data, setData] = useState(null)
  
  useEffect(() => {
    client.fetch(queries.hero)
      .then(setData)
      .catch(console.error)
  }, [])
  
  if (!data) return null
  
  const bgStyle = data.backgroundStyle || 'pink'
  const bgImage = data.backgroundMedia?.image?.asset?.url
  
  return (
    <section 
      className={`${styles.hero} ${styles[bgStyle]}`}
      style={bgImage ? { backgroundImage: `url(${bgImage})` } : {}}
    >
      <div className={styles.container}>
        <h1 className={styles.heading}>{data.heading}</h1>
        {data.subheading && (
          <p className={styles.subheading}>{data.subheading}</p>
        )}
        <div className={styles.actions}>
          {data.ctaButton && (
            <Link {...data.ctaButton} className={styles.primaryCta} />
          )}
          {data.secondaryCta && (
            <Link {...data.secondaryCta} className={styles.secondaryCta} />
          )}
        </div>
      </div>
    </section>
  )
}
```

**src/components/ContentBlock.jsx**
```javascript
import { useEffect, useState } from 'react'
import { PortableText } from '@portabletext/react'
import { client } from '../lib/sanity'
import { queries } from '../lib/queries'
import Media from './atoms/Media'
import styles from './ContentBlock.module.css'

// Custom Portable Text components
const components = {
  types: {
    media: ({ value }) => <Media {...value} className={styles.media} />
  },
  block: {
    h2: ({ children }) => <h2 className={styles.h2}>{children}</h2>,
    h3: ({ children }) => <h3 className={styles.h3}>{children}</h3>,
    blockquote: ({ children }) => (
      <blockquote className={styles.blockquote}>{children}</blockquote>
    )
  },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    code: ({ children }) => <code className={styles.code}>{children}</code>,
    link: ({ value, children }) => (
      <a href={value.href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    )
  }
}

export default function ContentBlock() {
  const [data, setData] = useState(null)
  
  useEffect(() => {
    client.fetch(queries.content)
      .then(setData)
      .catch(console.error)
  }, [])
  
  if (!data?.content) return null
  
  return (
    <main className={styles.content}>
      <PortableText value={data.content} components={components} />
    </main>
  )
}
```

### 8.5 Main App Component

**src/App.jsx**
```javascript
import Header from './components/Header'
import Hero from './components/Hero'
import ContentBlock from './components/ContentBlock'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <Header />
      <Hero />
      <ContentBlock />
      <Footer />
    </>
  )
}
```

**src/main.jsx**
```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/design-tokens.css'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```


### 8.6 Sanity Studio Password Protection

To require login for Studio access, configure CORS and authentication:

**Option 1: Default Sanity Authentication (Recommended)**
- Studio automatically requires Google/GitHub/email login
- Configure allowed users in Sanity dashboard:
  1. Go to https://sanity.io/manage
  2. Select project → Members
  3. Invite only authorized users
  4. Remove public access

**Option 2: Custom Authentication (Advanced)**
```javascript
// sanity.config.js
export default defineConfig({
  // ... existing config
  
  auth: {
    // Require login for all Studio operations
    loginMethod: 'duplication',
    redirectOnSingle: true
  }
})
```

**Testing Access Control:**
```bash
# Deploy Studio
sanity deploy

# Test in incognito/private browsing
# Should redirect to login page
```

---

## 9. Git + Deployment Workflow

### 9.1 Repository Setup

**Create Two Repositories:**

1. **sugartown-sanity** (Sanity Studio schemas)
2. **sugartown-frontend** (React app)

```bash
# Initialize Sanity repo
cd sugartown-sanity
git init
git add .
git commit -m "Initial Sanity Studio setup"
git branch -M main
git remote add origin git@github.com:yourusername/sugartown-sanity.git
git push -u origin main

# Initialize Frontend repo
cd ../sugartown-frontend
git init
git add .
git commit -m "Initial React frontend setup"
git branch -M main
git remote add origin git@github.com:yourusername/sugartown-frontend.git
git push -u origin main
```

**Add .gitignore files:**

```bash
# sugartown-sanity/.gitignore
node_modules/
dist/
.env
.env.local
.sanity/

# sugartown-frontend/.gitignore
node_modules/
dist/
.env
.env.local
```

### 9.2 Local Development Workflow

**Sanity Studio:**
```bash
cd sugartown-sanity
git pull origin main
npm install
sanity dev  # Runs on localhost:3333

# Make changes to schemas
git add .
git commit -m "Add social link schema"
git push origin main

# Deploy Studio to production
sanity deploy
```

**React Frontend:**
```bash
cd sugartown-frontend
git pull origin main
npm install
npm run dev  # Runs on localhost:5173

# Make changes
git add .
git commit -m "Add Header component"
git push origin main

# Deploy to pair server (via GitHub Actions - see below)
```

### 9.3 Pair Server SSH Setup

**1. Generate SSH Key for Deployment:**
```bash
# On your local machine
ssh-keygen -t ed25519 -C "deploy@sugartown" -f ~/.ssh/sugartown_deploy
# Press enter for no passphrase

# Copy public key to pair server
ssh-copy-id -i ~/.ssh/sugartown_deploy.pub bhead@bhead.pairserver.com
```

**2. Test SSH Connection:**
```bash
ssh -i ~/.ssh/sugartown_deploy bhead@bhead.pairserver.com
# Should login without password

# Verify web directory
ls -la /usr/home/bhead/public_html/
```

**3. Create Deployment Directory on Server:**
```bash
# On pair server via SSH
cd /usr/home/bhead/public_html
mkdir -p sugartown
chmod 755 sugartown

# Test write permissions
touch sugartown/test.txt
rm sugartown/test.txt
```

### 9.4 GitHub Actions Deployment

**Add SSH Key as GitHub Secret:**

1. Go to GitHub repo → Settings → Secrets and variables → Actions
2. Add new repository secret:
   - Name: `SSH_PRIVATE_KEY`
   - Value: (paste contents of `~/.ssh/sugartown_deploy` private key)
3. Add additional secrets:
   - `SSH_HOST`: `bhead.pairserver.com`
   - `SSH_USER`: `bhead`
   - `SSH_PATH`: `/usr/home/bhead/public_html/sugartown`

**Create Deployment Workflow:**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Pair Server

on:
  push:
    branches: [ main ]
  workflow_dispatch:  # Allow manual trigger

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build production bundle
        run: npm run build
        env:
          VITE_SANITY_PROJECT_ID: ${{ secrets.VITE_SANITY_PROJECT_ID }}
          VITE_SANITY_DATASET: production
          VITE_SANITY_API_VERSION: 2024-01-01
      
      - name: Deploy to Pair Server
        uses: easingthemes/ssh-deploy@v4
        with:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          REMOTE_HOST: ${{ secrets.SSH_HOST }}
          REMOTE_USER: ${{ secrets.SSH_USER }}
          SOURCE: "dist/"
          TARGET: ${{ secrets.SSH_PATH }}
          ARGS: "-avz --delete"
          SCRIPT_BEFORE: |
            mkdir -p ${{ secrets.SSH_PATH }}
          SCRIPT_AFTER: |
            echo "Deployment complete!"
            ls -la ${{ secrets.SSH_PATH }}
```

**Add Build Secrets to GitHub:**

1. Go to Settings → Secrets → Actions
2. Add: `VITE_SANITY_PROJECT_ID` (your Sanity project ID)

### 9.5 Alternative: Manual Deployment via SSH

If you prefer manual deployments without GitHub Actions:

**Create Deployment Script:**

```bash
# deploy.sh (in sugartown-frontend root)
#!/bin/bash

echo "🎀 Building Sugartown Frontend..."
npm run build

echo "📦 Deploying to Pair Server..."
rsync -avz --delete \
  -e "ssh -i ~/.ssh/sugartown_deploy" \
  dist/ \
  bhead@bhead.pairserver.com:/usr/home/bhead/public_html/sugartown/

echo "✅ Deployment complete!"
echo "🌐 Visit: https://bhead.pairserver.com/sugartown"
```

```bash
chmod +x deploy.sh
./deploy.sh
```

### 9.6 Deployment Workflow Summary

```
┌─────────────────────────────────────────────────────────────┐
│                   LOCAL DEVELOPMENT                          │
│                                                               │
│  sugartown-sanity/     sugartown-frontend/                  │
│  ├─ schemas/           ├─ src/                              │
│  └─ sanity.config.js   └─ vite.config.js                    │
│                                                               │
│         ↓ git push              ↓ git push                   │
└─────────────────────────────────────────────────────────────┘
                    ↓                       ↓
┌─────────────────────────────────────────────────────────────┐
│                      GITHUB REPOS                            │
│                                                               │
│  yourusername/         yourusername/                         │
│  sugartown-sanity      sugartown-frontend                   │
│                        (triggers GitHub Actions)             │
└─────────────────────────────────────────────────────────────┘
         ↓                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     PRODUCTION                               │
│                                                               │
│  Sanity Studio              Frontend (Pair Server)          │
│  yourproject.sanity.studio  bhead.pairserver.com/sugartown  │
│  (via sanity deploy)        (via GitHub Actions or rsync)   │
└─────────────────────────────────────────────────────────────┘
```

### 9.7 Content Publishing Flow

```
1. Content Editor opens Studio (local or production)
   → https://yourproject.sanity.studio

2. Editor creates/updates content
   → Changes saved to Sanity Content Lake (instant)

3. Frontend fetches latest content via GROQ API
   → No rebuild needed (content is dynamic)

4. Developer pushes code changes
   → git push → GitHub Actions → Pair Server
   → Frontend rebuild required (code changes only)
```

**Key Insight:** Content changes are instant (no deployment). Code changes require rebuild + deployment.

---

## 10. MVP Implementation Plan

### Phase 1: Sanity Setup (Day 1, ~3 hours)

| Task | Estimated Time | Deliverable |
| :--- | :--- | :--- |
| Install Sanity CLI + create project | 20 min | Working `sanity dev` locally |
| Create atomic object schemas (link, logo, media, etc.) | 1.5 hours | All objects in `schemas/objects/` |
| Create document schemas (header, footer, hero, content) | 1 hour | All documents in `schemas/documents/` |
| Configure singleton structure + branding | 45 min | Studio shows singletons with pink/seafoam theme |
| Deploy Studio to production | 15 min | `yourproject.sanity.studio` accessible |
| Configure password protection | 10 min | Studio requires login |
| Initialize git repo + first commit | 10 min | `sugartown-sanity` repo on GitHub |

**Success Checkpoint:** You can create Header, Footer, Hero, and Content Block in Studio (with atomic components) and query data in Vision playground.

### Phase 2: React Frontend Setup (Day 2, ~4 hours)

| Task | Estimated Time | Deliverable |
| :--- | :--- | :--- |
| Create React app with Vite | 15 min | `npm run dev` works |
| Install Sanity client + Portable Text renderer | 10 min | Dependencies installed |
| Create design tokens CSS | 45 min | `design-tokens.css` with Sugartown variables |
| Build atomic components (Link, Logo, Media, etc.) | 1.5 hours | All atomic components in `components/atoms/` |
| Build composite components (Header, Footer, Hero, ContentBlock) | 1.5 hours | All main components working |
| Write GROQ queries | 30 min | Queries return correct data |
| Test locally with Sanity data | 30 min | App displays live Sanity content |
| Initialize git repo + first commit | 10 min | `sugartown-frontend` repo on GitHub |

**Success Checkpoint:** React app fetches and displays content from Sanity with proper component composition.

### Phase 3: Deployment (Day 3, ~2 hours)

| Task | Estimated Time | Deliverable |
| :--- | :--- | :--- |
| Generate SSH key for deployment | 10 min | Key added to pair server |
| Test SSH connection to pair server | 15 min | Passwordless login works |
| Add GitHub secrets (SSH key, Sanity project ID) | 10 min | Secrets configured |
| Create GitHub Actions workflow | 30 min | `.github/workflows/deploy.yml` |
| Test automated deployment | 20 min | Push triggers build + deploy |
| Configure CORS in Sanity for pair server domain | 10 min | No CORS errors on live site |
| Create deployment documentation | 30 min | README with deployment steps |

**Success Checkpoint:** Pushing to `main` branch automatically deploys to pair server. Site accessible at `https://bhead.pairserver.com/sugartown`.

### Phase 4: Content + Polish (Day 4, ~2 hours)

| Task | Estimated Time | Deliverable |
| :--- | :--- | :--- |
| Create real header content in Studio | 15 min | Logo + navigation configured |
| Create real footer content in Studio | 20 min | Footer columns + social links |
| Create hero banner content | 15 min | Heading + CTA buttons |
| Write sample content block | 20 min | Rich text with images |
| Test responsive design | 30 min | Mobile/tablet/desktop tested |
| Add error handling for missing content | 20 min | Graceful fallbacks |
| Write deployment + content editing docs | 30 min | Docs in both repos |

**Success Checkpoint:** MVP is production-ready with real content and comprehensive documentation.

---

## 11. Open Questions & Decisions

| Question | Decision | Status |
| :--- | :--- | :--- |
| Frontend: React or vanilla JS? | **React** | ✅ Decided |
| Deployment: FTP, SSH, or Git? | **Git + GitHub Actions + SSH** | ✅ Decided |
| Studio access control? | **Password-protected (Sanity auth)** | ✅ Decided |
| Staging dataset needed? | TBD - Start with production only | ⏳ Decide in Phase 1 |
| Component library: Build custom or use shadcn/MUI? | **Custom atomic components** | ✅ Decided |
| Image optimization: Use Sanity CDN or custom? | **Sanity CDN via @sanity/image-url** | ✅ Decided |
| Responsive breakpoints? | Mobile-first: 320px, 768px, 1024px, 1440px | ⏳ Finalize in Phase 2 |

---

## 12. Resources & Documentation

### Essential Reading
- [Sanity Docs: Getting Started](https://www.sanity.io/docs/getting-started)
- [Sanity Schema Types Reference](https://www.sanity.io/docs/schema-types)
- [GROQ Query Language](https://www.sanity.io/docs/groq)
- [Portable Text Spec](https://www.portabletext.org/)

### Tools
- **Vision Plugin:** Built-in GROQ playground (add `visionTool()` to config)
- **Sanity CLI:** `sanity --help` for all commands
- **API Explorer:** https://www.sanity.io/manage (project dashboard)

### Support Channels
- Sanity Slack: https://slack.sanity.io
- Community Forum: https://www.sanity.io/exchange/community
- GitHub Issues: https://github.com/sanity-io/sanity

---

## 13. Next Steps (Post-MVP)

Once this foundation is solid:

1. **Resume Factory Migration:** Port `master_resume_data.json` to Sanity schemas
2. **React Builder UI:** Build variant selector + preview components
3. **PDF Export:** Implement `react-pdf` or similar
4. **Advanced Content Modeling:** References, arrays, conditional fields
5. **Authentication:** Add login for Studio (if going multi-user)

---

**Document Version:** 1.0.0  
**Created:** January 2025  
**Author:** Bex + Claude  
**Related PRDs:** `sugartown_resume_factory_PRD_v3.md`  
**Status:** 🚧 Active Development

---

## Appendix A: Quick Reference Commands

### Sanity CLI Essentials
```bash
# Project Management
sanity init                    # Create new project
sanity dev                     # Run Studio locally (localhost:3333)
sanity deploy                  # Deploy Studio to production
sanity manage                  # Open project dashboard in browser
sanity dataset list            # List all datasets
sanity dataset create staging  # Create new dataset

# Useful GROQ Queries (test in Vision)
*[_type == "header" && _id == "singleton-header"][0]  # Get singleton header
*[_type == "hero"]                                     # Get all hero banners
*[_type == "contentBlock"]                            # Get all content blocks
count(*[_type == "header"])                           # Count header docs (should be 1)
```

### React Development Commands
```bash
# Development
npm run dev                    # Start dev server (localhost:5173)
npm run build                  # Build for production
npm run preview                # Preview production build locally

# Deployment
git add .                      # Stage changes
git commit -m "message"        # Commit changes
git push origin main           # Deploy via GitHub Actions

# Manual deployment (alternative)
./deploy.sh                    # Run deployment script
```

### Git Workflow
```bash
# Daily development
git pull origin main           # Get latest changes
# ... make changes ...
git status                     # Check what changed
git add .                      # Stage all changes
git commit -m "Add feature X"  # Commit with message
git push origin main           # Push to GitHub (triggers deploy)

# Branching (for larger features)
git checkout -b feature-name   # Create new branch
git push origin feature-name   # Push branch to GitHub
# ... create pull request on GitHub ...
git checkout main              # Switch back to main
git pull origin main           # Get merged changes
```

### SSH Deployment
```bash
# Test SSH connection
ssh -i ~/.ssh/sugartown_deploy bhead@bhead.pairserver.com

# Manual file sync (if not using GitHub Actions)
rsync -avz --delete -e "ssh -i ~/.ssh/sugartown_deploy" \
  dist/ bhead@bhead.pairserver.com:/usr/home/bhead/public_html/sugartown/

# Check deployed files
ssh -i ~/.ssh/sugartown_deploy bhead@bhead.pairserver.com \
  "ls -la /usr/home/bhead/public_html/sugartown/"
```

### Production Deployment Checklist
```
□ Schemas tested locally (sanity dev)
□ Content created in Studio
□ GROQ queries verified in Vision
□ React components tested locally (npm run dev)
□ Environment variables set in GitHub secrets
□ CORS origins configured for pair server domain
□ SSH key added to GitHub secrets
□ Studio deployed: sanity deploy
□ Frontend deployed: git push origin main
□ Test live site: https://bhead.pairserver.com/sugartown
```

---

## Appendix B: Troubleshooting

### Sanity Issues

**Problem:** "Cannot find module 'sanity'"  
**Solution:** Run `npm install` in project directory

**Problem:** CORS error in browser console  
**Solution:** Add your domain to CORS origins in Sanity dashboard (manage → API → CORS Origins → Add `https://bhead.pairserver.com`)

**Problem:** Vision plugin not showing  
**Solution:** Add `visionTool()` to `plugins` array in `sanity.config.js`

**Problem:** Singleton showing multiple instances  
**Solution:** Check `structure` config in `sanity.config.js` - ensure you're using `.documentId('singleton-header')`

**Problem:** Can't edit singleton (grayed out in Studio)  
**Solution:** Delete all duplicate instances first, then Studio will show the singleton

### React Issues

**Problem:** "Failed to fetch" error in console  
**Solution:** Check `.env.local` has correct `VITE_SANITY_PROJECT_ID`

**Problem:** Images not loading  
**Solution:** Ensure you're using `urlFor()` helper from `@sanity/image-url`, not raw asset URLs

**Problem:** Portable Text not rendering  
**Solution:** Verify you're using `<PortableText value={data.content} components={components} />` from `@portabletext/react`

**Problem:** Component shows "null" or empty  
**Solution:** Check GROQ query is returning data in Vision plugin. Add `console.log(data)` in component to debug.

**Problem:** Build fails with "process is not defined"  
**Solution:** Vite doesn't polyfill Node.js globals. Use environment variables correctly: `import.meta.env.VITE_*`

### Deployment Issues

**Problem:** GitHub Actions workflow not triggering  
**Solution:** Check `.github/workflows/deploy.yml` exists in repo and push is to `main` branch

**Problem:** SSH authentication failed  
**Solution:** Verify SSH key is correct format in GitHub secrets (include `-----BEGIN` and `-----END` lines)

**Problem:** Deployment succeeds but site shows old version  
**Solution:** Hard refresh browser (Cmd+Shift+R / Ctrl+F5) to bypass cache

**Problem:** 404 on pair server  
**Solution:** Check deployment path is correct: `/usr/home/bhead/public_html/sugartown/`

**Problem:** Images work locally but broken in production  
**Solution:** Check CORS is configured for production domain in Sanity dashboard

**Problem:** GitHub Actions build fails with env var error  
**Solution:** Add `VITE_SANITY_PROJECT_ID` to GitHub repo secrets

### Git Issues

**Problem:** "Permission denied (publickey)"  
**Solution:** Ensure SSH key is added: `ssh-add ~/.ssh/sugartown_deploy`

**Problem:** Merge conflicts  
**Solution:** Pull before push: `git pull origin main`, resolve conflicts, then `git push`

**Problem:** Accidentally committed .env file  
**Solution:**
```bash
git rm --cached .env.local
echo ".env.local" >> .gitignore
git add .gitignore
git commit -m "Remove .env from tracking"
git push origin main
```

---

**End of PRD** 🎀
