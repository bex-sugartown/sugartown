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
      minHeight: "var(--st-hero-imageless-min-height)",
      background: "transparent",
      color: "var(--st-color-text-default)",
      borderBottom: "var(--st-border-width) solid var(--st-color-rule-accent)",
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
        <div style={{ maxWidth: "var(--st-hero-content-max-width)" }}>
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
                padding: "var(--st-cta-padding-y) var(--st-cta-padding-x)",
                background: "var(--st-color-brand-primary)",
                color: "var(--st-color-white)",
                textDecoration: "none",
                fontFamily: "var(--st-font-family-ui)",
                fontSize: "var(--st-font-size-label)",
                fontWeight: "var(--st-font-weight-semibold)",
                letterSpacing: "var(--st-letter-spacing-cta)",
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
    <section style={{
      maxWidth: "var(--st-width-detail)",
      margin: "0 auto",
      padding: "var(--st-space-section-break) var(--st-page-gutter)",
    }}>
      {fields.heading && (
        <h2 style={{
          font: "var(--st-font-heading-2)",
          fontWeight: "var(--st-font-weight-bold)",
          color: "var(--st-color-brand-primary)",
          lineHeight: "var(--st-line-height-tight)",
          margin: `0 0 var(--st-spacing-stack-lg)`,
        }}>
          {fields.heading}
        </h2>
      )}
      <ul style={{
        listStyle: "none",
        padding: 0,
        margin: 0,
        display: "flex",
        flexDirection: "column",
        gap: "var(--st-space-card-gap)",
      }}>
        {articles.map((article) => (
          <li key={article.id}>
            <Link href={`/articles/${article.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
              <article style={{
                padding: "var(--st-space-4) var(--st-space-4)",
                border: "var(--st-border-width) solid var(--st-color-rule-default)",
                background: "var(--st-color-bg-surface)",
              }}>
                {article.publishDate && (
                  <p style={{
                    fontFamily: "var(--st-font-family-mono)",
                    fontSize: "var(--st-font-size-meta)",
                    letterSpacing: "var(--st-letter-spacing-meta)",
                    textTransform: "uppercase",
                    color: "var(--st-color-brand-primary)",
                    margin: `0 0 var(--st-spacing-stack-sm)`,
                  }}>
                    {new Date(article.publishDate).toLocaleDateString()}
                  </p>
                )}
                <h3 style={{
                  font: "var(--st-font-heading-4)",
                  fontWeight: "var(--st-font-weight-semibold)",
                  color: "var(--st-color-text-default)",
                  margin: `0 0 var(--st-spacing-stack-sm)`,
                }}>
                  {article.title}
                </h3>
                {article.summary && (
                  <p style={{
                    fontFamily: "var(--st-font-family-ui)",
                    fontSize: "var(--st-font-size-body)",
                    lineHeight: "var(--st-line-height-relaxed)",
                    color: "var(--st-color-text-secondary)",
                    margin: 0,
                  }}>
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

export function SectionList({ sections, allArticles = [] }: { sections: SerializedSection[]; allArticles?: SerializedArticle[] }) {
  return (
    <>
      {sections.map((section) => {
        switch (section.contentTypeId) {
          case "heroSection":
            return <HeroSection key={section.id} fields={section.fields as HeroFields} />;
          case "richTextSection":
            return <RichTextSection key={section.id} fields={section.fields as RichTextFields} />;
          case "articleListSection": {
            const fields = section.fields as ArticleListFields;
            const articlesToShow = (fields.featuredArticles && fields.featuredArticles.length > 0)
              ? fields
              : { ...fields, featuredArticles: allArticles };
            return <ArticleListSection key={section.id} fields={articlesToShow} />;
          }
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
