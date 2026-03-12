# Product Requirements Document (PRD)
## Sugartown Resume Factory v3.0 — Sanity + React Migration

---

## 1. Executive Summary

**Resume Factory v3.0** migrates the proven Python/CSV pipeline to a modern **Sanity CMS + React** stack, transforming the command-line tool into a web-based content management and delivery system. This migration decouples the system from WordPress while preserving the core architectural philosophy: **Single Source of Truth, Dynamic Composition, Hierarchical Precision.**

### 1.1 What Changes
- **Data Layer:** CSV/JSON → Sanity Studio (structured content)
- **Build Layer:** Python scripts → React components (client-side rendering)
- **Publishing:** WordPress REST API → Static hosting (Vercel/Netlify)

### 1.2 What Stays the Same
- Variant-based content selection logic
- Slot/bullet clustering and fallback hierarchy
- Three-tier composition model (Anchor > Domain > Flavor)
- Zero-hallucination principle (selection, not generation)

---

## 2. Problem Statement: Why Migrate?

### 2.1 Limitations of v2
| Issue | Impact | v3 Solution |
| :--- | :--- | :--- |
| **CSV Editing UX** | Non-technical collaborators can't help maintain data | Sanity Studio provides WYSIWYG editing |
| **Local-Only Scripts** | Can't build resumes from phone/tablet | React web app works anywhere |
| **WordPress Coupling** | Publishing tied to a specific CMS | Platform-agnostic static output |
| **Manual Workflow** | Must run 3 separate Python scripts sequentially | Single-page app with live preview |

### 2.2 What v2 Got Right ✅
- **Structured Data Model:** The Slot/Variant architecture is sound
- **Composition Logic:** Hierarchical fallback prevents empty resumes
- **Auto-Clustering:** Similarity matching reduces manual Slot_ID assignment
- **Metadata Flexibility:** Dynamic summaries per variant work well

---

## 3. Goals & Non-Goals

### 3.1 Goals (v3 MVP)

| Goal | Success Criteria |
| :--- | :--- |
| **Feature Parity** | All v2 capabilities work in React (build, preview, export) |
| **Content Portability** | Migrate existing `master_resume_data.json` into Sanity with zero data loss |
| **Editor Experience** | Non-devs can add/edit bullets in Sanity Studio without touching code |
| **Instant Preview** | Resume updates render in <1 second (vs 5 seconds in v2) |
| **Export Flexibility** | Generate PDF, Markdown, and HTML from the same data source |

### 3.2 Non-Goals (Deferred to v4)

| Non-Goal | Rationale |
| :--- | :--- |
| **AI-Powered Bullet Writing** | Focus on migration first; AI can be added later |
| **Public Resume Library** | MVP is for personal use; multi-tenant comes later |
| **Native Mobile App** | Progressive Web App (PWA) is sufficient for v3 |
| **ATS Parsing Integration** | Nice-to-have; not critical for MVP |

---

## 4. Technical Architecture

### 4.1 System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    SANITY CMS (Backend)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Basics     │  │ Work History │  │   Skills     │      │
│  │  (Contact)   │  │   (Jobs)     │  │  (Slots)     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │ GROQ API
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   REACT APP (Frontend)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Builder    │  │   Preview    │  │   Export     │      │
│  │  (Selector)  │──│  (Canvas)    │──│  (PDF/MD)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Sanity Schema Design

#### 4.2.1 Core Schema Types

**Link** (Reusable Object - Atomic Component)
```javascript
{
  name: 'link',
  type: 'object',
  fields: [
    { 
      name: 'url', 
      type: 'url',
      title: 'URL',
      validation: Rule => Rule.required()
    },
    { 
      name: 'label', 
      type: 'string',
      title: 'Link Label',
      description: 'Display text for the link (e.g., "LinkedIn Profile", "View Portfolio")',
      validation: Rule => Rule.required()
    },
    { 
      name: 'openInNewTab', 
      type: 'boolean',
      title: 'Open in New Tab',
      description: 'If checked, link will open in a new browser tab/window',
      initialValue: true
    }
  ],
  preview: {
    select: {
      title: 'label',
      subtitle: 'url'
    }
  }
}
```

**Basics** (Singleton Document)
```javascript
{
  name: 'basics',
  type: 'document',
  fields: [
    { name: 'fullName', type: 'string' },
    { name: 'location', type: 'string' },
    { name: 'email', type: 'string' },
    { name: 'phone', type: 'string' },
    { 
      name: 'linkedin', 
      type: 'link',
      title: 'LinkedIn Profile'
    },
    { 
      name: 'portfolio', 
      type: 'link',
      title: 'Portfolio Website'
    }
  ]
}
```

