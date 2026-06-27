/* ============================================================================
 * typetune.js — Author-only live typography tuner.
 * Toggle with Shift+T. Adjusts per-category font-size + line-height multipliers
 * and global font families. Persists to localStorage; applies to <html> instantly.
 * "Export CSS" copies a :root{} block so chosen values can be baked into global.css.
 * Hidden from visitors (no trigger UI); empty localStorage → site defaults.
 * ==========================================================================*/
(() => {
  const LS_KEY = 'typetune-v2'; /* v2: discards stale pre-bake overrides */
  const root = document.documentElement;

  // Category registry — keys must match the --fs-<key> / --lh-<key> vars in global.css
  const GROUPS = [
    { name: 'Blog · 正文', cats: [
      { key: 'blog-body', label: '正文', lh: true },
      { key: 'blog-list', label: '列表', lh: true },
      { key: 'blog-quote', label: '引用块' },
      { key: 'blog-code', label: '行内代码' },
      { key: 'blog-pre', label: '代码块', lh: true },
    ]},
    { name: 'Blog · 标题', cats: [
      { key: 'blog-h1', label: 'H1 文章标题', lh: true },
      { key: 'blog-h2', label: 'H2', lh: true },
      { key: 'blog-h3', label: 'H3', lh: true },
      { key: 'blog-h4', label: 'H4', lh: true },
      { key: 'blog-h5', label: 'H5', lh: true },
    ]},
    { name: 'Blog · 其它', cats: [
      { key: 'blog-byline', label: '副标题/日期', lh: true },
      { key: 'blog-table', label: '表格', lh: true },
      { key: 'blog-sidenote', label: '边注', lh: true },
      { key: 'blog-pill', label: '边注角标' },
      { key: 'blog-bib', label: '参考文献', lh: true },
      { key: 'blog-math', label: '块公式' },
    ]},
    { name: '目录 TOC', cats: [ { key: 'toc', label: '目录链接', lh: true } ]},
    { name: '主页', cats: [
      { key: 'hp-name', label: '姓名' },
      { key: 'hp-namecn', label: '中文名' },
      { key: 'hp-links', label: '顶部链接' },
      { key: 'hp-intro', label: '自我介绍', lh: true },
      { key: 'hp-h2', label: '区块标题' },
      { key: 'hp-pub-title', label: '论文标题' },
      { key: 'hp-pub-authors', label: '论文作者' },
      { key: 'hp-pub-venue', label: '论文会议' },
      { key: 'hp-news', label: 'News' },
      { key: 'hp-bloglist', label: 'Blog 列表' },
    ]},
    { name: '全局', cats: [ { key: 'footer', label: '页脚' } ]},
  ];

  const FAMILIES = [
    { var: '--serif', label: '正文衬体', options: [
      { label: 'et-book (默认)', value: "'et-book', Palatino, 'Palatino Linotype', 'Book Antiqua', Georgia, 'Noto Serif SC', serif" },
      { label: 'Georgia', value: "Georgia, 'Noto Serif SC', serif" },
      { label: 'Times', value: "'Times New Roman', Times, 'Noto Serif SC', serif" },
      { label: '系统衬线', value: "ui-serif, Georgia, Cambria, serif" },
      { label: 'Noto Serif SC', value: "'Noto Serif SC', 'Songti SC', serif" },
    ]},
    { var: '--mono', label: '代码等宽', options: [
      { label: 'JetBrains Mono (默认)', value: "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace" },
      { label: '系统等宽', value: "ui-monospace, Menlo, Consolas, monospace" },
      { label: 'Courier', value: "'Courier New', Courier, monospace" },
    ]},
    { var: '--cn-serif', label: '中文衬体', options: [
      { label: 'Noto Serif SC (默认)', value: "'Noto Serif SC', 'Songti SC', 'STSong', serif" },
      { label: '宋体 Songti', value: "'Songti SC', 'STSong', serif" },
      { label: '楷体 Kaiti', value: "'Kaiti SC', 'KaiTi', serif" },
    ]},
  ];

  // ---- state (flat map of cssVar -> value, only non-defaults) ----
  let state = {};
  try { state = JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { state = {}; }

  function applyAll() {
    // clear known props first
    ['--g', ...FAMILIES.map(f => f.var)].forEach(v => root.style.removeProperty(v));
    GROUPS.forEach(g => g.cats.forEach(c => {
      root.style.removeProperty('--fs-' + c.key);
      if (c.lh) root.style.removeProperty('--lh-' + c.key);
    }));
    Object.entries(state).forEach(([k, v]) => root.style.setProperty(k, v));
  }

  function setVar(cssVar, value, isDefault) {
    if (isDefault) { delete state[cssVar]; root.style.removeProperty(cssVar); }
    else { state[cssVar] = value; root.style.setProperty(cssVar, value); }
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  }

  applyAll(); // no-FOUC already done inline; this is a safety re-apply

  // ---- build panel ----
  function buildPanel() {
    const panel = document.createElement('div');
    panel.id = 'typetune-panel';

    const close = document.createElement('button');
    close.className = 'tt-close'; close.textContent = '×';
    close.title = '关闭 (Shift+T)';
    close.onclick = () => panel.classList.remove('open');
    panel.appendChild(close);

    const h = document.createElement('h3'); h.textContent = '字体调参'; panel.appendChild(h);
    const sub = document.createElement('div'); sub.className = 'tt-sub';
    sub.textContent = 'Shift+T 开关 · 实时生效 · 自动记住'; panel.appendChild(sub);

    // global multiplier
    panel.appendChild(makeRow('全局总倍率', '--g', null, true));

    // families
    const famG = document.createElement('details'); famG.className = 'tt-group'; famG.open = true;
    const famS = document.createElement('summary'); famS.textContent = '字体族切换'; famG.appendChild(famS);
    FAMILIES.forEach(f => {
      const row = document.createElement('div'); row.className = 'tt-row';
      const lab = document.createElement('div'); lab.className = 'tt-label'; lab.textContent = f.label; row.appendChild(lab);
      const sel = document.createElement('select');
      f.options.forEach((o, i) => {
        const opt = document.createElement('option'); opt.value = o.value; opt.textContent = o.label;
        if (state[f.var] ? state[f.var] === o.value : i === 0) opt.selected = true;
        sel.appendChild(opt);
      });
      sel.style.gridColumn = '1 / -1';
      sel.onchange = () => setVar(f.var, sel.value, sel.selectedIndex === 0);
      row.appendChild(sel);
      famG.appendChild(row);
    });
    panel.appendChild(famG);

    // size/line-height groups
    GROUPS.forEach(g => {
      const det = document.createElement('details'); det.className = 'tt-group';
      const sum = document.createElement('summary'); sum.textContent = g.name; det.appendChild(sum);
      g.cats.forEach(c => det.appendChild(makeRow(c.label, '--fs-' + c.key, c.lh ? '--lh-' + c.key : null)));
      panel.appendChild(det);
    });

    // actions
    const actions = document.createElement('div'); actions.className = 'tt-actions';
    const exp = document.createElement('button'); exp.className = 'tt-btn'; exp.textContent = 'Export CSS';
    exp.onclick = exportCss;
    const rst = document.createElement('button'); rst.className = 'tt-btn'; rst.textContent = 'Reset';
    rst.onclick = resetAll;
    actions.appendChild(exp); actions.appendChild(rst);
    panel.appendChild(actions);

    const hint = document.createElement('div'); hint.className = 'tt-hint';
    hint.textContent = '滑块=相对默认倍率 (S 字号 / L 行高)。Export CSS 复制到剪贴板即可固化。';
    panel.appendChild(hint);

    document.body.appendChild(panel);
    return panel;
  }

  // makeRow: a category with a size slider (and optional line-height slider)
  function makeRow(label, fsVar, lhVar, isGlobal) {
    const row = document.createElement('div'); row.className = 'tt-row';
    const lab = document.createElement('div'); lab.className = 'tt-label'; lab.textContent = label; row.appendChild(lab);
    const val = document.createElement('div'); val.className = 'tt-val'; row.appendChild(val);

    const sliders = document.createElement('div'); sliders.className = 'tt-sliders';
    const sSlider = makeSlider(fsVar, isGlobal ? 'G' : 'S', val, lhVar);
    sliders.appendChild(sSlider.wrap);
    let lSlider = null;
    if (lhVar) { lSlider = makeSlider(lhVar, 'L', val, lhVar, fsVar); sliders.appendChild(lSlider.wrap); }
    row.appendChild(sliders);

    function updateVal() {
      const s = (state[fsVar] ? parseFloat(state[fsVar]) : 1).toFixed(2);
      let t = 'S ' + s + '×';
      if (lhVar) { const l = (state[lhVar] ? parseFloat(state[lhVar]) : 1).toFixed(2); t += '  L ' + l + '×'; }
      val.textContent = t;
    }
    sSlider.onUpdate = updateVal;
    if (lSlider) lSlider.onUpdate = updateVal;
    updateVal();
    return row;
  }

  function makeSlider(cssVar, tag, valEl, lhVar, fsVar) {
    const wrap = document.createElement('label');
    const tagEl = document.createElement('span'); tagEl.textContent = tag; wrap.appendChild(tagEl);
    const input = document.createElement('input');
    input.type = 'range'; input.min = '0.7'; input.max = '1.4'; input.step = '0.02';
    input.value = state[cssVar] ? state[cssVar] : '1';
    const api = { wrap, onUpdate: () => {} };
    input.oninput = () => {
      const v = parseFloat(input.value);
      setVar(cssVar, input.value, Math.abs(v - 1) < 0.001);
      api.onUpdate();
    };
    // double-click resets to 1
    input.ondblclick = () => { input.value = '1'; setVar(cssVar, '1', true); api.onUpdate(); };
    wrap.appendChild(input);
    return api;
  }

  function exportCss() {
    const entries = Object.entries(state);
    if (!entries.length) { toast('没有改动，无需导出'); return; }
    const lines = entries.map(([k, v]) => '  ' + k + ': ' + v + ';');
    const css = ':root {\n' + lines.join('\n') + '\n}';
    navigator.clipboard.writeText(css).then(
      () => toast('已复制 ' + entries.length + ' 条到剪贴板'),
      () => { console.log(css); toast('复制失败，已打印到 console'); }
    );
  }

  function resetAll() {
    state = {}; localStorage.removeItem(LS_KEY); applyAll();
    document.querySelectorAll('#typetune-panel input[type=range]').forEach(i => (i.value = '1'));
    document.querySelectorAll('#typetune-panel select').forEach(s => (s.selectedIndex = 0));
    document.querySelectorAll('#typetune-panel .tt-val').forEach(v => {
      v.textContent = v.textContent.includes('L') ? 'S 1.00×  L 1.00×' : 'S 1.00×';
    });
    toast('已重置为默认');
  }

  let toastEl = null;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.style.cssText = 'position:fixed;bottom:16px;right:16px;z-index:10000;background:#222;color:#fff;font-family:sans-serif;font-size:12px;padding:8px 12px;border-radius:6px;opacity:0;transition:opacity .2s;';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg; toastEl.style.opacity = '1';
    clearTimeout(toastEl._t); toastEl._t = setTimeout(() => (toastEl.style.opacity = '0'), 1800);
  }

  let panel = null;
  function toggle() {
    if (!panel) panel = buildPanel();
    panel.classList.toggle('open');
  }

  document.addEventListener('keydown', (e) => {
    if (e.shiftKey && (e.key === 'T' || e.key === 't') && !e.metaKey && !e.ctrlKey && !e.altKey) {
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      e.preventDefault(); toggle();
    }
  });
})();
