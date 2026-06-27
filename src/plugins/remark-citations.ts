/**
 * remark-citations — numbered `[1]` citations + an auto-generated Bibliography,
 * mirroring the Tufted-Blog-Template (Typst) numbered-reference style.
 *
 * Authoring:
 *   - Define references in the post frontmatter:
 *       references:
 *         - id: degroot2012
 *           text: "M. H. DeGroot ..., *Probability and Statistics*, 4th ed. Pearson, 2012."
 *   - Cite in the body with `[@id]`, or several with `[@id1; @id2]`.
 *
 * Output:
 *   - in-text:  <span class="cite-group">[<a class="cite" href="#ref-id"><span class="cite-num">N</span></a>]</span>
 *   - end:      <section role="doc-bibliography" class="bibliography"><h2>Bibliography</h2>
 *                 <ul><li id="ref-id"><span class="prefix"><a class="cite" role="doc-backlink" href="#cite-id">[<span class="cite-num">N</span>]</a></span> text</li>…</ul></section>
 *
 * Numbers follow the order references are declared in frontmatter (matches the reference image).
 */
import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';

// Minimal inline-markdown → HTML for reference strings (links, bold, italic).
function inlineMd(s: string): string {
  return s
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

export default function remarkCitations() {
  return (tree: Root, file: any) => {
    const fm = file?.data?.astro?.frontmatter ?? {};
    const refs: Array<{ id: string; text: string }> = fm.references ?? [];
    if (!Array.isArray(refs) || refs.length === 0) return;

    const num = new Map<string, number>();
    refs.forEach((r, i) => num.set(r.id, i + 1));
    const cited = new Set<string>(); // first in-text appearance owns the backlink anchor

    // 1. Replace [@id] / [@id1; @id2] inside text nodes.
    const CITE = /\[@([^\]]+)\]/g;
    visit(tree, 'text', (node: any, idx: number | null, parent: any) => {
      if (parent == null || idx == null) return;
      const value: string = node.value;
      if (!value.includes('[@')) return;

      const out: any[] = [];
      let last = 0;
      let m: RegExpExecArray | null;
      CITE.lastIndex = 0;
      while ((m = CITE.exec(value)) !== null) {
        if (m.index > last) out.push({ type: 'text', value: value.slice(last, m.index) });
        const keys = m[1].split(/[;,]/).map((s) => s.trim().replace(/^@/, '')).filter(Boolean);
        const inner = keys
          .map((k) => {
            const n = num.get(k);
            if (!n) return k; // unknown key → leave raw so it's noticed
            const first = !cited.has(k);
            cited.add(k);
            const anchor = first ? ` id="cite-${k}"` : '';
            return `<a class="cite" href="#ref-${k}"${anchor}><span class="cite-num">${n}</span></a>`;
          })
          .join('<span class="cite-sep">, </span>');
        out.push({ type: 'html', value: `<span class="cite-group">[${inner}]</span>` });
        last = m.index + m[0].length;
      }
      if (last < value.length) out.push({ type: 'text', value: value.slice(last) });
      if (out.length) parent.children.splice(idx, 1, ...out);
    });

    // 2. Append the Bibliography section (lists every declared reference).
    const items = refs
      .map((r) => {
        const n = num.get(r.id)!;
        const back = cited.has(r.id) ? ` href="#cite-${r.id}"` : '';
        const prefix = `<span class="prefix"><a class="cite" role="doc-backlink"${back}>[<span class="cite-num">${n}</span>]</a></span>`;
        return `<li id="ref-${r.id}">${prefix} ${inlineMd(r.text)}</li>`;
      })
      .join('\n');

    const html =
      `<section role="doc-bibliography" class="bibliography">\n` +
      `<h2>Bibliography</h2>\n` +
      `<ul style="list-style:none">\n${items}\n</ul>\n` +
      `</section>`;
    tree.children.push({ type: 'html', value: html } as any);
  };
}
