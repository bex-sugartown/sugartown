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
  return (
    <main style={{ padding: "2rem", maxWidth: "1080px", margin: "0 auto" }}>
      <h1 style={{ fontFamily: "var(--st-font-family-narrative)", marginBottom: "1.5rem" }}>
        Articles
      </h1>
      <div style={{ display: "grid", gap: "1.5rem" }}>
        {articles.map((a) => (
          <Link key={a.id} href={`/articles/${a.slug}`} style={{ textDecoration: "none" }}>
            <Card
              title={a.title}
              eyebrow={a.publishDate ? new Date(a.publishDate).toLocaleDateString() : undefined}
              excerpt={a.summary}
            />
          </Link>
        ))}
      </div>
    </main>
  );
}