**Variant Definition** (Document)
```javascript
{
  name: 'variantDef',
  type: 'document',
  fields: [
    { name: 'variantId', type: 'string' }, // e.g., "CMS-DS-PDM-01"
    { name: 'roleTitle', type: 'string' }, // e.g., "Principal Product Manager"
    { 
      name: 'summary', 
      type: 'array',
      of: [{ type: 'block' }],
      title: 'Summary',
      description: 'Professional summary with rich text formatting (bold, italic, links)',
      // Custom editor config for summaries
      options: {
        spellCheck: true
      },
      // Limit to inline styles only (no headers, lists)
      styles: [
        { title: 'Normal', value: 'normal' }
      ],
      // Allow bold, italic, underline, and links
      marks: {
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Emphasis', value: 'em' },
          { title: 'Underline', value: 'underline' }
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [
              { name: 'href', type: 'url', title: 'URL' }
            ]
          }
        ]
      }
    },
    { name: 'colorScheme', type: 'string' } // Future: theme customization
  ]
}
```

**Job** (Document)
```javascript
{
  name: 'job',
  type: 'document',
  fields: [
    { name: 'company', type: 'string' },
    { name: 'role', type: 'string' },
    { name: 'dates', type: 'string' },
    { name: 'location', type: 'string' },
    { name: 'order', type: 'number' }, // For sorting
    { 
      name: 'slots',
      type: 'array',
      of: [{ type: 'slot' }] // Nested slots
    }
  ]
}
```

**Slot** (Object)
```javascript
{
  name: 'slot',
  type: 'object',
  fields: [
    { name: 'slotId', type: 'string' }, // e.g., "elc_auto_01"
    { name: 'header', type: 'string' }, // Optional skill header
    {
      name: 'variants',
      type: 'array',
      of: [{ type: 'bulletVariant' }]
    }
  ]
}
```

**Bullet Variant** (Object)
```javascript
{
  name: 'bulletVariant',
  type: 'object',
  fields: [
    { 
      name: 'variantType',
      type: 'reference',
      to: [{ type: 'variantDef' }] // Links to variant definition
    },
    { 
      name: 'content', 
      type: 'array',
      of: [{ type: 'block' }],
      title: 'Bullet Content',
      description: 'Resume bullet with rich text formatting (bold, italic, inline links)',
      // Custom editor config for bullets
      options: {
        spellCheck: true
      },
      // Single paragraph only (no headers)
      styles: [
        { title: 'Normal', value: 'normal' }
      ],
      // Allow bold, italic, and links (no underline for cleaner bullets)
      marks: {
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Emphasis', value: 'em' }
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [
              { name: 'href', type: 'url', title: 'URL' }
            ]
          }
        ]
      },
      // Disallow lists within bullets (bullets ARE the list)
      lists: []
    },
    { name: 'isMaster', type: 'boolean' } // Master fallback flag
  ]
}
```

#### 4.2.2 Link Object Usage Pattern

The `link` object is a reusable atomic component that should be used **anywhere a URL needs to be displayed as a clickable link**. This provides:

- **Consistent UX:** All links open in new tabs by default (configurable)
- **Semantic Data:** URL + Label separated, not hardcoded in text
- **Export Flexibility:** Same data structure works for HTML, PDF, and Markdown outputs
- **Editor-Friendly:** Non-technical users can update link labels without touching code

**Current Usage:**
- `basics.linkedin` - LinkedIn profile link
- `basics.portfolio` - Portfolio/personal website link

**Future v4 Usage:**
- Project/portfolio items with demo links
- Case study attachments
- GitHub repositories
- Publication DOI links
- Certification verification URLs
- Company websites in job entries

#### 4.2.3 Portable Text Configuration

**What is Portable Text?**  
Sanity's rich text format that stores content as structured JSON instead of raw HTML. This allows:
- **Format Preservation:** Bold, italic, and links survive across all export formats
- **Clean Data:** Text is stored semantically, not as markup strings
- **Flexible Rendering:** Same data renders as HTML, Markdown, or PDF
- **Editor Control:** Configure exactly which formatting options editors can use

**Configuration Strategy by Field Type:**

| Field | Styles | Decorators | Annotations | Lists | Rationale |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Variant Summary** | Normal only | Bold, Italic, Underline | Links | ❌ None | Summaries are prose paragraphs, not structured lists |
| **Bullet Content** | Normal only | Bold, Italic | Links | ❌ None | Bullets ARE the list; no nested lists needed |
| **Education Area** | Normal only | Bold, Italic | Links | ❌ None | Degree titles with emphasis (e.g., "B.A. in **Computer Science**") |

