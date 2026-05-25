"use client";

/**
 * Contentful section dispatcher — the equivalent of Sanity's PageSections.jsx.
 *
 * Key difference from Sanity:
 *   Sanity:     switch on section._type           (inline objects, discriminator is a direct field)
 *   Contentful: switch on entry.sys.contentType.sys.id  (linked entries, discriminator is in sys)
 *
 * The switch logic is structurally identical; the path to the discriminator differs.
 * Documented as a coupling-point finding in SUG-127-architecture-decisions.md.
 */

import type { Entry } from "contentful";
import { renderRichText } from "@/lib/contentfulRichText";
import type { HeroSectionSkeleton, RichTextSectionSkeleton } from "@/lib/queries";

type SectionEntry = Entry<HeroSectionSkeleton | RichTextSectionSkeleton, "WITHOUT_UNRESOLVABLE_LINKS", string>;

export function renderSection(entry: SectionEntry, key: string) {
  const contentTypeId = entry.sys.contentType.sys.id;

  switch (contentTypeId) {
    case "heroSection": {
      const f = entry.fields as Entry<HeroSectionSkeleton, "WITHOUT_UNRESOLVABLE_LINKS", string>["fields"];
      return (
        <section key={key} style={{
          padding: "4rem 2rem",
          background: "var(--st-color-bg-surface)",
          borderBottom: "1px solid var(--st-color-rule-accent)",
        }}>
          <h1 style={{ fontFamily: "var(--st-font-family-narrative)", fontSize: "var(--st-font-size-heading-1)", marginBottom: "1rem" }}>
            {f.headline}
          </h1>
          {f.subheadline && (
            <p style={{ fontSize: "var(--st-font-size-body-lg)", marginBottom: "1.5rem", color: "var(--st-color-text-secondary)" }}>
              {f.subheadline}
            </p>
          )}
          {f.ctaLabel && f.ctaUrl && (
            <a href={f.ctaUrl} style={{
              display: "inline-block",
              padding: "0.6rem 1.25rem",
              background: "var(--st-color-brand-primary)",
              color: "#fff",
              textDecoration: "none",
              fontFamily: "var(--st-font-family-ui)",
            }}>
              {f.ctaLabel}
            </a>
          )}
        </section>
      );
    }

    case "richTextSection": {
      const f = entry.fields as Entry<RichTextSectionSkeleton, "WITHOUT_UNRESOLVABLE_LINKS", string>["fields"];
      return (
        <section key={key} style={{ padding: "2rem", maxWidth: "760px" }}>
          {f.body && renderRichText(f.body)}
        </section>
      );
    }

    default:
      return (
        <section key={key} style={{ padding: "1rem", color: "var(--st-color-text-secondary)" }}>
          Unknown section type: {contentTypeId}
        </section>
      );
  }
}
