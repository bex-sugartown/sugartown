import { getAllArticles } from "@/lib/queries";
import { ArticleList } from "@/components/ArticleList";

export default async function Home() {
  const articles = (await getAllArticles()).map((a) => ({
    id: a.sys.id,
    title: a.fields.title,
    slug: a.fields.slug,
    summary: a.fields.summary ?? "",
    publishDate: a.fields.publishDate ?? "",
  }));
  return <ArticleList articles={articles} />;
}