**Why No Headers/Lists in Bullets?**  
Resume bullets are already part of a list structure. Adding nested headers or lists would create confusing hierarchy and break PDF/ATS parsers. Keep bullets flat: one paragraph with inline formatting only.

**Example Portable Text Output:**
```json
// How "Led **5 cross-functional teams** to deliver..." is stored
{
  "_type": "block",
  "style": "normal",
  "children": [
    { "_type": "span", "text": "Led " },
    { "_type": "span", "text": "5 cross-functional teams", "marks": ["strong"] },
    { "_type": "span", "text": " to deliver..." }
  ]
}
```

### 4.3 React Component Architecture

```
src/
├── components/
│   ├── Builder/
│   │   ├── VariantSelector.jsx      # Dropdown to pick target variant
│   │   ├── ContentPreview.jsx       # Live content render
│   │   └── ExportPanel.jsx          # PDF/MD/HTML download
│   ├── Editor/
│   │   ├── BulletEditor.jsx         # Inline editing (future)
│   │   └── VariantManager.jsx       # CRUD for variant defs
│   ├── Display/
│   │   ├── ProfileHeader.jsx        # User name, contact info
│   │   ├── ContentSection.jsx       # Experience/Education wrapper
│   │   ├── ItemList.jsx             # Renders selected bullets/items
│   │   └── PortableTextRenderer.jsx # Renders Sanity Portable Text
│   └── UI/
│       └── SmartLink.jsx            # Reusable link component
├── hooks/
│   ├── useSanityData.js             # Fetch data via GROQ
│   ├── useContentBuilder.js         # Composition logic
│   └── useExport.js                 # PDF/MD generation
├── utils/
│   ├── compositionLogic.js          # Port of build_resume.py logic
│   ├── fallbackMatcher.js           # Port of similarity matching
│   ├── portableTextHelpers.js       # Convert Portable Text to MD/HTML/PDF
│   └── exportHelpers.js             # Markdown/PDF generators
└── App.jsx                          # Main layout
```

**PortableText Renderer:**
```javascript
// src/components/Display/PortableTextRenderer.jsx
import { PortableText } from '@portabletext/react';

const customComponents = {
  marks: {
    strong: ({children}) => <strong>{children}</strong>,
    em: ({children}) => <em>{children}</em>,
    underline: ({children}) => <u>{children}</u>,
    link: ({value, children}) => (
      <a href={value?.href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    )
  },
  block: {
    normal: ({children}) => <p>{children}</p>
  }
};

export const PortableTextRenderer = ({ value }) => {
  if (!value) return null;
  return <PortableText value={value} components={customComponents} />;
};
```

**ItemList Usage Example:**
```javascript
// src/components/Display/ItemList.jsx
import { PortableTextRenderer } from './PortableTextRenderer';

export const ItemList = ({ bullets }) => {
  return (
    <ul className="content-items">
      {bullets.map((bullet, idx) => (
        <li key={idx}>
          <PortableTextRenderer value={bullet.content} />
        </li>
      ))}
    </ul>
  );
};
```

**SmartLink Component Example:**
```javascript
// src/components/UI/SmartLink.jsx
export const SmartLink = ({ linkObject, className = '' }) => {
  if (!linkObject?.url) return null;
  
  return (
    <a
      href={linkObject.url}
      target={linkObject.openInNewTab ? '_blank' : '_self'}
      rel={linkObject.openInNewTab ? 'noopener noreferrer' : undefined}
      className={className}
    >
      {linkObject.label}
    </a>
  );
};
```

**ProfileHeader Usage Example:**
```javascript
// src/components/Display/ProfileHeader.jsx
import { SmartLink } from '../UI/SmartLink';

export const ProfileHeader = ({ basics }) => {
  return (
    <header className="profile-header">
      <h1>{basics.fullName}</h1>
      <div className="contact-info">
        <span>{basics.location}</span>
        <span>{basics.email}</span>
        <span>{basics.phone}</span>
        {basics.linkedin && <SmartLink linkObject={basics.linkedin} />}
        {basics.portfolio && <SmartLink linkObject={basics.portfolio} />}
      </div>
    </header>
  );
};
```

### 4.4 Core Logic: Composition Engine (Ported from v2)

**React Hook: `useContentBuilder.js`**
```javascript
function useContentBuilder(targetVariant) {
  const { data } = useSanityData(); // Fetch all content
  
  const selectItem = (slot) => {
    // 1. Exact match for target variant
    const exact = slot.variants.find(v => v.variantType._ref === targetVariant);
    if (exact) return exact; // Return full object (includes Portable Text content)
    
    // 2. Master fallback
    const master = slot.variants.find(v => v.isMaster);
    if (master) return master;
    
    // 3. No match
    return null;
  };
  
  const compileDocument = () => {
    const compiled = {
      profile: data.basics,
      summary: data.variantDefs.find(v => v._id === targetVariant),
      experience: data.jobs.map(job => ({
        ...job,
        items: job.slots
          .map(selectItem)
          .filter(Boolean) // Each item now contains Portable Text 'content' field
      })),
      education: data.education,
      skills: data.skills.map(selectItem).filter(Boolean)
    };
    return compiled;
  };
  
  return { compileDocument };
}
```

