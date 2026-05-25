import Link from "next/link";
import { BLOCKS, MARKS, INLINES, type Document } from "@contentful/rich-text-types";
import {
  documentToReactComponents,
  type Options,
} from "@contentful/rich-text-react-renderer";

// Shared DS token references used across multiple nodes
const TOKEN = {
  ruleAccent: "var(--st-color-rule-accent)",
  bgSurface: "var(--st-color-bg-surface)",
  bgSubtle: "var(--st-color-bg-subtle)",
  bgElevated: "var(--st-color-bg-elevated)",
  codeInlineBg: "var(--st-code-inline-bg-dark-maroon)",
  codeBorder: "var(--st-color-rule-accent)",
  textDefault: "var(--st-color-text-default)",
  textEyebrow: "var(--st-color-text-eyebrow)",
  fontMono: "var(--st-font-family-mono)",
  fontUi: "var(--st-font-family-ui)",
  space2: "var(--st-space-2)",
  space3: "var(--st-space-3)",
  space4: "var(--st-space-4)",
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
        border: `1px solid ${TOKEN.codeBorder}`,
        borderRadius: "3px",
        padding: "0.1em 0.35em",
        fontSize: "0.9em",
      }}>
        {text}
      </code>
    ),
  },
  renderNode: {
    [BLOCKS.PARAGRAPH]: (_node, children) => <p>{children}</p>,
    [BLOCKS.HEADING_2]: (_node, children) => <h2>{children}</h2>,
    [BLOCKS.HEADING_3]: (_node, children) => <h3>{children}</h3>,
    [BLOCKS.HEADING_4]: (_node, children) => <h4>{children}</h4>,
    [BLOCKS.UL_LIST]: (_node, children) => <ul>{children}</ul>,
    [BLOCKS.OL_LIST]: (_node, children) => <ol>{children}</ol>,
    [BLOCKS.LIST_ITEM]: (_node, children) => <li>{children}</li>,
    [BLOCKS.HR]: () => (
      <hr style={{ border: 0, borderTop: `1px solid ${TOKEN.ruleAccent}`, margin: `${TOKEN.space4} 0` }} />
    ),

    // Code blocks — BLOCKS.CODE is a fenced code block, MARKS.CODE is inline
    [BLOCKS.CODE]: (_node, children) => (
      <pre style={{
        fontFamily: TOKEN.fontMono,
        background: TOKEN.codeInlineBg,
        color: TOKEN.textDefault,
        border: `1px solid ${TOKEN.codeBorder}`,
        borderRadius: "3px",
        padding: TOKEN.space3,
        overflowX: "auto",
        fontSize: "0.9em",
        lineHeight: 1.5,
        margin: `0 0 ${TOKEN.space4}`,
      }}>
        <code style={{ fontFamily: "inherit" }}>{children}</code>
      </pre>
    ),

    // Tables — Contentful rich text outputs TABLE > TABLE_ROW > TABLE_CELL/TABLE_HEADER_CELL
    [BLOCKS.TABLE]: (_node, children) => (
      <div style={{ overflowX: "auto", margin: `0 0 ${TOKEN.space4}` }}>
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: TOKEN.fontUi,
          fontSize: "0.95em",
        }}>
          <tbody>{children}</tbody>
        </table>
      </div>
    ),
    [BLOCKS.TABLE_ROW]: (_node, children) => <tr>{children}</tr>,
    [BLOCKS.TABLE_CELL]: (_node, children) => (
      <td style={{
        border: `1px solid ${TOKEN.ruleAccent}`,
        padding: `${TOKEN.space2} ${TOKEN.space3}`,
        verticalAlign: "top",
        color: TOKEN.textDefault,
      }}>
        {children}
      </td>
    ),
    [BLOCKS.TABLE_HEADER_CELL]: (_node, children) => (
      <th style={{
        border: `1px solid ${TOKEN.ruleAccent}`,
        padding: `${TOKEN.space2} ${TOKEN.space3}`,
        background: TOKEN.bgElevated,
        fontFamily: TOKEN.fontMono,
        color: TOKEN.textEyebrow,
        textTransform: "uppercase",
        fontSize: "0.8em",
        letterSpacing: "0.05em",
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
