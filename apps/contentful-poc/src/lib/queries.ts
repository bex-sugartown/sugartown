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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
  return res.items as ArticleEntry[];
}

export async function getArticleBySlug(slug: string): Promise<ArticleEntry | null> {
  const res = await contentfulClient.getEntries<ArticleSkeleton>({
    content_type: "article",
    "fields.slug": slug,
    limit: 1,
    include: 2,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
  return res.items as ArticleEntry[];
}

// ── nav + CTA content types (SUG-188) ─────────────────────────────────────

export type NavigationItemSkeleton = EntrySkeletonType<
  {
    label: EntryFieldTypes.Symbol;
    url: EntryFieldTypes.Symbol;
    openInNewTab: EntryFieldTypes.Boolean;
  },
  "navigationItem"
>;

export type NavigationMenuSkeleton = EntrySkeletonType<
  {
    title: EntryFieldTypes.Symbol;
    items: EntryFieldTypes.Array<EntryFieldTypes.EntryLink<NavigationItemSkeleton>>;
  },
  "navigationMenu"
>;

export type SocialLinkSkeleton = EntrySkeletonType<
  {
    platform: EntryFieldTypes.Symbol;
    url: EntryFieldTypes.Symbol;
    label: EntryFieldTypes.Symbol;
  },
  "socialLink"
>;

export type CtaButtonSkeleton = EntrySkeletonType<
  {
    label: EntryFieldTypes.Symbol;
    url: EntryFieldTypes.Symbol;
    style: EntryFieldTypes.Symbol;
    openInNewTab: EntryFieldTypes.Boolean;
  },
  "ctaButton"
>;

// ── siteSettings ───────────────────────────────────────────────────────────

export type SiteSettingsSkeleton = EntrySkeletonType<
  {
    // General
    siteTitle: EntryFieldTypes.Symbol;
    metaDescription: EntryFieldTypes.Symbol;
    siteLogo: EntryFieldTypes.AssetLink;
    tagline: EntryFieldTypes.Symbol;
    // Header
    primaryNav: EntryFieldTypes.EntryLink<NavigationMenuSkeleton>;
    headerCta: EntryFieldTypes.EntryLink<CtaButtonSkeleton>;
    // Footer
    footerLogo: EntryFieldTypes.AssetLink;
    footerColumns: EntryFieldTypes.Array<EntryFieldTypes.EntryLink<NavigationMenuSkeleton>>;
    socialLinks: EntryFieldTypes.Array<EntryFieldTypes.EntryLink<SocialLinkSkeleton>>;
    copyrightText: EntryFieldTypes.Symbol;
    licenseLabel: EntryFieldTypes.Symbol;
    licenseUrl: EntryFieldTypes.Symbol;
    // SEO
    siteUrl: EntryFieldTypes.Symbol;
    defaultOgImage: EntryFieldTypes.AssetLink;
  },
  "siteSettings"
>;

// include: 3 resolves siteSettings → navigationMenu → navigationItem (depth 3)
// and siteSettings → footerColumns[] → navigationMenu → navigationItem (depth 3)
export type SiteSettingsEntry = Entry<SiteSettingsSkeleton, "WITHOUT_UNRESOLVABLE_LINKS", string>;

export async function getSiteSettings(): Promise<SiteSettingsEntry | null> {
  const res = await contentfulClient.getEntries<SiteSettingsSkeleton>({
    content_type: "siteSettings",
    limit: 1,
    include: 3,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
  return (res.items[0] as SiteSettingsEntry) ?? null;
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

export type ArticleListSectionSkeleton = EntrySkeletonType<
  {
    internalName: EntryFieldTypes.Symbol;
    heading: EntryFieldTypes.Symbol;
    featuredArticles: EntryFieldTypes.Array<EntryFieldTypes.EntryLink<ArticleSkeleton>>;
  },
  "articleListSection"
>;

export type PageSkeleton = EntrySkeletonType<
  {
    title: EntryFieldTypes.Symbol;
    slug: EntryFieldTypes.Symbol;
    sections: EntryFieldTypes.Array<
      EntryFieldTypes.EntryLink<HeroSectionSkeleton | RichTextSectionSkeleton | ArticleListSectionSkeleton>
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
  return (res.items[0] as PageEntry) ?? null;
}

// ── section serialization ──────────────────────────────────────────────────
// Normalises raw Contentful linked entries into a plain shape safe to pass
// across the server/client boundary. articleListSection requires special
// handling to flatten its nested featuredArticles references.

export type SerializedArticle = {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  publishDate?: string;
};

export type SerializedSection = {
  id: string;
  contentTypeId: string;
  fields: Record<string, unknown>;
};

type AnySectionEntry = Entry<
  HeroSectionSkeleton | RichTextSectionSkeleton | ArticleListSectionSkeleton,
  "WITHOUT_UNRESOLVABLE_LINKS",
  string
>;

export function serializeSections(rawSections: unknown[]): SerializedSection[] {
  return (rawSections as AnySectionEntry[])
    .filter((s) => !!s.sys?.contentType)
    .map((s) => {
      const contentTypeId = s.sys.contentType.sys.id;
      if (contentTypeId === "articleListSection") {
        const f = s.fields as Record<string, unknown>;
        const featuredArticles: SerializedArticle[] = (
          (f.featuredArticles as ArticleEntry[] | undefined) ?? []
        )
          .filter((a) => !!a?.fields)
          .map((a) => ({
            id: a.sys.id,
            title: a.fields.title ?? "",
            slug: a.fields.slug ?? "",
            summary: a.fields.summary,
            publishDate: a.fields.publishDate,
          }));
        return { id: s.sys.id, contentTypeId, fields: { ...f, featuredArticles } };
      }
      return { id: s.sys.id, contentTypeId, fields: s.fields as Record<string, unknown> };
    });
}
