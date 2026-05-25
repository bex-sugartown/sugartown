/**
 * SUG-127 Phase 2 — Contentful content model setup
 *
 * Creates: tag, siteSettings, heroSection, richTextSection, page
 * Updates: article (adds tags[])
 * Seeds:   1 siteSettings, 3 tags, 1 heroSection, 1 richTextSection, 1 page
 *
 * Idempotent: skips creation if the content type / entry already exists.
 *
 * Run from repo root: node apps/contentful-poc/scripts/setup-content-model.mjs
 * Requires: CONTENTFUL_MANAGEMENT_TOKEN, CONTENTFUL_SPACE_ID, CONTENTFUL_ENVIRONMENT
 */

import { createClient } from "contentful-management";

const {
  CONTENTFUL_MANAGEMENT_TOKEN,
  CONTENTFUL_SPACE_ID: spaceId,
  CONTENTFUL_ENVIRONMENT: environmentId = "master",
} = process.env;

if (!CONTENTFUL_MANAGEMENT_TOKEN || !spaceId) {
  console.error("Missing CONTENTFUL_MANAGEMENT_TOKEN or CONTENTFUL_SPACE_ID");
  process.exit(1);
}

const client = createClient({ accessToken: CONTENTFUL_MANAGEMENT_TOKEN });
const ctx = { spaceId, environmentId };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function upsertContentType(contentTypeId, def) {
  try {
    const existing = await client.contentType.get({ ...ctx, contentTypeId });
    console.log(`  ⏭  ${contentTypeId} already exists — skipping`);
    return existing;
  } catch {
    console.log(`  ✚  creating ${contentTypeId}`);
    const ct = await client.contentType.createWithId({ ...ctx, contentTypeId }, def);
    await client.contentType.publish({ ...ctx, contentTypeId }, ct);
    return ct;
  }
}

async function upsertEntry(contentTypeId, entryId, fields) {
  try {
    await client.entry.get({ ...ctx, entryId });
    console.log(`  ⏭  entry ${entryId} already exists — skipping`);
    return;
  } catch {
    console.log(`  ✚  creating entry ${entryId}`);
    const entry = await client.entry.createWithId(
      { ...ctx, contentTypeId, entryId },
      { fields }
    );
    await client.entry.publish({ ...ctx, entryId }, entry);
  }
}

function loc(value) {
  return { "en-US": value };
}

// ---------------------------------------------------------------------------
// Content types
// ---------------------------------------------------------------------------

console.log("\n── tag ──────────────────────────────────────────────────────");
await upsertContentType("tag", {
  name: "Tag",
  displayField: "name",
  fields: [
    { id: "name", name: "Name", type: "Symbol", required: true },
    { id: "slug", name: "Slug", type: "Symbol", required: true,
      validations: [{ unique: true }] },
  ],
});

console.log("\n── siteSettings ─────────────────────────────────────────────");
await upsertContentType("siteSettings", {
  name: "Site Settings",
  displayField: "siteTitle",
  fields: [
    { id: "siteTitle", name: "Site Title", type: "Symbol" },
    { id: "metaDescription", name: "Meta Description", type: "Symbol" },
  ],
});

console.log("\n── heroSection ──────────────────────────────────────────────");
await upsertContentType("heroSection", {
  name: "Hero Section",
  displayField: "headline",
  fields: [
    { id: "headline", name: "Headline", type: "Symbol" },
    { id: "subheadline", name: "Subheadline", type: "Symbol" },
    { id: "ctaLabel", name: "CTA Label", type: "Symbol" },
    { id: "ctaUrl", name: "CTA URL", type: "Symbol" },
  ],
});

console.log("\n── richTextSection ──────────────────────────────────────────");
await upsertContentType("richTextSection", {
  name: "Rich Text Section",
  displayField: "internalName",
  fields: [
    { id: "internalName", name: "Internal Name", type: "Symbol" },
    { id: "body", name: "Body", type: "RichText" },
  ],
});

console.log("\n── page ─────────────────────────────────────────────────────");
await upsertContentType("page", {
  name: "Page",
  displayField: "title",
  fields: [
    { id: "title", name: "Title", type: "Symbol", required: true },
    { id: "slug", name: "Slug", type: "Symbol", required: true,
      validations: [{ unique: true }] },
    {
      id: "sections",
      name: "Sections",
      type: "Array",
      items: {
        type: "Link",
        linkType: "Entry",
        validations: [{ linkContentType: ["heroSection", "richTextSection"] }],
      },
    },
  ],
});

