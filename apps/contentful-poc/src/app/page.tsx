import { getAllArticles, getPageBySlug } from "@/lib/queries";
import { ArticleList } from "@/components/ArticleList";
import { SectionList } from "@/components/SectionList";
import type { Entry } from "contentful";
import type { HeroSectionSkeleton, RichTextSectionSkeleton } from "@/lib/queries";

type SectionEntry = Entry<HeroSectionSkeleton | RichTextSectionSkeleton, "WITHOUT_UNRESOLVABLE_LINKS", string>;

export default async function Home() {
  const [homePage, allArticles] = await Promise.all([
    getPageBySlug("home"),
    getAllArticles(),
  ]);

  const sections = homePage
    ? ((homePage.fields.sections ?? []) as SectionEntry[])
        .filter((s) => !!s.sys?.contentType)
        .map((s) => ({ id: s.sys.id, contentTypeId: s.sys.contentType.sys.id, fields: s.fields }))
    : [];

  const articles = allArticles.map((a) => ({
    id: a.sys.id,
    title: a.fields.title,
    slug: a.fields.slug,
    summary: a.fields.summary ?? "",
    publishDate: a.fields.publishDate ?? "",
  }));

  return (
    <>
      {sections.length > 0 && <SectionList sections={sections} />}
      <ArticleList articles={articles} />
    </>
  );
}
