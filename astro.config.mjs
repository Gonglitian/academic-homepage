import { defineConfig } from 'astro/config';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import remarkSidenotes from './src/plugins/remark-sidenotes.ts';
import remarkCitations from './src/plugins/remark-citations.ts';
import rehypeKatex from 'rehype-katex';
import rehypeHeadingEn from './src/plugins/rehype-heading-en.ts';

export default defineConfig({
  site: 'https://litiangong.com',
  markdown: {
    remarkPlugins: [remarkGfm, remarkMath, remarkSidenotes, remarkCitations],
    rehypePlugins: [rehypeHeadingEn, rehypeKatex],
    shikiConfig: {
      // Light theme by default (matches the Tufte cream page + reference image);
      // dark theme swapped in via CSS under html.dark (see global.css).
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
  prefetch: {
    defaultStrategy: 'hover',
  },
});