**Note on Semantic Naming:** The `selectItem` function and `compileDocument` method use implementation-agnostic names. "Item" refers to any bullet/list entry, and "Document" refers to the compiled output (resume, CV, portfolio, etc.). The `profile` field contains user identity data, not "header" which is presentation-specific.

**Note:** The `selectItem` function returns the full variant object (which includes the Portable Text array in `.content`), not just a plain string. Components use `<PortableTextRenderer>` to render this structured content.

### 4.5 Implementation-Agnostic Naming Convention

The component architecture uses semantic names that describe *function*, not *domain*, to support future extensibility beyond resumes.

| Domain-Specific (Avoid) | Semantic (Use) | Rationale |
| :--- | :--- | :--- |
| `ResumeHeader` | `ProfileHeader` | Contains user identity regardless of document type |
| `ResumeSection` | `ContentSection` | Generic wrapper for any content block |
| `BulletList` | `ItemList` | Lists can contain any structured items |
| `useResumeBuilder` | `useContentBuilder` | Composes any structured document |
| `buildResume()` | `compileDocument()` | Assembles content from data |
| `resumeData` | `documentData` | Generic data structure |
| `bullets` | `items` | Individual content entries |
| `header` | `profile` | User identity information |

**CSS Class Naming:**
- `.profile-header`, `.content-section`, `.content-items` ✅
- `.resume-header`, `.resume-section`, `.resume-bullets` ❌

**Why This Matters:**
- **Extensibility:** Easy to support CVs, portfolios, case studies without refactoring
- **Multi-tenant:** Simpler to white-label for career coaches or agencies
- **Clarity:** Separates data structure (semantic) from UI presentation

---

## 5. User Stories (v3 MVP)

| Story ID | Feature | User Story | Acceptance Criteria | Priority |
| :--- | :--- | :--- | :--- | :--- |
| **V3-001** | **Data Migration** | As Bex, I want to import my existing `master_resume_data.json` into Sanity so I don't lose any work. | Migration script runs without errors; all bullets and metadata preserved with Portable Text formatting. | **P0** |
| **V3-002** | **Variant Selection** | As Bex, I want to select "CMS-DS-PDM-01" from a dropdown so I can preview that resume instantly. | Dropdown lists all variants; preview updates in <1 sec. | **P0** |
| **V3-003** | **Live Preview** | As Bex, I want to see my resume update as I edit content in Sanity Studio. | Changes appear in React app within 2 seconds (webhook or polling). | **P0** |
| **V3-004** | **PDF Export** | As Bex, I want to download a clean PDF so I can send it to recruiters. | "Export PDF" button generates professional-looking file with formatting preserved. | **P0** |
| **V3-005** | **Markdown Export** | As Bex, I want to export Markdown so I can paste into GitHub README or a blog post. | "Export MD" button copies formatted markdown to clipboard with bold/italic preserved. | **P1** |
| **V3-006** | **Content Editing** | As Bex, I want to add a new bullet in Sanity Studio without touching code. | Can create new Slot, assign variants, and see it in preview. | **P1** |
| **V3-007** | **Rich Text Editing** | As Bex, I want to add **bold** and *italic* formatting to my bullets so I can emphasize key metrics. | Sanity Studio shows formatting toolbar; formatting appears in all exports (PDF, HTML, MD). | **P1** |

---

## 6. v3 MVP Feature Checklist

### Phase 1: Foundation (Weeks 1-2)
- [ ] Set up Sanity project with schema definitions
- [ ] Configure Portable Text editor for summaries and bullets (marks, decorators, no lists)
- [ ] Create migration script: `master_resume_data.json` → Sanity import
- [ ] Implement text-to-Portable-Text conversion helpers
- [ ] Set up React app with Sanity client
- [ ] Implement GROQ queries for fetching all resume data (including Portable Text)

### Phase 2: Core UI (Weeks 3-4)
- [ ] Build variant selector dropdown
- [ ] Implement `SmartLink` component for rendering link objects
- [ ] Implement `PortableTextRenderer` component with custom marks (bold, italic, links)
- [ ] Implement content preview component (HTML rendering with Portable Text)
- [ ] Port composition logic to React hooks
- [ ] Add basic styling (matches v2 PDF aesthetic)

