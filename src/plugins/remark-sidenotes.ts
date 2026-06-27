/**
 * remark-sidenotes — Convert GFM footnotes to Tufte-style inline sidenotes.
 *
 * remark-gfm creates footnoteDefinition / footnoteReference nodes in mdast.
 * This plugin replaces them with raw HTML: a superscript ref + inline sidenote span.
 *
 * Input (from remark-gfm):
 *   paragraph → [text, footnoteReference(1), text]
 *   footnoteDefinition(1) → paragraph → text
 *
 * Output:
 *   paragraph → [text, html("<sup class='sidenote-ref'>...
 *                <span class='sidenote'>...</span>"), text]
 */
import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';
import katex from 'katex';

export default function remarkSidenotes() {
  return (tree: Root) => {
    // 1. Collect all footnote definitions
    const defs = new Map<string, string>();

    visit(tree, 'footnoteDefinition', (node: any) => {
      // Extract text from the definition's children
      let text = '';
      const walk = (n: any) => {
        if (n.type === 'text') {
          text += n.value;
        } else if (n.type === 'inlineCode') {
          text += '<code>' + n.value + '</code>';
        } else if (n.type === 'strong') {
          text += '<strong>';
          if (n.children) n.children.forEach(walk);
          text += '</strong>';
        } else if (n.type === 'emphasis') {
          text += '<em>';
          if (n.children) n.children.forEach(walk);
          text += '</em>';
        } else if (n.type === 'delete') {
          text += '<del>';
          if (n.children) n.children.forEach(walk);
          text += '</del>';
        } else if (n.type === 'link') {
          text += '<a href="' + n.url + '">';
          if (n.children) n.children.forEach(walk);
          text += '</a>';
        } else if (n.type === 'inlineMath') {
          try {
            text += katex.renderToString(n.value, { throwOnError: false, displayMode: false });
          } catch {
            text += '$' + n.value + '$';
          }
        } else if (n.children) {
          n.children.forEach(walk);
        }
      };
      if (node.children) node.children.forEach(walk);
      defs.set(node.identifier, text.replace(/\s+/g, ' ').trim());
    });

    // 2. Remove all footnoteDefinition nodes from the tree
    visit(tree, 'footnoteDefinition', (_node: any, idx: number | null, parent: any) => {
      if (parent && idx !== null) {
        parent.children.splice(idx, 1);
      }
    });

    // 3. Replace footnoteReference with inline sidenote HTML
    visit(tree, 'footnoteReference', (node: any, idx: number | null, parent: any) => {
      const fnText = defs.get(node.identifier);
      if (!fnText || !parent || idx === null || idx === undefined) return;

      const num = node.identifier;

      const html =
        `<sup class="sidenote-ref" id="snref-${num}"><a class="sidenote-link" href="#sn-${num}" data-sn="${num}">${num}</a></sup>` +
        `<span class="sidenote" id="sn-${num}"><a class="sidenote-num" href="#snref-${num}">${num}</a> ${fnText}</span>`;

      parent.children.splice(idx, 1, { type: 'html', value: html });
    });
  };
}
