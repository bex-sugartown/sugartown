/**
 * SUG-188 Phase 1 — Extend Contentful content model for DS Header/Footer wiring
 *
 * Creates:
 *   - navigationItem  (atomic nav link: label + url + openInNewTab)
 *   - navigationMenu  (named ordered list of navigationItem references)
 *   - socialLink      (platform enum + url + optional label)
 *   - ctaButton       (label + url + style enum + openInNewTab)
 *
 * Extends:
 *   - siteSettings    (adds siteLogo, tagline, primaryNav, headerCta,
 *                      footerLogo, footerColumns, socialLinks, copyrightText,
 *                      licenseLabel, licenseUrl, siteUrl, defaultOgImage)
 *
 * Phase 2 (seed entries) is in sug-188-seed-entries.mjs — run after this script.
 *
 * Idempotent: skips content type creation if it already exists.
 * Field extension is additive: existing siteSettings fields are not removed.
 *
 * Run from repo root:
 *   CONTENTFUL_MANAGEMENT_TOKEN=<token> node apps/contentful-poc/scripts/sug-188-extend-content-model.mjs
 *
 * Requires:
 *   CONTENTFUL_MANAGEMENT_TOKEN — get from Contentful → Settings → API keys → CMA tokens
 *   CONTENTFUL_SPACE_ID         — already in .env.local (0yjpaqyzq90s)
 *   CONTENTFUL_ENVIRONMENT      — defaults to "master"
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
    "    Get it from: Contentful → Settings → API keys → Content Management Tokens\n" +
    "    Run: CONTENTFUL_MANAGEMENT_TOKEN=<token> node apps/contentful-poc/scripts/sug-188-extend-content-model.mjs\n"
  );
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

/**
 * Extend an existing content type by adding fields not already present.
 * Does not remove or modify existing fields.
 */
async function extendContentType(contentTypeId, newFields) {
  console.log(`  ✎  extending ${contentTypeId}`);
  const ct = await client.contentType.get({ ...ctx, contentTypeId });
  const existingIds = new Set(ct.fields.map((f) => f.id));
  const toAdd = newFields.filter((f) => !existingIds.has(f.id));

  if (toAdd.length === 0) {
    console.log(`  ⏭  all fields already present — skipping`);
    return ct;
  }

  toAdd.forEach((f) => console.log(`     + ${f.id}`));
  ct.fields.push(...toAdd);
  const updated = await client.contentType.update({ ...ctx, contentTypeId }, ct);
  await client.contentType.publish({ ...ctx, contentTypeId }, updated);
  return updated;
}

// ---------------------------------------------------------------------------
// 1. navigationItem
//
// Atomic nav link. Referenced from navigationMenu.items[].
// Plain URL string (no internal reference graph in Contentful shop site).
// ---------------------------------------------------------------------------

console.log("\n── navigationItem ───────────────────────────────────────────");
await upsertContentType("navigationItem", {
  name: "Navigation Item",
  displayField: "label",
  description: "Atomic nav link — label + URL. Used inside navigationMenu entries.",
  fields: [
    {
      id: "label",
      name: "Label",
      type: "Symbol",
      required: true,
      validations: [{ size: { max: 50 } }],
    },
    {
      id: "url",
      name: "URL",
      type: "Symbol",
      required: true,
      // Allow internal paths (/articles) and full external URLs
    },
    {
      id: "openInNewTab",
      name: "Open in New Tab",
      type: "Boolean",
      required: false,
    },
  ],
});

// ---------------------------------------------------------------------------
// 2. navigationMenu
//
// Named ordered list of navigationItem references.
// Used for primaryNav (one entry) and footerColumns (array of entries,
// one per column — the menu's title becomes the column heading).
// ---------------------------------------------------------------------------

console.log("\n── navigationMenu ───────────────────────────────────────────");
await upsertContentType("navigationMenu", {
  name: "Navigation Menu",
  displayField: "title",
  description:
    "Named ordered list of navigation items. Used for primaryNav and footer columns (each menu title = column heading).",
  fields: [
    {
      id: "title",
      name: "Title",
      type: "Symbol",
      required: true,
      // Internal name and footer column heading. E.g. "Primary Nav", "Footer: Content"
    },
    {
      id: "items",
      name: "Items",
      type: "Array",
      required: false,
      items: {
        type: "Link",
        linkType: "Entry",
        validations: [{ linkContentType: ["navigationItem"] }],
      },
      validations: [{ size: { max: 10 } }],
    },
  ],
});

