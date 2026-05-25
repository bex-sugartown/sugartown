import { createClient } from "contentful-management";
const client = createClient({ accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN });
const r = await client.entry.getMany({
  spaceId: process.env.CONTENTFUL_SPACE_ID,
  environmentId: "master",
  query: { content_type: "article" }
});
console.log(r.items.map(e => ({ id: e.sys.id, slug: e.fields.slug?.["en-US"], title: e.fields.title?.["en-US"] })));
