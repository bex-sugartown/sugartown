import { notFound } from "next/navigation";
import type { Document } from "@contentful/rich-text-types";
import { getArticleBySlug } from "@/lib/queries";
import { renderRichText } from "@/lib/contentfulRichText";
import styles from "./article.module.css";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const { title, summary, publishDate, body } = article.fields;
  return (
    <main style={{ padding: "2rem", maxWidth: "760px", margin: "0 auto" }}>
      <article className={styles.prose}>
        <h1 className={styles.title}>{title}</h1>
        {publishDate ? (
          <p className={styles.eyebrow}>
            {new Date(publishDate).toLocaleDateString()}
          </p>
        ) : null}
        {summary ? <p className={styles.summary}>{summary}</p> : null}
        {body ? renderRichText(body as Document) : null}
      </article>
    </main>
  );
}
