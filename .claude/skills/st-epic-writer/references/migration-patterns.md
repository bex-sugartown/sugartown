# Migration Script Patterns Reference — Epic Writer

---

## When Migration Scripts Are Required

- Backfilling a new required field on existing documents
- Transforming stored data to a new shape (e.g. string → array of references)
- Adding a default value to documents that predate a new field

Not required for:
- Purely additive new fields that have no data yet
- New document types (no existing docs to migrate)
- Schema changes that don't affect existing stored data

---

## Script Location

```
scripts/migrate/[descriptive-name].js
```

Add a script entry to root `package.json`:

```json
"scripts": {
  "migrate:[name]": "node scripts/migrate/[name].js"
}
```

---

## Standard Script Pattern

```javascript
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'poalmzla',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

const isDryRun = !process.argv.includes('--execute')

async function migrate() {
  const docs = await client.fetch(`*[_type == "article" && !defined(newField)]`)
  
  console.log(`Found ${docs.length} documents to patch`)
  
  if (isDryRun) {
    console.log('DRY RUN — no changes made. Pass --execute to apply.')
    return
  }

  // 5-second abort window
  console.log('Executing in 5 seconds... Ctrl+C to abort.')
  await new Promise(resolve => setTimeout(resolve, 5000))

  const tx = client.transaction()
  for (const doc of docs) {
    tx.patch(doc._id, { set: { newField: 'defaultValue' } })
  }
  await tx.commit()
  console.log(`Patched ${docs.length} documents.`)
}

migrate().catch(console.error)
```

---

## nanoid Pattern (Critical)

`nanoid` is installed in `apps/studio/node_modules`, NOT at monorepo root.
Scripts run from root — direct import will fail.

**Always use this fallback pattern:**

```javascript
const { nanoid } = await import('nanoid').catch(() => ({
  nanoid: () => Math.random().toString(36).slice(2, 11)
}))
```

---

## Pre-Flight Count Query

Before writing the script, run this in Sanity Vision to establish the expected count:

```groq
count(*[_type == "article" && !defined(newField)])
```

Record this number in the epic as the acceptance criterion for dry-run verification.
If dry-run reports 0 (when you expected N), that is a bug, not a success.

---

## Idempotency Requirement

Re-running the script must produce no change. Standard approach: add a `!defined(field)`
or `field == null` filter so already-patched documents are excluded.

After `--execute` run:
1. Re-run dry-run
2. Confirm count is 0
3. This is the idempotency acceptance criterion

---

## Dry-Run Acceptance Criterion

The dry-run must report the **same document count** as the pre-flight GROQ query.

If they don't match:
- The query filter in the script may differ from the pre-flight query
- Documents may have been added or modified between the pre-flight and dry-run
- The skip logic may be incorrect

Do not proceed to `--execute` until dry-run count matches pre-flight count.

---

## Rollback

Sanity's history API allows document-level rollback. For batch migrations:
- Keep the pre-flight document list (log `doc._id` values before patching)
- The reverse patch is the rollback script (restore previous field value or unset the field)
- State the rollback strategy in the epic's Migration Script Constraints section
