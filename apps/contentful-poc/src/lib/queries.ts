import type { EntryFieldTypes, EntrySkeletonType, Entry } from "contentful";
import { contentfulClient } from "@/lib/contentful";

// The Contentful equivalent of a Sanity schema type: the field shape + the
// content-type id ("article") as the discriminator.
export type ArticleSkeleton = EntrySkeletonType<
  {
    title: EntryFieldTypes.Symbol;
    slug: EntryFieldTypes.Symbol;
    summary: EntryFieldTypes.Symbol;
    publishDate: EntryFieldTypes.Date;
    body: EntryFieldTypes.RichText;
  },
  "article"
>;

export type ArticleEntry = Entry<ArticleSkeleton, undefined, string>;

export async function getAllArticles(): Promise<ArticleEntry[]> {
  const res = await contentfulClient.getEntries<ArticleSkeleton>({
    content_type: "article",
    order: ["-fields.publishDate"],
  });
  return res.items;
}

export async function getArticleBySlug(slug: string): Promise<ArticleEntry | null> {
  const res = await contentfulClient.getEntries<ArticleSkeleton>({
    content_type: "article",
    "fields.slug": slug,
    limit: 1,
  });
  return res.items[0] ?? null;
}
