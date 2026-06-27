/* Adds a hover "copy" icon button to every <pre> code block in blog articles. */
(() => {
  const COPY_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  const CHECK_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';

  function init() {
    const blocks = document.querySelectorAll('article.blog-post pre');
    blocks.forEach((pre) => {
      if (pre.querySelector('.code-copy-btn')) return;
      const btn = document.createElement('button');
      btn.className = 'code-copy-btn';
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Copy code');
      btn.innerHTML = COPY_ICON;
      btn.addEventListener('click', async () => {
        const code = pre.querySelector('code');
        const text = (code ? code.innerText : pre.innerText).replace(/\n$/, '');
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          const ta = document.createElement('textarea');
          ta.value = text; document.body.appendChild(ta); ta.select();
          document.execCommand('copy'); ta.remove();
        }
        btn.innerHTML = CHECK_ICON;
        btn.classList.add('copied');
        setTimeout(() => { btn.innerHTML = COPY_ICON; btn.classList.remove('copied'); }, 1400);
      });
      pre.appendChild(btn);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
