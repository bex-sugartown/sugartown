import { getAllTags } from "@/lib/queries";
import { TagList } from "@/components/TagList";

export default async function TagsArchivePage() {
  const tags = await getAllTags();
  return (
    <TagList
      tags={tags.map((t) => ({ id: t.sys.id, name: t.fields.name, slug: t.fields.slug }))}
    />
  );
}
