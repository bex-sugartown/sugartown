/**
 * getSidebarRowStart — shared `--sidebar-row` computation for `.detailPage` templates.
 *
 * In the two-column detail grid, PageSidebar is pinned to column 2 and must begin
 * at the same grid row as the first PageSections block — i.e. immediately after all
 * full-span blocks (MetadataCard, challenge, lead stat cards, page eyebrow) that each
 * occupy their own row above the two-column split. The grid is 1-indexed, so the
 * sidebar starts one row past the count of full-span rows preceding it.
 *
 * Adopted by CaseStudyPage (MetadataCard + optional challenge + lead stat cards) and
 * RootPage (optional eyebrow). Each page previously inlined its own formula with a
 * different shape — real drift closed by SUG-207.
 *
 * @param {number} precedingFullSpanRows — count of full-span rows above the split
 * @returns {number} the 1-indexed grid row the sidebar should start at
 */
export function getSidebarRowStart(precedingFullSpanRows) {
  return precedingFullSpanRows + 1
}
