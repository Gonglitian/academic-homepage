/**
 * rehype-heading-en — Wrap ASCII runs inside headings with <span class="heading-en">
 * so Latin text renders in et-book italic (Tufte style) while CJK stays upright.
 * Build-time port of the Tufted template's format-headings.js (no FOUC, SSR-safe).
 */
import type { Root, Element, Text } from 'hast';
import { visit } from 'unist-util-visit';

const HEADINGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
const isAscii = (ch: string) => ch.charCodeAt(0) <= 0x7f;

function splitAsciiRuns(value: string): Array<Text | Element> {
  const out: Array<Text | Element> = [];
  let i = 0;
  while (i < value.length) {
    const start = i;
    const ascii = isAscii(value[i]);
    while (i < value.length && isAscii(value[i]) === ascii) i++;
    const chunk = value.slice(start, i);
    if (ascii && /\S/.test(chunk)) {
      out.push({
        type: 'element',
        tagName: 'span',
        properties: { className: ['heading-en'] },
        children: [{ type: 'text', value: chunk }],
      });
    } else {
      out.push({ type: 'text', value: chunk });
    }
  }
  return out;
}

export default function rehypeHeadingEn() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (!HEADINGS.has(node.tagName)) return;

      const newChildren: Array<Text | Element> = [];
      for (const child of node.children) {
        if (child.type === 'text' && /[\x00-\x7f]/.test(child.value)) {
          newChildren.push(...splitAsciiRuns(child.value));
        } else if (
          child.type === 'element' &&
          (child.tagName === 'a' || child.tagName === 'code')
        ) {
          // descend one level into links/code inside headings
          const inner: Array<Text | Element> = [];
          for (const c of child.children) {
            if (c.type === 'text' && /[\x00-\x7f]/.test(c.value)) inner.push(...splitAsciiRuns(c.value));
            else inner.push(c as Text | Element);
          }
          child.children = inner as any;
          newChildren.push(child);
        } else {
          newChildren.push(child as Text | Element);
        }
      }
      node.children = newChildren as any;
    });
  };
}