### Phase 3: Export (Week 5)
- [ ] Implement Portable Text serializers (portableTextToMarkdown, portableTextToHTML, portableTextToPlainText)
- [ ] Implement link object export helpers (Markdown, HTML, PDF formats)
- [ ] PDF export using react-pdf or similar (with Portable Text support)
- [ ] Markdown export with proper formatting (Portable Text → markdown)
- [ ] HTML export (standalone file with inline CSS, Portable Text → HTML)
- [ ] Test ATS compatibility with formatted exports

### Phase 4: Polish (Week 6)
- [ ] Add loading states and error handling
- [ ] Responsive design (mobile-friendly)
- [ ] Deploy to Vercel/Netlify
- [ ] Documentation (how to add new variants)

---

## 7. Technical Decisions

### 7.1 Why Sanity?
| Factor | Rationale |
| :--- | :--- |
| **Structured Content** | Native support for nested objects (slots > variants) |
| **Real-time API** | GROQ queries are fast and flexible |
| **Studio UX** | Non-devs can edit content without Git/CLI |
| **Portable** | Can export data anytime; not locked to WP ecosystem |

### 7.2 Why React (vs. staying in Python)?
| Factor | Rationale |
| :--- | :--- |
| **Instant Feedback** | No CLI refresh needed; preview updates live |
| **Web-First** | Works on any device with a browser |
| **Component Reuse** | Same logic generates preview AND PDF export |
| **Modern Stack** | Easier to hire devs; better ecosystem for UIs |

### 7.3 Export Strategy
- **PDF:** Use `react-pdf` or `puppeteer` for server-side rendering
- **Markdown:** Convert Portable Text to markdown strings with formatting preserved
- **HTML:** Single-file export with embedded CSS (email-friendly)

**Portable Text Export Handling:**

Portable Text is structured JSON, not plain strings. Each export format needs a serializer to convert the blocks into the target format while preserving formatting (bold, italic, links).

```javascript
// utils/portableTextHelpers.js
import { toPlainText } from '@portabletext/react';

/**
 * Convert Portable Text to Markdown
 * Handles: **bold**, *italic*, _underline_, [links](url)
 */
export function portableTextToMarkdown(blocks) {
  if (!blocks || !Array.isArray(blocks)) return '';
  
  return blocks.map(block => {
    if (block._type !== 'block') return '';
    
    return block.children.map(child => {
      let text = child.text || '';
      
      // Apply marks (bold, italic, etc.)
      if (child.marks && child.marks.length > 0) {
        child.marks.forEach(mark => {
          if (mark === 'strong') text = `**${text}**`;
          if (mark === 'em') text = `*${text}*`;
          if (mark === 'underline') text = `_${text}_`;
        });
      }
      
      return text;
    }).join('');
  }).join('\n\n');
}

/**
 * Convert Portable Text to HTML
 * Handles: <strong>, <em>, <u>, <a href="">
 */
export function portableTextToHTML(blocks) {
  if (!blocks || !Array.isArray(blocks)) return '';
  
  return blocks.map(block => {
    if (block._type !== 'block') return '';
    
    const content = block.children.map(child => {
      let text = child.text || '';
      
      // Apply marks
      if (child.marks && child.marks.length > 0) {
        child.marks.forEach(mark => {
          if (mark === 'strong') text = `<strong>${text}</strong>`;
          if (mark === 'em') text = `<em>${text}</em>`;
          if (mark === 'underline') text = `<u>${text}</u>`;
        });
      }
      
      return text;
    }).join('');
    
    return `<p>${content}</p>`;
  }).join('\n');
}

/**
 * Convert Portable Text to Plain Text (for ATS-friendly PDFs)
 * Strips all formatting, preserves text only
 */
export function portableTextToPlainText(blocks) {
  return toPlainText(blocks);
}

/**
 * Handle inline links in Portable Text
 */
export function extractLinksFromPortableText(blocks) {
  const links = [];
  
  blocks?.forEach(block => {
    block.children?.forEach(child => {
      if (child.marks?.includes('link')) {
        // Link annotation data is stored separately in block.markDefs
        const linkDef = block.markDefs?.find(def => def._key === child.marks.find(m => typeof m === 'object')?._key);
        if (linkDef?.href) {
          links.push({ text: child.text, href: linkDef.href });
        }
      }
    });
  });
  
  return links;
}
```

