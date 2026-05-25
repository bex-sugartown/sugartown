import { notFound } from "next/navigation";
import { getTagBySlug, getArticlesByTag } from "@/lib/queries";
import { ArticleList } from "@/components/ArticleList";

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  if (!tag) notFound();

  const articles = await getArticlesByTag(tag.sys.id);

  return (
    <main style={{ padding: "2rem", maxWidth: "1080px", margin: "0 auto" }}>
      <h1 style={{ fontFamily: "var(--st-font-family-narrative)", margin: "1rem 0 1.5rem" }}>
        {tag.fields.name}
      </h1>
      {articles.length === 0 ? (
        <p style={{ color: "var(--st-color-text-secondary)" }}>No articles tagged with this yet.</p>
      ) : (
        <ArticleList
          articles={articles.map((a) => ({
            id: a.sys.id,
            title: a.fields.title,
            slug: a.fields.slug,
            summary: a.fields.summary ?? "",
            publishDate: a.fields.publishDate ?? "",
          }))}
        />
      )}
    </main>
  );
}
