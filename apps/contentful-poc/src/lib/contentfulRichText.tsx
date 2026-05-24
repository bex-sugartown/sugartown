import Link from "next/link";
import { BLOCKS, MARKS, INLINES, type Document } from "@contentful/rich-text-types";
import {
  documentToReactComponents,
  type Options,
} from "@contentful/rich-text-react-renderer";

const options: Options = {
  renderMark: {
    [MARKS.BOLD]: (text) => <strong>{text}</strong>,
    [MARKS.ITALIC]: (text) => <em>{text}</em>,
  },
  renderNode: {
    [BLOCKS.PARAGRAPH]: (_node, children) => <p>{children}</p>,
    [BLOCKS.HEADING_2]: (_node, children) => <h2>{children}</h2>,
    [BLOCKS.HEADING_3]: (_node, children) => <h3>{children}</h3>,
    [BLOCKS.UL_LIST]: (_node, children) => <ul>{children}</ul>,
    [BLOCKS.OL_LIST]: (_node, children) => <ol>{children}</ol>,
    [BLOCKS.LIST_ITEM]: (_node, children) => <li>{children}</li>,
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
