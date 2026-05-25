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
import type { SerializedSection, SerializedArticle } from "@/lib/queries";

export type { SerializedSection };

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

type ArticleListFields = {
  internalName?: string;
  heading?: string;
  featuredArticles?: SerializedArticle[];
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

function ArticleListSection({ fields }: { fields: ArticleListFields }) {
  const articles = fields.featuredArticles ?? [];
  return (
    <section style={{ padding: "2rem" }}>
      {fields.heading && (
        <h2 style={{
          fontFamily: "var(--st-font-family-narrative)",
          fontSize: "var(--st-font-size-heading-2)",
          marginBottom: "2rem",
          color: "var(--st-color-text-default)",
        }}>
          {fields.heading}
        </h2>
      )}
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
        {articles.map((article) => (
          <li key={article.id}>
            <Link href={`/articles/${article.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
              <article style={{
                padding: "1.25rem 1.5rem",
                border: "1px solid var(--st-color-rule-default)",
                background: "var(--st-color-bg-surface)",
              }}>
                {article.publishDate && (
                  <p style={{
                    fontFamily: "var(--st-font-family-mono)",
                    fontSize: "var(--st-font-size-label)",
                    color: "var(--st-color-brand-primary)",
                    marginBottom: "0.4rem",
                  }}>
                    {new Date(article.publishDate).toLocaleDateString()}
                  </p>
                )}
                <h3 style={{
                  fontFamily: "var(--st-font-family-narrative)",
                  fontSize: "var(--st-font-size-heading-4)",
                  marginBottom: "0.5rem",
                }}>
                  {article.title}
                </h3>
                {article.summary && (
                  <p style={{ color: "var(--st-color-text-secondary)", fontSize: "var(--st-font-size-body)" }}>
                    {article.summary}
                  </p>
                )}
              </article>
            </Link>
          </li>
        ))}
      </ul>
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
          case "articleListSection":
            return <ArticleListSection key={section.id} fields={section.fields as ArticleListFields} />;
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
