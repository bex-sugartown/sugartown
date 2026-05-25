import { notFound } from "next/navigation";
import type { Entry } from "contentful";
import { getPageBySlug } from "@/lib/queries";
import { SectionList } from "@/components/SectionList";
import type { HeroSectionSkeleton, RichTextSectionSkeleton } from "@/lib/queries";

type SectionEntry = Entry<
  HeroSectionSkeleton | RichTextSectionSkeleton,
  "WITHOUT_UNRESOLVABLE_LINKS",
  string
>;

export default async function PageRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) notFound();

  const sections = ((page.fields.sections ?? []) as SectionEntry[]).map((s) => ({
    id: s.sys.id,
    contentTypeId: s.sys.contentType.sys.id,
    fields: s.fields,
  }));

  return (
    <main>
      <SectionList sections={sections} />
    </main>
  );
}
