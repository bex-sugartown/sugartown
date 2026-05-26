export const dynamic = 'force-dynamic';

import { getPageBySlug, serializeSections } from "@/lib/queries";
import { SectionList } from "@/components/SectionList";

export default async function Home() {
  const homePage = await getPageBySlug("home");
  const sections = homePage
    ? serializeSections((homePage.fields.sections ?? []) as unknown[])
    : [];

  return (
    <main>
      {sections.length > 0 && <SectionList sections={sections} />}
    </main>
  );
}
