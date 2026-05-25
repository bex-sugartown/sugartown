/**
 * Tags the existing seed articles with relevant taxonomy entries.
 * Run from repo root: node apps/contentful-poc/scripts/tag-articles.mjs
 */

import { createClient } from "contentful-management";

const {
  CONTENTFUL_MANAGEMENT_TOKEN,
  CONTENTFUL_SPACE_ID: spaceId,
  CONTENTFUL_ENVIRONMENT: environmentId = "master",
} = process.env;

const client = createClient({ accessToken: CONTENTFUL_MANAGEMENT_TOKEN });
const ctx = { spaceId, environmentId };

const TAGS = {
  designSystems: { sys: { type: "Link", linkType: "Entry", id: "tag-design-systems" } },
  cmsArchitecture: { sys: { type: "Link", linkType: "Entry", id: "tag-cms-architecture" } },
  vercel: { sys: { type: "Link", linkType: "Entry", id: "tag-vercel" } },
};

// Fetch articles
const result = await client.entry.getMany({
  ...ctx,
  query: { content_type: "article" },
});

console.log(`\nFound ${result.items.length} articles:\n`);
result.items.forEach((a) => console.log(`  ${a.sys.id} — ${a.fields.slug?.["en-US"]}`));
console.log();

// Tag by slug — adjust if your slugs differ
const tagsBySlug = {
  "article-1": [TAGS.designSystems, TAGS.cmsArchitecture],
  "article-2": [TAGS.designSystems],
  "article-3": [TAGS.cmsArchitecture, TAGS.vercel],
};

for (const article of result.items) {
  const entryId = article.sys.id;
  const slug = article.fields.slug?.["en-US"] ?? entryId;
  const tags = tagsBySlug[slug];

  if (!tags) {
    console.log(`  ⏭  ${slug} — no assignment defined, skipping`);
    continue;
  }

  const updated = {
    ...article,
    fields: {
      ...article.fields,
      tags: { "en-US": tags },
    },
  };

  const saved = await client.entry.update({ ...ctx, entryId }, updated);
  await client.entry.publish({ ...ctx, entryId }, saved);
  console.log(`  ✅  ${slug} → ${tags.map((t) => t.sys.id).join(", ")}`);
}

console.log("\nDone.\n");
