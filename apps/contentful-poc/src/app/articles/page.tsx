export const dynamic = 'force-dynamic';

import { getPageBySlug, getAllArticles, serializeSections } from "@/lib/queries";
import { SectionList } from "@/components/SectionList";
import { ArticleList } from "@/components/ArticleList";

export default async function ArticlesPage() {
  const [articlesPage, allArticles] = await Promise.all([
    getPageBySlug("articles"),
    getAllArticles(),
  ]);

  const sections = articlesPage
    ? serializeSections((articlesPage.fields.sections ?? []) as unknown[])
    : [];

  // If an articleListSection is present in the CMS page, it controls the list
  // (order and curation). Fall back to all articles sorted by date otherwise.
  const hasArticleListSection = sections.some(
    (s) => s.contentTypeId === "articleListSection"
  );

  const articles = allArticles.map((a) => ({
    id: a.sys.id,
    title: a.fields.title,
    slug: a.fields.slug,
    summary: a.fields.summary ?? "",
    publishDate: a.fields.publishDate ?? "",
  }));

  return (
    <main>
      {sections.length > 0 && <SectionList sections={sections} />}
      {!hasArticleListSection && <ArticleList articles={articles} />}
    </main>
  );
}
