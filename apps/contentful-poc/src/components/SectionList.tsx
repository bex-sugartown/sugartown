"use client";

/**
 * Client boundary for section rendering.
 * The server page passes serialised section data; this component dispatches
 * to the correct section renderer based on sys.contentType.sys.id.
 *
 * Contentful discriminator path: entry.sys.contentType.sys.id
 * Sanity equivalent:             section._type
 */

import Link from "next/link";
import { renderRichText } from "@/lib/contentfulRichText";
import type { Document } from "@contentful/rich-text-types";

type HeroFields = {
  headline?: string;
  subheadline?: string;
  ctaLabel?: string;
  ctaUrl?: string;
};

type RichTextFields = {
  internalName?: string;
  body?: Document;
};

type SerializedSection = {
  id: string;
  contentTypeId: string;
  fields: HeroFields | RichTextFields;
};

function HeroSection({ fields }: { fields: HeroFields }) {
  return (
    <section style={{
      padding: "4rem 2rem",
      background: "var(--st-color-bg-surface)",
      borderBottom: "1px solid var(--st-color-rule-accent)",
    }}>
      <h1 style={{ fontFamily: "var(--st-font-family-narrative)", fontSize: "var(--st-font-size-heading-1)", marginBottom: "1rem" }}>
        {fields.headline}
      </h1>
      {fields.subheadline && (
        <p style={{ fontSize: "var(--st-font-size-body-lg)", marginBottom: "1.5rem", color: "var(--st-color-text-secondary)" }}>
          {fields.subheadline}
        </p>
      )}
      {fields.ctaLabel && fields.ctaUrl && (
        <Link href={fields.ctaUrl} style={{
          display: "inline-block",
          padding: "0.6rem 1.25rem",
          background: "var(--st-color-brand-primary)",
          color: "#fff",
          textDecoration: "none",
          fontFamily: "var(--st-font-family-ui)",
        }}>
          {fields.ctaLabel}
        </Link>
      )}
    </section>
  );
}

function RichTextSection({ fields }: { fields: RichTextFields }) {
  return (
    <section style={{ padding: "2rem", maxWidth: "760px" }}>
      {fields.body && renderRichText(fields.body)}
    </section>
  );
}

export function SectionList({ sections }: { sections: SerializedSection[] }) {
  return (
    <>
      {sections.map((section) => {
        switch (section.contentTypeId) {
          case "heroSection":
            return <HeroSection key={section.id} fields={section.fields as HeroFields} />;
          case "richTextSection":
            return <RichTextSection key={section.id} fields={section.fields as RichTextFields} />;
          default:
            return (
              <section key={section.id} style={{ padding: "1rem", color: "var(--st-color-text-secondary)" }}>
                Unknown section: {section.contentTypeId}
              </section>
            );
        }
      })}
    </>
  );
}
