/**
 * portableTextComponents — shared PortableText serializer config.
 *
 * Provides consistent mark and block-type rendering across all pages
 * that use <PortableText> directly (ArticlePage, NodePage, PersonProfilePage).
 *
 * Page-specific type handlers (e.g. richImage in ArticlePage) can be merged
 * via spread: { ...portableTextComponents, types: { ...portableTextComponents.types, richImage: … } }
 */
import { InlineCode } from '../design-system'

const portableTextComponents = {
  marks: {
    code: ({ children }) => <InlineCode>{children}</InlineCode>,
  },
}

export default portableTextComponents
