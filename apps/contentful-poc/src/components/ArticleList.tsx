"use client";

import Link from "next/link";
import { Card } from "@sugartown/design-system";

type ArticleSummary = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  publishDate: string;
};

export function ArticleList({ articles }: { articles: ArticleSummary[] }) {
  const sorted = [...articles].sort((a, b) =>
    new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  );

  return (
    <section style={{
      maxWidth: "var(--st-width-detail)",
      margin: "0 auto",
      padding: "var(--st-space-section-break) var(--st-page-gutter)",
    }}>
      <h2 style={{
        font: "var(--st-font-heading-2)",
        fontWeight: "var(--st-font-weight-bold)",
        color: "var(--st-color-brand-primary)",
        lineHeight: "var(--st-line-height-tight)",
        margin: "0 0 var(--st-spacing-stack-lg)",
      }}>
        Articles
      </h2>
      <div style={{ display: "grid", gap: "var(--st-space-card-gap)" }}>
        {sorted.map((a) => (
          <Link key={a.id} href={`/articles/${a.slug}`} style={{ textDecoration: "none" }}>
            <Card
              title={a.title}
              eyebrow={a.publishDate ? new Date(a.publishDate).toLocaleDateString() : undefined}
              excerpt={a.summary}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
