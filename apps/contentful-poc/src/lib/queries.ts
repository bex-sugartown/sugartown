import type { EntryFieldTypes, EntrySkeletonType, Entry } from "contentful";
import { contentfulClient } from "@/lib/contentful";

// ── article ────────────────────────────────────────────────────────────────

export type TagSkeleton = EntrySkeletonType<
  {
    name: EntryFieldTypes.Symbol;
    slug: EntryFieldTypes.Symbol;
  },
  "tag"
>;

export type ArticleSkeleton = EntrySkeletonType<
  {
    title: EntryFieldTypes.Symbol;
    slug: EntryFieldTypes.Symbol;
    summary: EntryFieldTypes.Symbol;
    publishDate: EntryFieldTypes.Date;
    tags: EntryFieldTypes.Array<EntryFieldTypes.EntryLink<TagSkeleton>>;
    sections: EntryFieldTypes.Array<
      EntryFieldTypes.EntryLink<HeroSectionSkeleton | RichTextSectionSkeleton>
    >;
  },
  "article"
>;

export type ArticleEntry = Entry<ArticleSkeleton, "WITHOUT_UNRESOLVABLE_LINKS", string>;
export type TagEntry = Entry<TagSkeleton, undefined, string>;

export async function getAllArticles(): Promise<ArticleEntry[]> {
  const res = await contentfulClient.getEntries<ArticleSkeleton>({
    content_type: "article",
    order: ["-fields.publishDate"],
    include: 1,
  } as Parameters<typeof contentfulClient.getEntries>[0]);
  return res.items as ArticleEntry[];
}

export async function getArticleBySlug(slug: string): Promise<ArticleEntry | null> {
  const res = await contentfulClient.getEntries<ArticleSkeleton>({
    content_type: "article",
    "fields.slug": slug,
    limit: 1,
    include: 2,
  } as Parameters<typeof contentfulClient.getEntries>[0]);
  return (res.items[0] as ArticleEntry) ?? null;
}

// ── tag ────────────────────────────────────────────────────────────────────

export async function getAllTags(): Promise<TagEntry[]> {
  const res = await contentfulClient.getEntries<TagSkeleton>({
    content_type: "tag",
    order: ["fields.name"],
  });
  return res.items;
}

export async function getTagBySlug(slug: string): Promise<TagEntry | null> {
  const res = await contentfulClient.getEntries<TagSkeleton>({
    content_type: "tag",
    "fields.slug": slug,
    limit: 1,
  });
  return res.items[0] ?? null;
}

export async function getArticlesByTag(tagId: string): Promise<ArticleEntry[]> {
  const res = await contentfulClient.getEntries<ArticleSkeleton>({
    content_type: "article",
    "fields.tags.sys.id": tagId,
    order: ["-fields.publishDate"],
    include: 1,
  } as Parameters<typeof contentfulClient.getEntries>[0]);
  return res.items as ArticleEntry[];
}

// ── siteSettings ───────────────────────────────────────────────────────────

export type SiteSettingsSkeleton = EntrySkeletonType<
  {
    siteTitle: EntryFieldTypes.Symbol;
    metaDescription: EntryFieldTypes.Symbol;
  },
  "siteSettings"
>;

export type SiteSettingsEntry = Entry<SiteSettingsSkeleton, undefined, string>;

export async function getSiteSettings(): Promise<SiteSettingsEntry | null> {
  const res = await contentfulClient.getEntries<SiteSettingsSkeleton>({
    content_type: "siteSettings",
    limit: 1,
  });
  return res.items[0] ?? null;
}

// ── page + sections ────────────────────────────────────────────────────────
// Sections are linked entries — discriminated by sys.contentType.sys.id.
// Contentful equivalent of Sanity's _type discriminator on inline objects.
// Fetching with include: 2 resolves sections in a single request.

export type HeroSectionSkeleton = EntrySkeletonType<
  {
    headline: EntryFieldTypes.Symbol;
    subheadline: EntryFieldTypes.Symbol;
    ctaLabel: EntryFieldTypes.Symbol;
    ctaUrl: EntryFieldTypes.Symbol;
  },
  "heroSection"
>;

export type RichTextSectionSkeleton = EntrySkeletonType<
  {
    internalName: EntryFieldTypes.Symbol;
    body: EntryFieldTypes.RichText;
  },
  "richTextSection"
>;

export type PageSkeleton = EntrySkeletonType<
  {
    title: EntryFieldTypes.Symbol;
    slug: EntryFieldTypes.Symbol;
    sections: EntryFieldTypes.Array<
      EntryFieldTypes.EntryLink<HeroSectionSkeleton | RichTextSectionSkeleton>
    >;
  },
  "page"
>;

export type PageEntry = Entry<PageSkeleton, "WITHOUT_UNRESOLVABLE_LINKS", string>;

export async function getPageBySlug(slug: string): Promise<PageEntry | null> {
  const res = await contentfulClient.getEntries<PageSkeleton>({
    content_type: "page",
    "fields.slug": slug,
    limit: 1,
    include: 2,
  } as Parameters<typeof contentfulClient.getEntries>[0]);
  return (res.items[0] as PageEntry) ?? null;
}