// ---------------------------------------------------------------------------
// Update article — add tags field
// ---------------------------------------------------------------------------

console.log("\n── article (add tags field) ─────────────────────────────────");
const articleCt = await client.contentType.get({ ...ctx, contentTypeId: "article" });
if (articleCt.fields.some((f) => f.id === "tags")) {
  console.log("  ⏭  tags field already exists — skipping");
} else {
  console.log("  ✚  adding tags field");
  articleCt.fields.push({
    id: "tags",
    name: "Tags",
    type: "Array",
    items: {
      type: "Link",
      linkType: "Entry",
      validations: [{ linkContentType: ["tag"] }],
    },
  });
  const updated = await client.contentType.update(
    { ...ctx, contentTypeId: "article" },
    articleCt
  );
  await client.contentType.publish({ ...ctx, contentTypeId: "article" }, updated);
}

// ---------------------------------------------------------------------------
// Seed entries
// ---------------------------------------------------------------------------

console.log("\n── seed: siteSettings ───────────────────────────────────────");
await upsertEntry("siteSettings", "site-settings-main", {
  siteTitle: loc("Sugartown Digital"),
  metaDescription: loc(
    "Bex's digital garden — articles, case studies, and knowledge graph nodes on design systems, CMS architecture, and platform thinking."
  ),
});

console.log("\n── seed: tags ───────────────────────────────────────────────");
await upsertEntry("tag", "tag-design-systems", {
  name: loc("Design Systems"),
  slug: loc("design-systems"),
});
await upsertEntry("tag", "tag-cms-architecture", {
  name: loc("CMS Architecture"),
  slug: loc("cms-architecture"),
});
await upsertEntry("tag", "tag-vercel", {
  name: loc("Vercel"),
  slug: loc("vercel"),
});

console.log("\n── seed: heroSection ────────────────────────────────────────");
await upsertEntry("heroSection", "hero-poc-home", {
  headline: loc("CMS-agnostic design system — proof of concept"),
  subheadline: loc(
    "The same Pink Moon token pipeline and DS components, running on Contentful and Vercel."
  ),
  ctaLabel: loc("Read the articles"),
  ctaUrl: loc("/"),
});

console.log("\n── seed: richTextSection ────────────────────────────────────");
await upsertEntry("richTextSection", "rts-poc-about", {
  internalName: loc("About this POC"),
  body: loc({
    nodeType: "document",
    data: {},
    content: [
      {
        nodeType: "heading-2",
        data: {},
        content: [{ nodeType: "text", value: "About this proof of concept", marks: [], data: {} }],
      },
      {
        nodeType: "paragraph",
        data: {},
        content: [
          {
            nodeType: "text",
            value:
              "This app is SUG-127 — a monorepo POC proving that the Sugartown design system is genuinely CMS-agnostic. The same components and token pipeline that power the Sanity-backed main site render this Contentful-backed app without modification.",
            marks: [],
            data: {},
          },
        ],
      },
      {
        nodeType: "paragraph",
        data: {},
        content: [
          {
            nodeType: "text",
            value:
              "Findings — what was agnostic, what needed an adapter, and what required a packaging fix — are documented in the coupling-point audit at ",
            marks: [],
            data: {},
          },
          {
            nodeType: "hyperlink",
            data: { uri: "https://github.com/sugartown/sugartown" },
            content: [
              {
                nodeType: "text",
                value: "docs/briefs/SUG-127-architecture-decisions.md",
                marks: [],
                data: {},
              },
            ],
          },
          { nodeType: "text", value: ".", marks: [], data: {} },
        ],
      },
    ],
  }),
});

console.log("\n── seed: page ───────────────────────────────────────────────");
await upsertEntry("page", "page-poc-home", {
  title: loc("POC Home"),
  slug: loc("poc-home"),
  sections: loc([
    { sys: { type: "Link", linkType: "Entry", id: "hero-poc-home" } },
    { sys: { type: "Link", linkType: "Entry", id: "rts-poc-about" } },
  ]),
});

console.log("\n✅  Phase 2 content model setup complete.\n");
