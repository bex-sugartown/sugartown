/**
 * SUG-188 Phase 2 — Seed siteSettings nav/footer data + homepage page entry
 *
 * Requires sug-188-extend-content-model.mjs to have run first.
 *
 * Creates:
 *   navigationItem entries  (nav links: Articles, Tags, Pages; footer: legal links)
 *   navigationMenu entries  (Primary Nav, Footer: Content, Footer: Legal)
 *   socialLink entries      (GitHub, LinkedIn, Bluesky)
 *   ctaButton entry         (header CTA: "Get in touch")
 *   page entry              (slug: "home" with heroSection + richTextSection)
 *
 * Updates:
 *   siteSettings            (wire primaryNav, headerCta, footerColumns, socialLinks,
 *                            copyrightText, licenseLabel, licenseUrl, siteUrl)
 *
 * Idempotent: skips entry creation if it already exists.
 * siteSettings patch always re-runs to ensure all refs are wired correctly.
 *
 * Run from repo root:
 *   CONTENTFUL_MANAGEMENT_TOKEN=<token> node apps/contentful-poc/scripts/sug-188-seed-entries.mjs
 */

import { createClient } from "contentful-management";

const {
  CONTENTFUL_MANAGEMENT_TOKEN,
  CONTENTFUL_SPACE_ID: spaceId = "0yjpaqyzq90s",
  CONTENTFUL_ENVIRONMENT: environmentId = "master",
} = process.env;

if (!CONTENTFUL_MANAGEMENT_TOKEN) {
  console.error(
    "\n❌  CONTENTFUL_MANAGEMENT_TOKEN is required.\n" +
    "    Run: CONTENTFUL_MANAGEMENT_TOKEN=<token> node apps/contentful-poc/scripts/sug-188-seed-entries.mjs\n"
  );
  process.exit(1);
}

const client = createClient({ accessToken: CONTENTFUL_MANAGEMENT_TOKEN });
const ctx = { spaceId, environmentId };

function loc(value) {
  return { "en-US": value };
}

function link(id) {
  return { sys: { type: "Link", linkType: "Entry", id } };
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

// ---------------------------------------------------------------------------
// navigationItem entries — nav links
// ---------------------------------------------------------------------------

console.log("\n── navigationItem entries ────────────────────────────────────");

await upsertEntry("navigationItem", "nav-item-articles", {
  label: loc("Articles"),
  url: loc("/articles"),
  openInNewTab: loc(false),
});

await upsertEntry("navigationItem", "nav-item-tags", {
  label: loc("Tags"),
  url: loc("/tags"),
  openInNewTab: loc(false),
});

await upsertEntry("navigationItem", "nav-item-pages", {
  label: loc("Pages"),
  url: loc("/pages"),
  openInNewTab: loc(false),
});

// Footer: Legal column items
await upsertEntry("navigationItem", "nav-item-privacy", {
  label: loc("Privacy"),
  url: loc("/pages/privacy"),
  openInNewTab: loc(false),
});

await upsertEntry("navigationItem", "nav-item-terms", {
  label: loc("Terms"),
  url: loc("/pages/terms"),
  openInNewTab: loc(false),
});

// ---------------------------------------------------------------------------
// navigationMenu entries
// ---------------------------------------------------------------------------

console.log("\n── navigationMenu entries ────────────────────────────────────");

await upsertEntry("navigationMenu", "nav-menu-primary", {
  title: loc("Primary Nav"),
  items: loc([link("nav-item-articles"), link("nav-item-tags"), link("nav-item-pages")]),
});

await upsertEntry("navigationMenu", "nav-menu-footer-content", {
  title: loc("Content"),
  items: loc([link("nav-item-articles"), link("nav-item-tags")]),
});

await upsertEntry("navigationMenu", "nav-menu-footer-legal", {
  title: loc("Legal"),
  items: loc([link("nav-item-privacy"), link("nav-item-terms")]),
});

// ---------------------------------------------------------------------------
// socialLink entries
// ---------------------------------------------------------------------------

console.log("\n── socialLink entries ────────────────────────────────────────");

await upsertEntry("socialLink", "social-github", {
  platform: loc("github"),
  url: loc("https://github.com/sugartown"),
  label: loc("Sugartown on GitHub"),
});

await upsertEntry("socialLink", "social-linkedin", {
  platform: loc("linkedin"),
  url: loc("https://www.linkedin.com/in/bexhead"),
  label: loc("Bex Head on LinkedIn"),
});

await upsertEntry("socialLink", "social-bluesky", {
  platform: loc("bluesky"),
  url: loc("https://bsky.app/profile/sugartown.io"),
  label: loc("Sugartown on Bluesky"),
});

// ---------------------------------------------------------------------------
// ctaButton entry
// ---------------------------------------------------------------------------

console.log("\n── ctaButton entry ──────────────────────────────────────────");

await upsertEntry("ctaButton", "cta-get-in-touch", {
  label: loc("Get in touch"),
  url: loc("mailto:bex@sugartown.io"),
  style: loc("primary"),
  openInNewTab: loc(false),
});

// ---------------------------------------------------------------------------
// page entry — homepage (slug: "home")
//
// Uses existing heroSection (hero-poc-home) and richTextSection (rts-poc-about)
// seeded in the original setup-content-model.mjs.
// ---------------------------------------------------------------------------

console.log("\n── page entry: homepage ─────────────────────────────────────");

await upsertEntry("page", "page-home", {
  title: loc("Home"),
  slug: loc("home"),
  sections: loc([
    link("hero-poc-home"),
    link("rts-poc-about"),
  ]),
});

// ---------------------------------------------------------------------------
// siteSettings — wire all refs
//
// Always patches (not idempotent skip) so re-running fixes partial wires.
// ---------------------------------------------------------------------------

console.log("\n── siteSettings: wire nav + footer refs ─────────────────────");

const SITE_SETTINGS_ENTRY_ID = "site-settings-main";

let entry;
try {
  entry = await client.entry.get({ ...ctx, entryId: SITE_SETTINGS_ENTRY_ID });
} catch {
  console.error(`  ❌  siteSettings entry "${SITE_SETTINGS_ENTRY_ID}" not found.`);
  console.error("      Run setup-content-model.mjs first to seed the initial siteSettings entry.");
  process.exit(1);
}

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

console.log("  ✎  patching siteSettings with nav, footer, social, copyright");
const updated = await client.entry.update({ ...ctx, entryId: SITE_SETTINGS_ENTRY_ID }, entry);
await client.entry.publish({ ...ctx, entryId: SITE_SETTINGS_ENTRY_ID }, updated);
console.log("  ✅  siteSettings patched and published");

console.log("\n✅  SUG-188 Phase 2 complete — siteSettings wired, homepage page entry created.");
console.log("    Next: run SUG-179 to wire DS Header/Footer components to this data.\n");
