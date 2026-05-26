import Link from "next/link";
import { BLOCKS, MARKS, INLINES, type Document } from "@contentful/rich-text-types";
import {
  documentToReactComponents,
  type Options,
} from "@contentful/rich-text-react-renderer";

// Shared DS token references — mirroring PageSections.module.css token usage
const TOKEN = {
  // colours
  ruleAccent:        "var(--st-color-rule-accent)",
  bgSurface:         "var(--st-color-bg-surface)",
  bgSubtle:          "var(--st-color-bg-subtle)",
  tableHeaderBg:     "var(--st-table-header-bg-accent)",
  tableHeaderColor:  "var(--st-table-header-color-accent)",
  codeInlineBg:      "var(--st-code-inline-bg-dark-maroon)",
  codeBorder:        "var(--st-color-rule-accent)",
  textDefault:       "var(--st-color-text-default)",
  textSecondary:     "var(--st-color-text-secondary)",
  brandPrimary:      "var(--st-color-brand-primary)",
  // font shorthands (family + size + weight in one token — same as Sanity app)
  fontHeading2:      "var(--st-font-heading-2)",
  fontHeading3:      "var(--st-font-heading-3)",
  fontHeading4:      "var(--st-font-heading-4)",
  fontBody:          "var(--st-font-body)",
  // font families (for elements that need family only)
  fontNarrative:     "var(--st-font-family-narrative)",
  fontMono:          "var(--st-font-family-mono)",
  fontUi:            "var(--st-font-family-ui)",
  // weights
  weightBold:        "var(--st-font-weight-bold)",
  weightSemibold:    "var(--st-font-weight-semibold)",
  // line heights
  lineHeightTight:   "var(--st-line-height-tight)",
  lineHeightRelaxed: "var(--st-line-height-relaxed)",
  // spacing — stack rhythm
  stackXl:           "var(--st-spacing-stack-xl)",
  stackLg:           "var(--st-spacing-stack-lg)",
  stackMd:           "var(--st-spacing-stack-md)",
  stackSm:           "var(--st-spacing-stack-sm)",
  readingGap:        "var(--st-space-reading-gap)",
  // line height
  lineHeightSnug:    "var(--st-line-height-snug)",
  // spacing — legacy space refs (tables)
  space2:            "var(--st-space-2)",
  space3:            "var(--st-space-3)",
  space4:            "var(--st-space-4)",
  // borders, code, table
  borderWidth:       "var(--st-border-width)",
  radiusCode:        "var(--st-radius-code)",
  codeInlinePad:     "var(--st-code-inline-padding)",
  codeInlineSize:    "var(--st-code-inline-font-size)",
  tableHeaderSize:   "var(--st-table-header-font-size)",
  tableFontSize:     "var(--st-table-font-size)",
  letterSpacingWide: "var(--st-letter-spacing-wide)",
} as const;

const options: Options = {
  renderMark: {
    [MARKS.BOLD]: (text) => <strong>{text}</strong>,
    [MARKS.ITALIC]: (text) => <em>{text}</em>,
    [MARKS.CODE]: (text) => (
      <code style={{
        fontFamily: TOKEN.fontMono,
        background: TOKEN.codeInlineBg,
        color: TOKEN.textDefault,
        border: `${TOKEN.borderWidth} solid ${TOKEN.codeBorder}`,
        borderRadius: TOKEN.radiusCode,
        padding: TOKEN.codeInlinePad,
        fontSize: TOKEN.codeInlineSize,
      }}>
        {text}
      </code>
    ),
  },
  renderNode: {
    [BLOCKS.PARAGRAPH]: (_node, children) => (
      <p style={{
        fontFamily: TOKEN.fontUi,
        fontSize: TOKEN.fontBody,
        lineHeight: TOKEN.lineHeightRelaxed,
        color: TOKEN.textDefault,
        margin: `${TOKEN.readingGap} 0`,
      }}>
        {children}
      </p>
    ),
    [BLOCKS.HEADING_2]: (_node, children) => (
      <h2 style={{
        fontSize: TOKEN.fontHeading2,
        fontWeight: TOKEN.weightBold,
        color: TOKEN.brandPrimary,
        lineHeight: TOKEN.lineHeightTight,
        margin: `${TOKEN.stackXl} 0 ${TOKEN.stackMd}`,
      }}>
        {children}
      </h2>
    ),
    [BLOCKS.HEADING_3]: (_node, children) => (
      <h3 style={{
        fontSize: TOKEN.fontHeading3,
        fontWeight: TOKEN.weightSemibold,
        color: TOKEN.textDefault,
        lineHeight: TOKEN.lineHeightSnug,
        margin: `${TOKEN.stackLg} 0 ${TOKEN.stackSm}`,
      }}>
        {children}
      </h3>
    ),
    [BLOCKS.HEADING_4]: (_node, children) => (
      <h4 style={{
        fontSize: TOKEN.fontHeading4,
        fontWeight: TOKEN.weightSemibold,
        color: TOKEN.textDefault,
        lineHeight: TOKEN.lineHeightSnug,
        margin: `${TOKEN.stackMd} 0 ${TOKEN.stackSm}`,
      }}>
        {children}
      </h4>
    ),
    [BLOCKS.UL_LIST]: (_node, children) => <ul>{children}</ul>,
    [BLOCKS.OL_LIST]: (_node, children) => <ol>{children}</ol>,
    [BLOCKS.LIST_ITEM]: (_node, children) => <li>{children}</li>,
    [BLOCKS.HR]: () => (
      <hr style={{ border: 0, borderTop: `${TOKEN.borderWidth} solid ${TOKEN.ruleAccent}`, margin: `${TOKEN.space4} 0` }} />
    ),

    // Tables — Contentful rich text outputs TABLE > TABLE_ROW > TABLE_CELL/TABLE_HEADER_CELL
    [BLOCKS.TABLE]: (_node, children) => (
      <div style={{ overflowX: "auto", margin: `0 0 ${TOKEN.space4}` }}>
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: TOKEN.fontUi,
          fontSize: TOKEN.tableFontSize,
        }}>
          <tbody>{children}</tbody>
        </table>
      </div>
    ),
    [BLOCKS.TABLE_ROW]: (_node, children) => <tr>{children}</tr>,
    [BLOCKS.TABLE_CELL]: (_node, children) => (
      <td style={{
        border: `${TOKEN.borderWidth} solid ${TOKEN.ruleAccent}`,
        padding: `${TOKEN.space2} ${TOKEN.space3}`,
        verticalAlign: "top",
        color: TOKEN.textDefault,
      }}>
        {children}
      </td>
    ),
    [BLOCKS.TABLE_HEADER_CELL]: (_node, children) => (
      <th style={{
        border: `${TOKEN.borderWidth} solid ${TOKEN.ruleAccent}`,
        padding: `${TOKEN.space2} ${TOKEN.space3}`,
        background: TOKEN.tableHeaderBg,
        color: TOKEN.tableHeaderColor,
        fontFamily: TOKEN.fontMono,
        textTransform: "uppercase",
        fontSize: TOKEN.tableHeaderSize,
        letterSpacing: TOKEN.letterSpacingWide,
        textAlign: "left",
        verticalAlign: "top",
      }}>
        {children}
      </th>
    ),

    [INLINES.HYPERLINK]: (node, children) => {
      const url = node.data.uri as string;
      return url.startsWith("/") ? (
        <Link href={url}>{children}</Link>
      ) : (
        <a href={url} target="_blank" rel="noopener noreferrer">{children}</a>
      );
    },
  },
};

export function renderRichText(document: Document) {
  return documentToReactComponents(document, options);
}
