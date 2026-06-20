/**
 * SUG-188 — Fix homepage slug conflict and patch siteSettings
 *
 * The Phase 2 seed script created page-home as a draft but could not publish it
 * because page-poc-home (slug: "home") held the unique slug constraint.
 *
 * This script:
 * 1. Deletes the unpublished page-home draft
 * 2. Confirms page-poc-home has slug "home" (updates if not)
 * 3. Runs the full siteSettings patch
 */

import { createClient } from "contentful-management";

const {
  CONTENTFUL_MANAGEMENT_TOKEN,
  CONTENTFUL_SPACE_ID: spaceId = "0yjpaqyzq90s",
  CONTENTFUL_ENVIRONMENT: environmentId = "master",
} = process.env;

const client = createClient({ accessToken: CONTENTFUL_MANAGEMENT_TOKEN });
const ctx = { spaceId, environmentId };

function loc(v) { return { "en-US": v }; }

// 1. Delete the unpublished page-home draft
console.log("\n── page-home draft cleanup ──────────────────────────────────");
try {
  const draft = await client.entry.get({ ...ctx, entryId: "page-home" });
  const isPublished = !!draft.sys.publishedVersion;
  if (!isPublished) {
    await client.entry.delete({ ...ctx, entryId: "page-home" });
    console.log("  ✅  Deleted unpublished page-home draft");
  } else {
    console.log("  ⏭  page-home is published — not deleting");
  }
} catch {
  console.log("  ⏭  page-home does not exist — nothing to clean up");
}

// 2. Ensure page-poc-home has slug "home"
console.log("\n── page-poc-home: confirm slug = 'home' ─────────────────────");
const pocHome = await client.entry.get({ ...ctx, entryId: "page-poc-home" });
const currentSlug = pocHome.fields.slug?.["en-US"];
console.log(`  current slug: "${currentSlug}"`);

if (currentSlug !== "home") {
  pocHome.fields.slug = loc("home");
  const updated = await client.entry.update({ ...ctx, entryId: "page-poc-home" }, pocHome);
  await client.entry.publish({ ...ctx, entryId: "page-poc-home" }, updated);
  console.log("  ✅  Updated page-poc-home slug to 'home' and republished");
} else {
  console.log("  ⏭  Slug already 'home' — no change");
}

// 3. Patch siteSettings
console.log("\n── siteSettings: wire nav + footer refs ─────────────────────");
const entry = await client.entry.get({ ...ctx, entryId: "site-settings-main" });

entry.fields.primaryNav = loc({ sys: { type: "Link", linkType: "Entry", id: "nav-menu-primary" } });
entry.fields.headerCta = loc({ sys: { type: "Link", linkType: "Entry", id: "cta-get-in-touch" } });
entry.fields.footerColumns = loc([
  { sys: { type: "Link", linkType: "Entry", id: "nav-menu-footer-content" } },
  { sys: { type: "Link", linkType: "Entry", id: "nav-menu-footer-legal" } },
]);
entry.fields.socialLinks = loc([
  { sys: { type: "Link", linkType: "Entry", id: "social-github" } },
  { sys: { type: "Link", linkType: "Entry", id: "social-linkedin" } },
  { sys: { type: "Link", linkType: "Entry", id: "social-bluesky" } },
]);
entry.fields.copyrightText = loc("All rights reserved.");
entry.fields.licenseLabel = loc("Content CC BY-NC 4.0 · Code MIT");
entry.fields.licenseUrl = loc("https://creativecommons.org/licenses/by-nc/4.0/");
entry.fields.siteUrl = loc("https://poc.sugartown.io");

const updated = await client.entry.update({ ...ctx, entryId: "site-settings-main" }, entry);
await client.entry.publish({ ...ctx, entryId: "site-settings-main" }, updated);
console.log("  ✅  siteSettings patched and published");

console.log("\n✅  SUG-188 Phase 2 fixup complete.\n");
