/**
 * Patch article-3 rich text: convert the first table row's cells from
 * table-cell to table-header-cell so the DS accent header style fires.
 *
 * Run: node apps/contentful-poc/scripts/patch-article3-table-headers.mjs
 */

import { createClient } from "contentful-management";

const {
  CONTENTFUL_SPACE_ID,
  CONTENTFUL_MANAGEMENT_TOKEN,
  CONTENTFUL_ENVIRONMENT = "master",
} = process.env;

if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_MANAGEMENT_TOKEN) {
  console.error("Missing CONTENTFUL_SPACE_ID or CONTENTFUL_MANAGEMENT_TOKEN");
  process.exit(1);
}

const client = createClient({ accessToken: CONTENTFUL_MANAGEMENT_TOKEN });
const ctx = { spaceId: CONTENTFUL_SPACE_ID, environmentId: CONTENTFUL_ENVIRONMENT };

const entryId = "n06IiZhmsmQwosLmuBT2j"; // article-3 slug

const entry = await client.entry.get({ ...ctx, entryId });
const body = entry.fields.body["en-US"];

// Walk the rich text tree and convert first-row cells
function convertFirstRowHeaders(node) {
  if (node.nodeType === "table") {
    const firstRow = node.content[0];
    if (firstRow && firstRow.nodeType === "table-row") {
      firstRow.content = firstRow.content.map((cell) => {
        if (cell.nodeType === "table-cell") {
          return { ...cell, nodeType: "table-header-cell" };
        }
        return cell;
      });
    }
    return node;
  }
  if (node.content) {
    node.content = node.content.map(convertFirstRowHeaders);
  }
  return node;
}

const patchedBody = convertFirstRowHeaders(JSON.parse(JSON.stringify(body)));

entry.fields.body["en-US"] = patchedBody;

const updated = await client.entry.update({ ...ctx, entryId }, entry);
await client.entry.publish({ ...ctx, entryId }, updated);

console.log("✅ article-3 patched — first table row now uses table-header-cell");
