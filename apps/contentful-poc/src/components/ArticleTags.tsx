"use client";

import { Chip } from "@sugartown/design-system";

type TagSummary = { id: string; name: string; slug: string };

export function ArticleTags({ tags }: { tags: TagSummary[] }) {
  if (tags.length === 0) return null;
  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", margin: "0.75rem 0" }}>
      {tags.map((t) => (
        <Chip key={t.id} label={t.name} href={`/tags/${t.slug}`} />
      ))}
    </div>
  );
}
