"use client";

import Link from "next/link";
import { Chip } from "@sugartown/design-system";

type TagSummary = { id: string; name: string; slug: string };

export function TagList({ tags }: { tags: TagSummary[] }) {
  return (
    <main style={{ padding: "2rem", maxWidth: "1080px", margin: "0 auto" }}>
      <h1 style={{ fontFamily: "var(--st-font-family-narrative)", marginBottom: "1.5rem" }}>
        Tags
      </h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
        {tags.map((t) => (
          <Link key={t.id} href={`/tags/${t.slug}`} style={{ textDecoration: "none" }}>
            <Chip label={t.name} />
          </Link>
        ))}
      </div>
    </main>
  );
}