**Usage in Export Functions:**
```javascript
// utils/exportHelpers.js
import { portableTextToMarkdown, portableTextToHTML, portableTextToPlainText } from './portableTextHelpers';

// Markdown document builder
function buildMarkdownDocument(documentData) {
  let md = `# ${documentData.profile.fullName}\n\n`;
  
  // Summary (Portable Text)
  if (documentData.summary?.summary) {
    md += `## ${documentData.summary.roleTitle}\n\n`;
    md += portableTextToMarkdown(documentData.summary.summary) + '\n\n';
  }
  
  // Experience items (Portable Text)
  documentData.experience.forEach(job => {
    md += `### ${job.company} — ${job.role}\n`;
    md += `*${job.dates} | ${job.location}*\n\n`;
    
    job.items.forEach(item => {
      const itemText = portableTextToMarkdown(item.content);
      md += `- ${itemText}\n`;
    });
    md += '\n';
  });
  
  return md;
}

// HTML document builder
function buildHTMLDocument(documentData) {
  let html = `<h1>${documentData.profile.fullName}</h1>`;
  
  if (documentData.summary?.summary) {
    html += `<h2>${documentData.summary.roleTitle}</h2>`;
    html += portableTextToHTML(documentData.summary.summary);
  }
  
  documentData.experience.forEach(job => {
    html += `<h3>${job.company} — ${job.role}</h3>`;
    html += `<p><em>${job.dates} | ${job.location}</em></p>`;
    html += '<ul>';
    
    job.items.forEach(item => {
      const itemHTML = portableTextToHTML(item.content);
      html += `<li>${itemHTML}</li>`;
    });
    html += '</ul>';
  });
  
  return html;
}
```

**Link Object Export Handling:**
```javascript
// For Markdown export
function linkToMarkdown(linkObj) {
  if (!linkObj?.url) return '';
  return `[${linkObj.label}](${linkObj.url})`;
}

// For HTML export
function linkToHTML(linkObj) {
  if (!linkObj?.url) return '';
  const target = linkObj.openInNewTab ? ' target="_blank" rel="noopener noreferrer"' : '';
  return `<a href="${linkObj.url}"${target}>${linkObj.label}</a>`;
}

// For PDF export (react-pdf)
function linkToPDF(linkObj) {
  if (!linkObj?.url) return null;
  return (
    <Link src={linkObj.url}>
      {linkObj.label}
    </Link>
  );
}

// Example usage in Markdown document builder
function buildProfileSection(profile) {
  const contactItems = [
    profile.location,
    profile.email,
    profile.phone,
    linkToMarkdown(profile.linkedin),
    linkToMarkdown(profile.portfolio)
  ].filter(Boolean);
  
  return `# ${profile.fullName}\n${contactItems.join(' | ')}\n\n`;
}
```

---

## 8. Migration Plan: v2 → v3

### Step 1: Schema Mapping
| v2 JSON Structure | v3 Sanity Schema | Notes |
| :--- | :--- | :--- |
| `basics.name` | `basics.fullName` | Simple rename |
| `basics.linkedin` (string) | `basics.linkedin` (link object) | Convert URL string to `{url, label, openInNewTab}` |
| `basics.portfolio` (string) | `basics.portfolio` (link object) | Convert URL string to `{url, label, openInNewTab}` |
| `basics.*` (other fields) | `basics.*` | Direct 1:1 mapping |
| `variant_summaries[].summary` (string) | `variantDef.summary` (Portable Text) | Convert plain text to Portable Text blocks |
| `variant_summaries` | `variantDef[]` | Convert object to array of documents |
| `work_history[].company` | `job.company` | Direct mapping |
| `work_history[].slots[]` | `job.slots[]` | Nested array of objects |
| `slots[].variants[].content` (string) | `bulletVariant.content` (Portable Text) | Convert plain text to Portable Text blocks with markdown detection |
| `slots[].variants[]` | `slot.variants[]` | Add `variantType` reference |

### Step 2: Data Import Script (Node.js)
```javascript
// scripts/migrate-to-sanity.js
const sanityClient = require('@sanity/client');
const masterData = require('../data/json/master_resume_data.json');

// Helper function to convert URL strings to link objects
function createLinkObject(url, label, openInNewTab = true) {
  if (!url || url === 'nan') return null;
  return {
    _type: 'link',
    url: url,
    label: label,
    openInNewTab: openInNewTab
  };
}

// Helper function to convert plain text to Portable Text blocks
function textToPortableText(text) {
  if (!text || text === 'nan') return [];
  
  return [
    {
      _type: 'block',
      _key: Math.random().toString(36).substr(2, 9), // Generate unique key
      style: 'normal',
      children: [
        {
          _type: 'span',
          _key: Math.random().toString(36).substr(2, 9),
          text: text,
          marks: []
        }
      ],
      markDefs: []
    }
  ];
}

