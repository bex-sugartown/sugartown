# Sugartown CMS - Sanity Studio Implementation Guide

Step-by-step guide to set up, configure, and deploy the Sugartown Sanity Studio.

## 🎯 Overview

These schemas can be integrated into Sanity Studio in two ways:

1. **New Sanity Studio Project** (recommended for clean start)
2. **Existing Sanity Studio Project** (merge into an existing Studio)

---

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
import {colorInput} from '@sanity/color-input'
import {codeInput} from '@sanity/code-input'
import {schemaTypes} from './schemas'

export default defineConfig({
  name: 'default',
  title: 'Sugartown CMS',

  projectId: 'your-project-id', // From sanity.json or dashboard
  dataset: 'production',

  plugins: [
    structureTool(),
    visionTool(),
    colorInput(),
    codeInput(),
  ],

  schema: {
    types: schemaTypes,
  },
})
```

### Step 4: Install Dependencies

```bash
# Required packages
npm install @sanity/icons @sanity/vision @sanity/color-input @sanity/code-input
```

### Step 5: Start Studio

```bash
npm run dev
```

Your Studio will be available at `http://localhost:3333`.

### Step 6: Deploy Schema

```bash
# Deploy schema to Sanity cloud
npx sanity@latest schema deploy

# Deploy Studio (optional - for hosted Studio)
npx sanity@latest deploy
```

---

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

---

## 🎨 Optional: Custom Desk Structure

If you want a custom desk structure, create `structure.ts` and wire it into `sanity.config.ts`:

```typescript
import {StructureBuilder} from 'sanity/structure'

export const structure = (S: StructureBuilder) =>
  S.list()
    .title('Sugartown CMS')
    .items([
      S.listItem()
        .title('Knowledge Graph')
        .icon(() => '💎')
        .child(
          S.list()
            .title('Knowledge Graph')
            .items([S.documentTypeListItem('node').title('Nodes')])
        ),
    ])

export default structure
```

Then update `sanity.config.ts`:

```typescript
import {structureTool} from 'sanity/structure'
import {structure} from './structure'

export default defineConfig({
  plugins: [
    structureTool({structure}),
    visionTool(),
    colorInput(),
    codeInput(),
  ],
})
```

---

## ✅ Verification Checklist

After integration, verify:

- [ ] Studio loads without errors
- [ ] Document types appear in Studio
- [ ] Can create new documents
- [ ] Validation rules work correctly
- [ ] Previews display properly
- [ ] References work (categories, tags, projects)
- [ ] Images upload successfully
- [ ] Portable Text editor functions

---

**Schema Version:** Phase 1 (January 2026)
**Sanity Version:** v5.x
**Status:** Production Ready ✅