// ---------------------------------------------------------------------------
// 3. socialLink
//
// Platform + URL pair. Array of socialLink entries on siteSettings.
// Platform values match Sanity's SOCIAL_PLATFORM_OPTIONS enum.
// ---------------------------------------------------------------------------

console.log("\n── socialLink ───────────────────────────────────────────────");
await upsertContentType("socialLink", {
  name: "Social Link",
  displayField: "platform",
  description: "Social media platform + URL. Used in the footer brand zone social strip.",
  fields: [
    {
      id: "platform",
      name: "Platform",
      type: "Symbol",
      required: true,
      validations: [
        {
          in: [
            "github", "linkedin", "twitter", "bluesky", "instagram",
            "youtube", "rss", "email", "mastodon", "tiktok",
          ],
        },
      ],
    },
    {
      id: "url",
      name: "URL",
      type: "Symbol",
      required: true,
    },
    {
      id: "label",
      name: "Label",
      type: "Symbol",
      required: false,
      // Accessibility override. Falls back to platform name if empty.
    },
  ],
});

// ---------------------------------------------------------------------------
// 4. ctaButton
//
// Header CTA button. One reference from siteSettings.headerCta.
// style values map to DS Button variant prop.
// ---------------------------------------------------------------------------

console.log("\n── ctaButton ────────────────────────────────────────────────");
await upsertContentType("ctaButton", {
  name: "CTA Button",
  displayField: "label",
  description: "Call-to-action button. Referenced from siteSettings.headerCta.",
  fields: [
    {
      id: "label",
      name: "Label",
      type: "Symbol",
      required: true,
    },
    {
      id: "url",
      name: "URL",
      type: "Symbol",
      required: true,
    },
    {
      id: "style",
      name: "Style",
      type: "Symbol",
      required: false,
      validations: [{ in: ["primary", "secondary", "tertiary"] }],
      // Maps to DS Button variant prop
    },
    {
      id: "openInNewTab",
      name: "Open in New Tab",
      type: "Boolean",
      required: false,
    },
  ],
});

// ---------------------------------------------------------------------------
// 5. siteSettings — extend with nav, footer, SEO fields
//
// Existing fields (siteTitle, metaDescription) are NOT removed.
// Only fields not already present are added.
// ---------------------------------------------------------------------------

console.log("\n── siteSettings (extend) ────────────────────────────────────");
await extendContentType("siteSettings", [
  // General
  {
    id: "siteLogo",
    name: "Site Logo",
    type: "Link",
    linkType: "Asset",
    required: false,
  },
  {
    id: "tagline",
    name: "Tagline",
    type: "Symbol",
    required: false,
    validations: [{ size: { max: 100 } }],
  },

  // Header
  {
    id: "primaryNav",
    name: "Primary Navigation",
    type: "Link",
    linkType: "Entry",
    required: false,
    validations: [{ linkContentType: ["navigationMenu"] }],
  },
  {
    id: "headerCta",
    name: "Header CTA",
    type: "Link",
    linkType: "Entry",
    required: false,
    validations: [{ linkContentType: ["ctaButton"] }],
  },

  // Footer
  {
    id: "footerLogo",
    name: "Footer Logo",
    type: "Link",
    linkType: "Asset",
    required: false,
  },
  {
    id: "footerColumns",
    name: "Footer Columns",
    type: "Array",
    required: false,
    items: {
      type: "Link",
      linkType: "Entry",
      validations: [{ linkContentType: ["navigationMenu"] }],
    },
    validations: [{ size: { max: 4 } }],
  },
  {
    id: "socialLinks",
    name: "Social Links",
    type: "Array",
    required: false,
    items: {
      type: "Link",
      linkType: "Entry",
      validations: [{ linkContentType: ["socialLink"] }],
    },
    validations: [{ size: { max: 8 } }],
  },
  {
    id: "copyrightText",
    name: "Copyright Text",
    type: "Symbol",
    required: false,
    validations: [{ size: { max: 100 } }],
  },
  {
    id: "licenseLabel",
    name: "License Label",
    type: "Symbol",
    required: false,
    validations: [{ size: { max: 100 } }],
  },
  {
    id: "licenseUrl",
    name: "License URL",
    type: "Symbol",
    required: false,
  },

  // SEO / meta
  {
    id: "siteUrl",
    name: "Site URL",
    type: "Symbol",
    required: false,
  },
  {
    id: "defaultOgImage",
    name: "Default OG Image",
    type: "Link",
    linkType: "Asset",
    required: false,
  },
]);

console.log("\n✅  SUG-188 Phase 1 complete — content types created and siteSettings extended.");
console.log("    Next: run sug-188-seed-entries.mjs to populate siteSettings and create the homepage page entry.\n");