// Advanced: Detect bold/italic markdown in existing text and convert to Portable Text marks
function smartTextToPortableText(text) {
  if (!text || text === 'nan') return [];
  
  // Simple markdown detection (optional enhancement)
  // Looks for **bold** and *italic* patterns
  const segments = [];
  let currentPos = 0;
  
  // Regex to find **bold** or *italic* (simplified)
  const markdownRegex = /(\*\*.*?\*\*|\*.*?\*)/g;
  let match;
  
  while ((match = markdownRegex.exec(text)) !== null) {
    // Add plain text before match
    if (match.index > currentPos) {
      segments.push({
        _type: 'span',
        _key: Math.random().toString(36).substr(2, 9),
        text: text.substring(currentPos, match.index),
        marks: []
      });
    }
    
    // Add formatted text
    const matchedText = match[0];
    const isBold = matchedText.startsWith('**');
    const cleanText = matchedText.replace(/\*\*/g, '').replace(/\*/g, '');
    
    segments.push({
      _type: 'span',
      _key: Math.random().toString(36).substr(2, 9),
      text: cleanText,
      marks: isBold ? ['strong'] : ['em']
    });
    
    currentPos = match.index + matchedText.length;
  }
  
  // Add remaining text
  if (currentPos < text.length) {
    segments.push({
      _type: 'span',
      _key: Math.random().toString(36).substr(2, 9),
      text: text.substring(currentPos),
      marks: []
    });
  }
  
  // If no markdown found, return simple block
  if (segments.length === 0) {
    return textToPortableText(text);
  }
  
  return [
    {
      _type: 'block',
      _key: Math.random().toString(36).substr(2, 9),
      style: 'normal',
      children: segments,
      markDefs: []
    }
  ];
}

