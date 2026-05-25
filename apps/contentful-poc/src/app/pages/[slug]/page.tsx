import { notFound } from "next/navigation";
import { getPageBySlug, serializeSections } from "@/lib/queries";
import { SectionList } from "@/components/SectionList";

export default async function PageRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) notFound();

  const sections = serializeSections((page.fields.sections ?? []) as unknown[]);

  return (
    <main>
      <SectionList sections={sections} />
    </main>
  );
}
