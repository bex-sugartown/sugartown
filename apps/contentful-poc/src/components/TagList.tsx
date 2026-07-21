"use client";

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
          <Chip key={t.id} label={t.name} href={`/tags/${t.slug}`} />
        ))}
      </div>
    </main>
  );
}