async function migrate() {
  // 1. Create basics document with link objects
  const basics = masterData.basics;
  await client.create({ 
    _type: 'basics',
    fullName: basics.name,
    location: basics.location,
    email: basics.email,
    phone: basics.phone,
    linkedin: createLinkObject(
      basics.linkedin, 
      'LinkedIn Profile',
      true
    ),
    portfolio: createLinkObject(
      basics.portfolio,
      'Portfolio',
      true
    )
  });
  
  // 2. Create variant definitions with Portable Text summaries
  for (const [id, meta] of Object.entries(masterData.variant_summaries)) {
    await client.create({
      _type: 'variantDef',
      variantId: id,
      roleTitle: meta.title,
      summary: textToPortableText(meta.summary) // Convert to Portable Text
    });
  }
  
  // 3. Create jobs with slots/variants (Portable Text content)
  for (const job of masterData.work_history) {
    const slots = job.slots.map(slot => ({
      _type: 'slot',
      slotId: slot.id,
      header: slot.header,
      variants: slot.variants.map(v => ({
        _type: 'bulletVariant',
        variantType: { _type: 'reference', _ref: v.type },
        content: smartTextToPortableText(v.content), // Convert with markdown detection
        isMaster: v.type === 'CMS-DS-PDM-01'
      }))
    }));
    
    await client.create({
      _type: 'job',
      company: job.company,
      role: job.role,
      dates: job.dates,
      location: job.location,
      slots
    });
  }
  
  console.log('✅ Migration complete! Text converted to Portable Text format.');
}
```

**Migration Notes:**
- `textToPortableText()` converts plain strings to basic Portable Text blocks
- `smartTextToPortableText()` detects markdown-style **bold** and *italic* in existing text and converts them to proper Portable Text marks
- All text fields are now structured data, not raw strings
- Existing formatting is preserved during migration

---

## 9. v4 Vision: Future Enhancements

### 9.1 AI-Powered Features (Post-MVP)

| Feature | Description | Technology |
| :--- | :--- | :--- |
| **Smart Variant Suggester** | Analyze job description URL and recommend best variant | Claude API + embeddings |
| **Bullet Optimizer** | Rewrite bullets for ATS optimization (with approval flow) | GPT-4 with structured output |
| **Skills Gap Analysis** | Compare resume against job posting, highlight missing keywords | NLP + keyword extraction |
| **Auto-Tagging** | Suggest variant types for new bullets based on content | Text classification model |

### 9.2 Collaboration Features

| Feature | Description |
| :--- | :--- |
| **Resume Review Mode** | Share preview link with mentors/coaches for feedback |
| **Version History** | Track changes over time (Sanity has this built-in) |
| **Template Library** | Save/share slot configurations with other users |
| **Multi-User Support** | White-label the tool for career coaches |

### 9.3 Integration Features

| Feature | Description |
| :--- | :--- |
| **LinkedIn Sync** | Auto-import experience from LinkedIn API |
| **ATS Compatibility Checker** | Validate exported PDFs against ATS parsers |
| **Job Board Integration** | One-click apply to Indeed/LinkedIn with auto-filled data |
| **Analytics Dashboard** | Track which variants get the most downloads |

### 9.4 Enhanced Customization

| Feature | Description |
| :--- | :--- |
| **Theme System** | Swap color schemes/fonts per variant |
| **Layout Options** | Toggle single-column vs. two-column designs |
| **Dynamic Sections** | Show/hide Education, Skills, or Publications per variant |
| **Localization** | Generate resumes in multiple languages from same data |
| **Rich Link Objects** | Extend link objects with icons, badges (e.g., "Verified", "Featured"), and preview images |
| **Project Attachments** | Add link arrays to jobs/projects for demos, GitHub repos, live sites |

### 9.5 Link Object v4 Extensions

The atomic `link` component could be enhanced with additional fields:

```javascript
{
  name: 'richLink',
  type: 'object',
  fields: [
    { name: 'url', type: 'url' },
    { name: 'label', type: 'string' },
    { name: 'openInNewTab', type: 'boolean' },
    { name: 'icon', type: 'string' }, // Icon identifier (e.g., 'github', 'linkedin')
    { name: 'badge', type: 'string' }, // Optional badge text ('Verified', 'Live', 'Featured')
    { name: 'description', type: 'text' }, // Hover tooltip text
    { name: 'preview', type: 'image' }, // Open Graph style preview image
    { name: 'analytics', type: 'boolean' } // Track clicks for this link
  ]
}
```

**Use Cases:**
- Portfolio projects with live demo + GitHub + case study links
- Certifications with verification URLs and badge images
- Publications with DOI links and citation counts
- Social media profiles with platform-specific icons

---

## 10. Success Metrics

### v3 MVP Targets
| Metric | Target | Measurement |
| :--- | :--- | :--- |
| **Migration Accuracy** | 100% data parity | Compare output vs. v2 PDF |
| **Build Speed** | <1 second | Time from variant selection to preview render |
| **Export Quality** | ATS-friendly PDF | Test with Jobscan.co |
| **Editing Efficiency** | <30 seconds to add new bullet | Time study with real user |

### v4 Adoption Targets (6 months post-launch)
| Metric | Target |
| :--- | :--- |
| **Daily Active Users** | 10 (if opening for beta testers) |
| **Resume Variants per User** | 3+ average |
| **Export Actions per Month** | 50+ |

---

## 11. Technical Dependencies

| Dependency | Purpose | Version |
| :--- | :--- | :--- |
| **Sanity.io** | Headless CMS | Latest |
| **@sanity/client** | JavaScript client for Sanity API | Latest |
| **@portabletext/react** | Render Portable Text in React | Latest |
| **@portabletext/to-html** | Convert Portable Text to HTML (export) | Latest |
| **React** | Frontend framework | 18+ |
| **Next.js** | Optional SSR/SSG | 14+ |
| **react-pdf** | PDF generation | Latest |
| **Tailwind CSS** | Styling | 3+ |
| **Vercel** | Hosting | N/A |

---

## 12. Open Questions

| Question | Decision Date | Owner |
| :--- | :--- | :--- |
| Should we use Next.js or plain React (CRA)? | Week 1 | Bex |
| Do we need real-time preview or is polling sufficient? | Week 1 | Bex |
| Should PDF export happen client-side or server-side? | Week 3 | Bex |
| Do we expose Sanity Studio publicly or keep it localhost-only? | Week 2 | Bex |

---

## 13. Appendix: v2 → v3 Feature Comparison

| Feature | v2 (Python/WP) | v3 (Sanity/React) | Status |
| :--- | :--- | :--- | :--- |
| CSV data entry | ✅ | ❌ Replaced by Sanity Studio | Improved |
| Plain text bullets | ✅ | ❌ Replaced by Portable Text | Improved |
| Rich text formatting | ❌ | ✅ Bold, italic, links in bullets/summaries | **New** |
| Variant selection | ✅ CLI arg | ✅ Dropdown UI | Parity |
| Auto-clustering | ✅ Similarity matching | ✅ Port logic to JS | Parity |
| Master fallback | ✅ Hardcoded | ✅ Boolean flag | Parity |
| PDF export | ✅ VS Code | ✅ react-pdf | Parity |
| Markdown export | ✅ | ✅ With formatting preserved | Improved |
| Web publishing | ✅ WP API | ❌ Static hosting | Simplified |
| Live preview | ❌ | ✅ | **New** |
| Mobile editing | ❌ | ✅ | **New** |
| WYSIWYG editor | ❌ | ✅ Sanity Studio | **New** |
| Real-time collab | ❌ | ⏳ v4 | **Future** |

---

**Document Version:** 3.0.0  
**Last Updated:** December 2025  
**Author:** Bex, with architectural input from Claude  
**Next Review:** Upon completion of v3 MVP