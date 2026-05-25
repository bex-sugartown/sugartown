"use client";

import Link from "next/link";
import { Chip } from "@sugartown/design-system";

type TagSummary = { id: string; name: string; slug: string };

export function ArticleTags({ tags }: { tags: TagSummary[] }) {
  if (tags.length === 0) return null;
  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", margin: "0.75rem 0" }}>
      {tags.map((t) => (
        <Link key={t.id} href={`/tags/${t.slug}`} style={{ textDecoration: "none" }}>
          <Chip label={t.name} />
        </Link>
      ))}
    </div>
  );
}
