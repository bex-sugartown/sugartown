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
      position: "relative",
      padding: "var(--st-space-section-break) var(--st-page-gutter) var(--st-space-hero-bottom)",
      minHeight: "180px",
      background: "transparent",
      color: "var(--st-color-text-default)",
      borderBottom: "1px solid var(--st-color-rule-accent)",
    }}>
      {/* heroContainer */}
      <div style={{
        position: "relative",
        zIndex: 2,
        maxWidth: "var(--st-width-detail)",
        margin: "0 auto",
        width: "100%",
      }}>
        {/* heroContent */}
        <div style={{ maxWidth: "700px" }}>
          <h1 style={{
            fontSize: "var(--st-font-heading-1)",
            fontWeight: "var(--st-font-weight-bold)",
            lineHeight: "var(--st-line-height-tight)",
            color: "var(--st-color-text-default)",
            margin: 0,
          }}>
            {fields.headline}
          </h1>
          {fields.subheadline && (
            <p style={{
              fontSize: "var(--st-font-heading-3)",
              lineHeight: "var(--st-line-height-relaxed)",
              color: "var(--st-color-text-secondary)",
              margin: `var(--st-spacing-stack-md) 0 0`,
            }}>
              {fields.subheadline}
            </p>
          )}
          {fields.ctaLabel && fields.ctaUrl && (
            <div style={{ marginTop: "var(--st-spacing-stack-lg)" }}>
              <Link href={fields.ctaUrl} style={{
                display: "inline-block",
                padding: "0.65rem 1.5rem",
                background: "var(--st-color-brand-primary)",
                color: "var(--st-color-white)",
                textDecoration: "none",
                fontFamily: "var(--st-font-family-ui)",
                fontSize: "var(--st-font-size-label)",
                fontWeight: "var(--st-font-weight-semibold)",
                letterSpacing: "0.01em",
              }}>
                {fields.ctaLabel}
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function RichTextSection({ fields }: { fields: RichTextFields }) {
  return (
    <section style={{
      maxWidth: "var(--st-width-detail)",
      margin: "0 auto",
      padding: "var(--st-space-section-break) var(--st-page-gutter)",
    }}>
      <div style={{
        font: "var(--st-font-heading-4)",
        lineHeight: "var(--st-line-height-relaxed)",
        color: "var(--st-color-text-default)",
      }}>
        {fields.body && renderRichText(fields.body)}
      </div>
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
