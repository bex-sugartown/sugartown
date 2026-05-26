export const dynamic = 'force-dynamic';

import { getPageBySlug, getAllArticles, serializeSections } from "@/lib/queries";
import { SectionList } from "@/components/SectionList";
import { ArticleList } from "@/components/ArticleList";

export default async function Home() {
  const [homePage, allArticles] = await Promise.all([
    getPageBySlug("home"),
    getAllArticles(),
  ]);

  const sections = homePage
    ? serializeSections((homePage.fields.sections ?? []) as unknown[])
    : [];

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
      {sections.length > 0 && <SectionList sections={sections} allArticles={articles} />}
      {!hasArticleListSection && <ArticleList articles={articles} />}
    </main>
  );
}
