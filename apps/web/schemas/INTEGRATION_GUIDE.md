# Sugartown CMS - Sanity Studio Integration Guide

Step-by-step guide to integrate these schemas into a Sanity Studio project.

## 🎯 Overview

These schemas can be integrated into Sanity Studio in two ways:

1. **New Sanity Studio Project** (Recommended for clean start)
2. **Existing Sanity Studio Project** (If you already have a Studio)

## 🆕 Option 1: New Sanity Studio Project

### Step 1: Create New Sanity Project

```bash
# Navigate to your projects directory
cd ~/projects

# Create new Sanity project
npm create sanity@latest

# Follow the prompts:
# - Project name: sugartown-cms (or your choice)
# - Use default dataset: Y
# - Dataset name: production
# - Project template: Clean project with no predefined schemas
# - Package manager: npm (or your preference)
```

### Step 2: Copy Schemas

```bash
# Copy the schemas directory
cp -r /path/to/this/schemas your-sanity-studio/schemas

# Or if you're in the frontend project:
cp -r schemas ../sugartown-studio/schemas
```

### Step 3: Update Configuration

Edit `sanity.config.ts` (or `sanity.config.js`):

```typescript
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemas'

export default defineConfig({
  name: 'default',
  title: 'Sugartown CMS',

  projectId: 'your-project-id', // From sanity.json or dashboard
  dataset: 'production',

  plugins: [
    structureTool(),
    visionTool(), // For testing GROQ queries
  ],

  schema: {
    types: schemaTypes,
  },
})
```

### Step 4: Install Dependencies

```bash
# Install required packages
npm install @sanity/icons

# Optional but recommended:
npm install @sanity/vision
```

### Step 5: Start Studio

```bash
npm run dev
```

Your Studio will be available at `http://localhost:3333`

### Step 6: Deploy Schema

```bash
# Deploy schema to Sanity cloud
npx sanity@latest schema deploy

# Deploy Studio (optional - for hosted Studio)
npx sanity@latest deploy
```

## 🔄 Option 2: Existing Sanity Studio Project

### Step 1: Backup Existing Schemas

```bash
# Create backup of existing schemas
cp -r schemas schemas-backup-$(date +%Y%m%d)
```

### Step 2: Merge Schemas

If you have existing schemas, you'll need to merge them:

```typescript
// In your existing schemas/index.ts
import {schemaTypes as existingSchemas} from './existing-schemas'
import {schemaTypes as sugartownSchemas} from './sugartown-schemas'

export const schemaTypes = [
  ...existingSchemas,
  ...sugartownSchemas
]
```

### Step 3: Check for Conflicts

Look for naming conflicts between schemas:

```bash
# Check for duplicate schema names
grep -r "name: '" schemas/ | sort | uniq -d
```

If conflicts exist, rename schemas as needed.

### Step 4: Test Integration

```bash
npm run dev
```

Check the Studio for any errors in the browser console.

## 🎨 Customize Studio Structure

Create a custom desk structure for better organization:

Create `structure.ts`:

```typescript
import {StructureBuilder} from 'sanity/structure'

export const structure = (S: StructureBuilder) =>
  S.list()
    .title('Sugartown CMS')
    .items([
      // Knowledge Graph
      S.listItem()
        .title('Knowledge Graph')
        .icon(() => '💎')
        .child(
          S.list()
            .title('Knowledge Graph')
            .items([
              S.documentTypeListItem('node').title('Nodes'),
            ])
        ),

      S.divider(),

      // Content
      S.listItem()
        .title('Content')
        .icon(() => '📝')
        .child(
          S.list()
            .title('Content')
            .items([
              S.documentTypeListItem('post').title('Blog Posts'),
              S.documentTypeListItem('page').title('Pages'),
              S.documentTypeListItem('caseStudy').title('Case Studies'),
            ])
        ),

      S.divider(),

      // Taxonomy
      S.listItem()
        .title('Taxonomy')
        .icon(() => '🏷️')
        .child(
          S.list()
            .title('Taxonomy')
            .items([
              S.documentTypeListItem('category').title('Categories'),
              S.documentTypeListItem('tag').title('Tags'),
              S.documentTypeListItem('project').title('Projects'),
            ])
        ),

      S.divider(),

      // Site Configuration
      S.listItem()
        .title('Site Configuration')
        .icon(() => '⚙️')
        .child(
          S.list()
            .title('Site Configuration')
            .items([
              // Site Settings (Singleton)
              S.listItem()
                .title('Site Settings')
                .icon(() => '⚙️')
                .child(
                  S.document()
                    .schemaType('siteSettings')
                    .documentId('siteSettings')
                ),
              S.documentTypeListItem('navigation').title('Navigation Menus'),
            ])
        ),
    ])

export default structure
```

Then update `sanity.config.ts`:

```typescript
import {structureTool} from 'sanity/structure'
import {structure} from './structure'

export default defineConfig({
  // ... other config
  plugins: [
    structureTool({structure}),
    visionTool(),
  ],
})
```

## 🔌 Connect to Frontend (React)

### Step 1: Install Sanity Client

In your React/Next.js project:

