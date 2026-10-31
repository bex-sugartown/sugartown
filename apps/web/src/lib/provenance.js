/**
 * provenance — image URL choice for AI-generated images (ST-178).
 *
 * The Sanity image CDN strips embedded metadata, so a flagged image that has stamped copies is
 * served from them (file assets, served as-is). Everything else keeps the normal Sanity URL.
 */
import { urlFor } from './sanity'

// ST-178: GROQ fragment for the stamped copies of an image. Spliced into every projection that
// carries aiGenerated (queries.js, seo.js). One definition, so the shape cannot drift.
export const AI_PROVENANCE_PROJECTION = `"provenance": provenanceFiles[] { width, "url": file.asset->url }`

/** The stamped copies of a flagged image, widest last, or null. */
export function stampedCopies(image) {
  if (!image?.aiGenerated || !image.provenance?.length) return null
  return [...image.provenance].sort((a, b) => a.width - b.width)
}

/** URL for an image at about `width` px: the smallest stamped copy that is wide enough, else the Sanity URL. */
export function imageUrlFor(image, width) {
  const copies = stampedCopies(image)
  if (copies) return (copies.find((c) => c.width >= width) ?? copies[copies.length - 1]).url
  return urlFor(image.asset).width(width).quality(90).url()
}

/**
 * ST-181: URL for a social share image (og:image). A flagged share image with a stamped copy is
 * served from it, because the Sanity image CDN would strip the metadata and the baked mark.
 * Returns null when there is no stamped copy; the caller keeps its normal URL.
 */
export function shareImageUrl(image) {
  const copies = stampedCopies(image)
  return copies ? copies[copies.length - 1].url : null
}

// ST-183: the AI wording for the MediaLabel lives here, not in the design system. The tool list is
// also in scripts/ai-provenance/label-spec.json and the Studio dropdown; test_stamp.py fails if
// the three disagree.
const TOOL_NAMES = {
  chatgpt: 'ChatGPT',
  claude: 'Claude',
  'claude-code': 'Claude Code',
  gemini: 'Gemini',
  'adobe-firefly': 'Adobe Firefly',
  'photoshop-generative-fill': 'Photoshop Generative Fill',
  'canva-ai': 'Canva AI',
  'microsoft-copilot': 'Microsoft Copilot',
  'stable-diffusion': 'Stable Diffusion',
  // Legacy values (no longer in the Studio list) still display.
  'dall-e': 'DALL-E',
  midjourney: 'Midjourney',
}

/** Display name for an `aiTool` value, or undefined ('other' and unknown values show no name). */
export function toolLabel(aiTool) {
  return aiTool ? TOOL_NAMES[aiTool] : undefined
}

/**
 * MediaLabel props for an image flagged AI-generated, or undefined when it is not flagged.
 * Pass `{ interactive: false }` where the image sits inside a link (cards).
 */
export function aiLabelProps(image, { interactive = true } = {}) {
  if (!image?.aiGenerated) return undefined
  const tool = interactive ? toolLabel(image.aiTool) : undefined
  return {
    short: 'AI',
    full: 'AI-generated',
    detail: tool,
    ariaLabel: tool ? `AI-generated image, ${tool}` : 'AI-generated image',
    interactive,
  }
}

/** Media props for an image: the AI label and, for flagged images only, its stamped copies. */
export function aiMediaProps(image) {
  const label = aiLabelProps(image)
  return { label, provenance: label ? image.provenance : undefined }
}
