import { notFound } from "next/navigation";
import Link from "next/link";
import type { Entry } from "contentful";
import { getArticleBySlug } from "@/lib/queries";
import type { TagSkeleton, HeroSectionSkeleton, RichTextSectionSkeleton } from "@/lib/queries";
import { ArticleTags } from "@/components/ArticleTags";
import { SectionList } from "@/components/SectionList";
import styles from "./article.module.css";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const { title, summary, publishDate, tags, sections } = article.fields;

  const resolvedTags = (tags ?? [])
    .filter(
      (t): t is Entry<TagSkeleton, "WITHOUT_UNRESOLVABLE_LINKS", string> =>
        !!(t as Entry<TagSkeleton, "WITHOUT_UNRESOLVABLE_LINKS", string>).fields
    )
    .map((t) => ({ id: t.sys.id, name: t.fields.name, slug: t.fields.slug }));

  type SectionEntry = Entry<HeroSectionSkeleton | RichTextSectionSkeleton, "WITHOUT_UNRESOLVABLE_LINKS", string>;
  const resolvedSections = ((sections ?? []) as SectionEntry[])
    .filter((s) => !!s.sys?.contentType)
    .map((s) => ({ id: s.sys.id, contentTypeId: s.sys.contentType.sys.id, fields: s.fields }));

  return (
    <main style={{ padding: "2rem", maxWidth: "760px", margin: "0 auto" }}>
      <Link
        href="/"
        style={{
          fontSize: "var(--st-font-size-label)",
          color: "var(--st-color-text-secondary)",
          textDecoration: "none",
        }}
      >
        ← All articles
      </Link>
      <article className={styles.prose}>
        <h1 className={styles.title}>{title}</h1>
        {publishDate ? (
          <p className={styles.eyebrow}>{new Date(publishDate).toLocaleDateString()}</p>
        ) : null}
        {summary ? <p className={styles.summary}>{summary}</p> : null}
        <ArticleTags tags={resolvedTags} />
        {resolvedSections.length > 0 ? <SectionList sections={resolvedSections} /> : null}
      </article>
    </main>
  );
}
