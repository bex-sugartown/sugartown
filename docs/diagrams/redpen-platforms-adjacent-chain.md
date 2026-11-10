# Red-pen review: "How I learned it" journey diagram

**Target document:** `article` slug `platforms-are-adjacent-keyword-filter` (Sanity draft, issue #220)
**Diagram source:** `diagram-platforms-adjacent-chain.mmd`
**Date:** 2026-11-10 (v4, two journeys with discipline labels on the image journey)
**Surface:** a `mermaidSection` in the article. It renders from text, not an uploaded image, so `pnpm validate:diagram-assets` does not apply and the bottom-left-corner rule (image labels) does not apply.

Classes: **enforced-by-code**, **measured**, **convention**, **roadmap** (CLAUDE.md §Technical diagram red-pen gate). Vendor-documentation claims are classed **measured**: the record is the page URL and the fetch date in this table. Claims about Bex's own learning path are classed **convention** with the source "Bex, stated 2026-11-10".

## Claim table

| Diagram element | Evidence | Class |
|---|---|---|
| Stop 1, Photoshop: sizes (with suffixes) | https://helpx.adobe.com/photoshop/desktop/save-and-export/export-files-to-different-formats/export-settings-and-export-location-preferences.html, "Scale All" table (Size, Suffix). Read 2026-11-10 | measured |
| Stop 1, Photoshop: formats | Same page, "File Settings" (PNG, JPG, GIF, SVG) | measured |
| Stop 1, Photoshop: colour space | Same page, "Additional options" > Color Space (sRGB conversion, option to embed the profile) | measured |
| Stop 1, Photoshop: metadata | Same page, "Additional options" > Metadata (limited: copyright and contact) | measured |
| Stop 2, Web design: responsive sizes | https://cloudinary.com/documentation/image_optimization, "Deliver responsive sizes". Read 2026-11-10 | measured |
| Stop 2, Web design: right format, compression | https://cloudinary.com/documentation/image_optimization, "Add q_auto and f_auto to every delivery URL" | measured |
| Stop 3, DAM: renditions | AEM Assets processing profiles: https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/assets/manage/asset-microservices-configure-and-use, "The default processing profile". Cloudinary URL transformations: https://cloudinary.com/documentation/image_transformations, "Overview" | measured |
| Stop 3, DAM: metadata schema | AEM Assets schema editor: https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/assets/manage/manage-metadata. Acquia DAM (Widen) metadata types: https://docs.acquia.com/acquia-dam/how-do-i-create-edit-or-remove-metadata-fields, "Create metadata fields" | measured |
| Stop 3, DAM: required fields | https://docs.acquia.com/acquia-dam/how-do-i-create-edit-or-remove-metadata-fields, "Configure field settings". Caveat: enforced at upload only when the site-wide mandatory-metadata setting is on | measured |
| Journey 1 stop labels: Photoshop = design, Web design = layout in code, DAM = data (the discipline each stop is) | Bex, stated 2026-11-10. A description of the discipline, not a product claim | convention |
| Journey 2, stop 1, CMS: content model, fields, taxonomy, publishing workflow | Bex's experience, stated 2026-11-10. Generic description of a CMS; no vendor documentation read and no CMS product is claimed | convention |
| Journey 2, stop 2, E-learning: same structure and metadata, plus user tracking and workflows | Bex's experience, stated 2026-11-10 (correction: e-learning sits on the CMS journey, not the DAM journey). No vendor documentation read; no e-learning platform is named | convention |
| Journey 1, arrow 1: a lot ported, gaps filled by study | Bex, stated 2026-11-10 (her own learning path) | convention |
| Journey 1, arrow 2: the same images, at scale | Bex, stated 2026-11-10 | convention |
| Journey 2, arrow: the same habits, plus learners (the new dimension) | Bex, stated 2026-11-10 | convention |
| Article prose: Bex has worked in Celum, Widen (now Acquia DAM), Cloudinary and AEM Assets | Bex, stated 2026-11-10. Celum documentation sits behind a login and was not read, so the diagram makes no Celum feature claim | convention |
| "Widen" is now Acquia DAM | https://docs.acquia.com/acquia-dam, product name in the documentation | convention |

## Cut or not claimed

| Claim considered | Why it is not in the diagram |
|---|---|
| Asset expiry dates in Acquia DAM | Not found on any official Acquia page read 2026-11-10 |
| Photoshop File Info writes IPTC/XMP into the saved file | Not verified |
| Celum metadata and renditions | Documentation behind a login |
| Metadata read from the file (XMP, IPTC, Exif) on AEM and Acquia | Sourced in v1, dropped from the journey version to keep four stops. Sources: manage-metadata page (AEM), https://docs.acquia.com/md/acquia-dam/what-are-metadata-fields (Acquia) |

## Replaced

v1 (2026-11-10) drew ten boxes in three lanes (image production, web delivery, DAM operations), each sourced to the pages above. The journey version replaces it because the point of the section is the order in which the skills were learned, not a feature map. The v1 source is in this file's git history only if it is committed; it is not committed as of this edit.

v2 (2026-11-10) drew one four-stop chain (Photoshop, Web design, DAM, E-learning). v3 replaces it: e-learning is on a second journey that starts at the CMS, not on the DAM journey, so the diagram shows two journeys side by side, images on the left and content on the right.

## Roadmap items

None drawn.
