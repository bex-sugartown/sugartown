/**
 * Normalizes a raw Contentful SiteSettingsEntry (with deeply resolved linked entries)
 * into a plain, JSON-serializable object safe to pass across the RSC → client boundary.
 *
 * Seam note: Sanity inline objects (navItem, socialLink) are already plain fields.
 * Contentful linked entries carry their data under .fields.* — this layer flattens them.
 */

import type { SiteSettingsEntry } from "@/lib/queries";

export type NavItem = {
  label: string;
  url: string;
  openInNewTab: boolean;
};

export type NavColumn = {
  title: string;
  items: NavItem[];
};

export type SocialLinkData = {
  platform: string;
  url: string;
  label: string | null;
};

export type CtaData = {
  label: string;
  url: string;
  style: "primary" | "secondary" | "tertiary";
  openInNewTab: boolean;
};

export type NormalizedSiteSettings = {
  siteTitle: string;
  siteLogoUrl: string | null;
  siteLogoAlt: string | null;
  tagline: string | null;
  primaryNav: NavItem[] | null;
  headerCta: CtaData | null;
  footerColumns: NavColumn[];
  socialLinks: SocialLinkData[];
  copyrightText: string | null;
  licenseLabel: string | null;
  licenseUrl: string | null;
};

function prefixProtocol(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.startsWith("//") ? `https:${url}` : url;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function navItems(items: any[] | undefined): NavItem[] {
  if (!Array.isArray(items)) return [];
  return items
    .filter((item) => item?.fields?.label && item?.fields?.url)
    .map((item) => ({
      label: item.fields.label as string,
      url: item.fields.url as string,
      openInNewTab: !!(item.fields.openInNewTab as boolean | undefined),
    }));
}

export function normalizeSiteSettings(
  entry: SiteSettingsEntry | null
): NormalizedSiteSettings | null {
  if (!entry) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const f = entry.fields as any;

  // Logo: Contentful asset fields.file.url is protocol-relative (//images.ctfassets.net/…)
  const logoAsset = f.siteLogo?.fields;
  const siteLogoUrl = prefixProtocol(logoAsset?.file?.url as string | undefined);
  const siteLogoAlt = (logoAsset?.title as string | null) ?? null;

  // Primary nav: one navigationMenu entry → flatten its items[]
  const primaryNav = f.primaryNav?.fields?.items
    ? navItems(f.primaryNav.fields.items)
    : null;

  // Header CTA
  const ctaFields = f.headerCta?.fields;
  const headerCta: CtaData | null = ctaFields?.label && ctaFields?.url
    ? {
        label: ctaFields.label as string,
        url: ctaFields.url as string,
        style: (ctaFields.style as "primary" | "secondary" | "tertiary") ?? "primary",
        openInNewTab: !!(ctaFields.openInNewTab as boolean | undefined),
      }
    : null;

  // Footer columns: array of navigationMenu entries; each menu.title = column heading
  const footerColumns: NavColumn[] = Array.isArray(f.footerColumns)
    ? f.footerColumns
        .filter((col: any) => col?.fields)
        .map((col: any) => ({
          title: (col.fields.title as string) ?? "",
          items: navItems(col.fields.items),
        }))
    : [];

  // Social links
  const socialLinks: SocialLinkData[] = Array.isArray(f.socialLinks)
    ? f.socialLinks
        .filter((sl: any) => sl?.fields?.platform && sl?.fields?.url)
        .map((sl: any) => ({
          platform: sl.fields.platform as string,
          url: sl.fields.url as string,
          label: (sl.fields.label as string | null) ?? null,
        }))
    : [];

  return {
    siteTitle: (f.siteTitle as string) ?? "Sugartown Digital",
    siteLogoUrl,
    siteLogoAlt,
    tagline: (f.tagline as string | null) ?? null,
    primaryNav,
    headerCta,
    footerColumns,
    socialLinks,
    copyrightText: (f.copyrightText as string | null) ?? null,
    licenseLabel: (f.licenseLabel as string | null) ?? null,
    licenseUrl: (f.licenseUrl as string | null) ?? null,
  };
}
