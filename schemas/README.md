# Sugartown CMS - Sanity Schemas (Phase 1)

Complete Sanity Studio schema definitions for the Sugartown knowledge base and portfolio site.

## 🚀 Quick Start

These schemas are ready to use in a Sanity Studio project. To integrate:

1. **Copy to your Sanity Studio project**:
   ```bash
   cp -r schemas/ your-sanity-studio/schemas/
   ```

2. **Update your `sanity.config.ts`**:
   ```typescript
   import {defineConfig} from 'sanity'
   import {schemaTypes} from './schemas'

   export default defineConfig({
     // ... other config
     schema: {
       types: schemaTypes,
     },
   })
   ```

3. **Install required dependencies**:
   ```bash
   npm install @sanity/icons
   ```

4. **Deploy schemas to Sanity cloud**:
   ```bash
   npx sanity@latest schema deploy
   ```

## 📁 Schema Architecture

```
schemas/
├── index.ts                    # Schema registry (import this)
├── objects/                    # Atomic, reusable objects
│   ├── link.ts                 # Link with icon support
│   ├── richImage.ts            # Image with metadata & accessibility
│   ├── ctaButton.ts            # Call-to-action button component
│   └── portableTextConfig.ts  # Portable Text configurations
├── documents/                  # Top-level content types
│   ├── category.ts             # Hierarchical categories with colors
│   ├── tag.ts                  # Flat tagging system
│   ├── project.ts              # Project registry (PROJ-XXX format)
│   ├── node.ts                 # ⭐ AI collaboration documentation
│   ├── post.ts                 # Blog posts
│   ├── page.ts                 # Static pages with sections
│   ├── caseStudy.ts            # Portfolio case studies
│   ├── navigation.ts           # Reusable navigation menus
│   └── siteSettings.ts         # Global site configuration (singleton)
└── sections/                   # Page builder components
    ├── hero.ts                 # Hero section
    ├── textSection.ts          # Generic content section
    ├── imageGallery.ts         # Image grid/carousel
    └── ctaSection.ts           # Call-to-action section
```

## 🎯 Content Types

### Core Content

#### **Knowledge Graph Node** (`node`)
Documents AI collaboration conversations using the "Agentic Caucus" methodology.

**Key Features:**
- AI tool tracking (Claude, ChatGPT, Gemini, Mixed)
- Conversation type classification (Problem Solving, Learning, Code, Design, etc.)
- Agentic Caucus fields: Challenge, Insight, Action Item
- Status tracking: Explored → Validated → Implemented → Evergreen
- Links to projects, categories, and tags
- Optional conversation link (Claude.ai share, etc.)

**Use Case:** Document a debugging session with Claude about React state management

#### **Blog Post** (`post`)
Standard blog content migrated from WordPress.

**Key Features:**
- Rich content with Portable Text
- Featured image support
- Author field (string, future: reference)
- Categories, tags, and project links
- Published/updated timestamps

**Use Case:** Weekly blog posts about AI collaboration experiences

#### **Page** (`page`)
Flexible page builder for static pages.

**Key Features:**
- Modular section-based layout (Hero, Text, Images, CTA)
- Template options: Default, Full Width, Sidebar
- Hierarchical page structure (parent-child)
- SEO overrides (meta title, description, OG image)

**Use Case:** About page, Contact page, Project overview page

#### **Case Study** (`caseStudy`)
Portfolio work showcase.

**Key Features:**
- All page builder sections
- Client, role, date range metadata
- Featured image for listings
- Links to projects, categories, tags

**Use Case:** "Building a Knowledge Graph with Sanity and React" case study

### Taxonomy

#### **Category** (`category`)
Hierarchical topic categorization with color coding.