```bash
npm install @sanity/client @sanity/image-url @portabletext/react
```

### Step 2: Create Sanity Client

Create `lib/sanity.ts`:

```typescript
import {createClient} from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: 'your-project-id', // From sanity.json
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true, // Use CDN for faster responses (production)
})

const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
  return builder.image(source)
}
```

### Step 3: Fetch Data Example

```typescript
import {client} from '@/lib/sanity'

// Fetch all nodes
export async function getNodes() {
  const query = `
    *[_type == "node"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      excerpt,
      aiTool,
      status,
      publishedAt
    }
  `
  return await client.fetch(query)
}

// Fetch single node
export async function getNode(slug: string) {
  const query = `
    *[_type == "node" && slug.current == $slug][0] {
      title,
      content,
      aiTool,
      challenge,
      insight,
      categories[]->{
        name,
        slug,
        "color": color.hex
      }
    }
  `
  return await client.fetch(query, {slug})
}
```

### Step 4: Render Portable Text

```tsx
import {PortableText} from '@portabletext/react'
import {urlFor} from '@/lib/sanity'

const components = {
  types: {
    richImage: ({value}: any) => (
      <img
        src={urlFor(value.asset).width(800).url()}
        alt={value.alt}
      />
    ),
    code: ({value}: any) => (
      <pre data-language={value.language}>
        <code>{value.code}</code>
      </pre>
    ),
  },
}

export function ContentRenderer({content}: {content: any}) {
  return <PortableText value={content} components={components} />
}
```

## 🌐 Environment Variables

Create `.env.local` in your frontend:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your-api-token # For mutations
```

Update sanity client:

```typescript
export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production',
  token: process.env.SANITY_API_TOKEN, // Only for mutations
})
```

## 🔐 Security Setup

### 1. CORS Configuration

In Sanity dashboard → API → CORS Origins:

```
http://localhost:3000 (development)
https://yourdomain.com (production)
```

### 2. API Tokens

Generate tokens in Sanity dashboard → API → Tokens:

- **Read token** - For public data (optional if dataset is public)
- **Write token** - For mutations (keep secret!)

### 3. Dataset Visibility

Sanity dashboard → Datasets:
- `production` → Public (for public reads)
- Create `staging` dataset for testing

## 📊 Recommended Studio Plugins

Install useful plugins:

```bash
# Media library
npm install sanity-plugin-media

# Color picker (already used in schemas)
npm install @sanity/color-input

# Code input for code blocks
npm install @sanity/code-input

# Markdown support (if needed)
npm install sanity-plugin-markdown
```

Update `sanity.config.ts`:

```typescript
import {media} from 'sanity-plugin-media'
import {colorInput} from '@sanity/color-input'
import {codeInput} from '@sanity/code-input'

export default defineConfig({
  // ... other config
  plugins: [
    structureTool({structure}),
    visionTool(),
    media(),
    colorInput(),
    codeInput(),
  ],
})
```

## 🚀 Deploy to Production

### Deploy Studio

```bash
# Deploy to Sanity hosting (yourstudio.sanity.studio)
npx sanity@latest deploy

# Or deploy to Vercel/Netlify as a static site
npm run build
# Upload dist/ folder to your host
```

### Deploy Frontend

Follow your hosting platform's deployment guide (Vercel, Netlify, etc.)

## ✅ Verification Checklist

After integration, verify:

- [ ] Studio loads without errors
- [ ] All 9 document types appear in Studio
- [ ] Can create new documents
- [ ] Validation rules work correctly
- [ ] Previews display properly
- [ ] References work (categories, tags, projects)
- [ ] Images upload successfully
- [ ] Portable Text editor functions
- [ ] Frontend can fetch data via GROQ
- [ ] Images display correctly with @sanity/image-url

## 🐛 Troubleshooting

### Schema Not Loading

```bash
# Clear Sanity cache
rm -rf node_modules/.cache

# Reinstall dependencies
npm install
```

### TypeScript Errors

```bash
# Generate TypeScript types from schema
npx sanity@latest schema extract
npx sanity@latest typegen generate
```

### CORS Errors

Add your frontend URL to CORS origins in Sanity dashboard.

### Images Not Loading

Check:
1. Image asset exists in Sanity
2. CORS is configured
3. `@sanity/image-url` is installed
4. Project ID and dataset are correct

## 📚 Next Steps

1. **Populate Content** - Start creating nodes, posts, and pages
2. **WordPress Migration** - Use migration scripts to import existing content
3. **Frontend Development** - Build React components to display content
4. **Customize Studio** - Add custom input components, workflows
5. **Deploy** - Launch your new headless CMS!

## 🆘 Support Resources

- [Sanity Documentation](https://www.sanity.io/docs)
- [Sanity Slack Community](https://slack.sanity.io)
- [GROQ Query Cheat Sheet](https://www.sanity.io/docs/query-cheat-sheet)
- [Sanity Exchange](https://www.sanity.io/exchange) - Plugins and starters

---

**Schema Version:** Phase 1 (January 2026)
**Sanity Version:** v3.x
**Status:** Production Ready ✅
