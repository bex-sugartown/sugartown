import { createClient } from "contentful";

const space = process.env.CONTENTFUL_SPACE_ID;
const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
const environment = process.env.CONTENTFUL_ENVIRONMENT || "master";

if (!space || !accessToken) {
  throw new Error(
    "Missing CONTENTFUL_SPACE_ID or CONTENTFUL_ACCESS_TOKEN — check apps/contentful-poc/.env.local",
  );
}

export const contentfulClient = createClient({ space, accessToken, environment });