**Key Features:**
- Parent-child relationships for nested categories
- Color picker for knowledge graph visualization
- Defaults to Sugartown Pink (#FF69B4)

**Examples:** "AI Tools > Claude", "Web Development > React"

#### **Tag** (`tag`)
Flat tagging for cross-cutting themes.

**Examples:** "TypeScript", "Debugging", "AI Ethics", "Performance"

#### **Project** (`project`)
Project registry with controlled ID format (PROJ-XXX).

**Key Features:**
- Unique project IDs with format validation (PROJ-001, PROJ-002, etc.)
- Status tracking: Planning → Active → Archived
- Priority levels (1-5)
- KPI tracking (metric, target, current)
- Tag associations

**Use Case:** Track "PROJ-001: Sugartown CMS Migration" with KPIs

### Site Infrastructure

#### **Navigation** (`navigation`)
Reusable navigation menus with dropdown support.

**Key Features:**
- Recursive structure for nested menus
- Link objects with icon support
- Supports dropdown/mega menus

**Examples:** "Primary Nav", "Footer Nav", "Mobile Menu"

#### **Site Settings** (`siteSettings`)
Global site configuration (singleton - only one instance).

**Key Features:**
- Brand identity (logo, colors: Pink #FF69B4, Seafoam #2BD4AA)
- Header configuration (style, nav, CTA, announcement bar)
- Footer configuration (columns, social links, copyright)
- SEO defaults (meta title, description, OG image)

## 🧩 Reusable Objects

### **Link** (`link`)
Standardized link component.
- URL with validation
- Label text
- Open in new tab option
- Icon support (Twitter, LinkedIn, GitHub, etc.)

### **Rich Image** (`richImage`)
Image with full metadata.
- Image asset with hotspot support
- Required alt text (accessibility)
- Optional caption and photo credit
- Optional click-through URL

### **CTA Button** (`ctaButton`)
Styled call-to-action button.
- Button text
- Link destination
- Style variants: Primary (Pink), Secondary (Seafoam), Ghost (Outline)

### **Portable Text Configs**
Three reusable content configurations:

1. **Summary** - Excerpts and short descriptions
   - Normal text only, no headings/lists
   - Bold, Italic, Underline, Links

2. **Standard** - Main content areas
   - All heading levels (H2-H4)
   - Bold, Italic, Underline, Code, Links
   - Lists, Images, Code blocks

3. **Minimal** - Plain text only
   - No formatting, no marks, no lists

## 🎨 Brand Identity

**Colors:**
- Primary: Sugartown Pink `#FF69B4`
- Secondary: Seafoam `#2BD4AA`

**Tone:** Product Manager - technical but cheeky

## 🏗️ Architecture Principles

Following **Resume Factory pattern**:

1. **References over Strings** - Use references for type safety
2. **Atomic Objects** - Reusable components (link, richImage, ctaButton)
3. **Composability** - Sections compose into pages
4. **Validation** - Enforce data quality with validation rules
5. **GROQ-Optimized** - Structure for efficient queries

## 📊 Example Queries

### Get all Nodes with AI tool and categories
```groq
*[_type == "node"] | order(publishedAt desc) {
  title,
  slug,
  aiTool,
  status,
  challenge,
  insight,
  categories[]->{
    name,
    color
  },
  publishedAt
}
```

### Get page with all sections
```groq
*[_type == "page" && slug.current == "about"][0] {
  title,
  sections[]{
    _type,
    _type == "hero" => {
      heading,
      subheading,
      backgroundImage {
        asset->,
        alt
      }
    },
    _type == "textSection" => {
      heading,
      content
    }
  }
}
```

### Get posts by category
```groq
*[_type == "post" && $categoryId in categories[]._ref] | order(publishedAt desc) {
  title,
  slug,
  excerpt,
  featuredImage {
    asset->,
    alt
  },
  publishedAt
}
```

## 🚧 Phase 2 Roadmap

Future enhancements:
- **Author document** - Convert author string to reference
- **Media library** - Advanced image management
- **Related content** - Auto-suggest related nodes/posts
- **Content versioning** - Draft/publish workflow enhancements
- **Advanced SEO** - Schema.org markup, structured data

## ✅ Success Criteria

- [x] All schemas compile without errors
- [x] Validation rules enforce data quality
- [x] Preview configurations display useful info
- [x] Follows Sanity v3 best practices
- [x] GROQ-optimized structure
- [x] Ready for WordPress → Sanity migration

## 📚 Resources

- [Sanity Schema Documentation](https://www.sanity.io/docs/schema-types)
- [Portable Text Spec](https://portabletext.org/)
- [GROQ Query Language](https://www.sanity.io/docs/groq)
- [Resume Factory Pattern](https://www.sanity.io/guides/nextjs-app-router-live-preview)

---

**Built with 🤖 Claude Code**
Following the Agentic Caucus methodology ✨
