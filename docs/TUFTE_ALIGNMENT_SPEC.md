# Tufte 对齐 SPEC（合成版 · 可直接照做）

> 把博客文章页（Astro）从「Charter + 55% 窄块 + 灰色小边注 + 无 TOC」对齐到线上 **Tufted** 模板（et-book 字体 / 三栏错位定位 / 右侧 float 边注 / 左侧固定 TOC）。
> 所有数值已逐字核对真相源；本文件是唯一执行依据。**对齐目标 = Tufted（中英混排站），不是 canonical tufte**——凡 tufted 覆盖处以 tufted 为准；canonical 仅用于 tufted 未覆盖的项。

---

## 0. 两条全局基准（先钉死，消除规格间冲突）

1. **rem 基准 = 14px**。`html{font-size:10.5pt}`（=14px，tufted L16 覆盖了 canonical 的 15px；本站现状 already 14px）。所有 `rem→px` 一律按 **1rem = 14px** 换算。任何按 15px 算出的 px 值作废，本文件只保留 rem。
   - 常用换算：`1.4rem=19.6px`、`2.2rem=30.8px`、`1.2rem=16.8px`、`1.1rem=15.4px`、`0.95rem=13.3px`、`0.75rem=10.5px`。
2. **对齐目标 = Tufted**。tufted 覆盖处一律以 tufted 为准：
   - 标题 **`font-weight:bold; font-style:normal; color:#111`**（不是 canonical 的 italic/400）；h2=`2.3rem`、h3=`2rem`。
   - code = `1.2rem`、pre>code = `1.2rem/1.5`。
   - canonical（tufte.min.css）仅用于 tufted 未覆盖项：**h1 的 size/margin**、**body 三栏几何**、**sidenote 几何 `50%/-60%`**、**@font-face 四块**、**blockquote 本体**。

### 已解决的规格冲突（结论）
- **C1 列宽模型**：采用「布局 spec 几何」——`.blog-wrapper` 升级为 tufte body 坐标系（87.5% + `padding-left:12.5%`），正文**逐元素 55%**，边注用 tufte 原生 **`width:50%; margin-right:-60%`**。**作废边注 spec 的 25% 模型**（它只在 wrapper 仍是 55% 时才成立）。边注 spec 的 P0（字号 `1.1rem`、颜色 `--text`、`line-height:1.3`、`margin-top:.3rem`）全部保留。
- **C2 标题斜体**：**不**给 h1–h5 整体加 italic（中文 et-book 无斜体字形 → faux italic 很丑）。斜体只走 `.heading-en`（标题内 ASCII 段）和正文 `<em>`。字体 spec 里「h2/h3 italic」目标作废。
- **单点根因（P0 前置）**：必须给 `<Content/>` 外包一层 `<section>`。否则 `section > p` 选择器全失配、`toc.js` 的 `article > section` 命中失败 → TOC 永不生成、正文列宽规则失效。这是布局 + TOC 两个维度共同的依赖。

### 三层结构总览
- **第 1 层 base（tufte.min.css）**：et-book、body 三栏几何、p/列表 1.4rem、sidenote `50%/-60%`、blockquote、figure max-width。
- **第 2 层 override（tufted.css）**：14px root、justify+inter-ideograph、`hyphens:auto`、标题 bold/normal、code 1.2rem、`.heading-en` italic、`.article-byline`、`.toc-sidebar`、footnote 药丸、图片 `left:27.5%` 居中、移动端断点。
- **第 3 层 theme（theme.css）**：`--theme-*` light/dark 颜色 token（本站映射到自有 `--bg/--text/--code-*/--table-*` + `html.dark`）。

---

## 1. @font-face 块（完整可粘贴，放 `global.css` 顶部，`:root` 之前）

真相源：tufte.min.css 行 1 的 4 条 @font-face。资产已落盘（扁平 8 文件 woff+ttf，无 eot/svg/子目录）：`/Users/glt/proj/academic-homepage/public/fonts/et-book/`。路径用站点根绝对 `/fonts/...`（Astro `public/` 映射到根）。woff 在前（小、优先），ttf 兜底。

```css
/* ===== et-book self-hosted (canonical tufte-css 1.8.0, local flat layout) ===== */
@font-face {
  font-family: 'et-book';
  src: url('/fonts/et-book/et-book-roman-line-figures.woff') format('woff'),
       url('/fonts/et-book/et-book-roman-line-figures.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'et-book';
  src: url('/fonts/et-book/et-book-display-italic-old-style-figures.woff') format('woff'),
       url('/fonts/et-book/et-book-display-italic-old-style-figures.ttf') format('truetype');
  font-weight: 400;
  font-style: italic;
  font-display: swap;
}
@font-face {
  font-family: 'et-book';
  src: url('/fonts/et-book/et-book-bold-line-figures.woff') format('woff'),
       url('/fonts/et-book/et-book-bold-line-figures.ttf') format('truetype');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'et-book-roman-old-style';
  src: url('/fonts/et-book/et-book-roman-old-style-figures.woff') format('woff'),
       url('/fonts/et-book/et-book-roman-old-style-figures.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

- 第 1 块（roman-line）= 正文。第 2 块（display-italic）= `.heading-en` + 正文 `<em>` + epigraph 的真实斜体字形（非合成）。第 3 块（bold-line）= 标题/`<strong>`。第 4 块（`et-book-roman-old-style`，独立 family）= 边注编号 `.sidenote-num`。
- **最高优先级缺口**：现状 `our-global.css` 完全没有 `@font-face`（grep 零命中）→ 不补则全站回落 Charter / 系统衬线。这是「字体看着不对」的两大主因之一。

---

## 2. CSS 变量（`:root` + `html.dark`，对齐 theme.css）

只改 `--serif` / `--mono` 两行；颜色 token 现状已与 theme.css 等价，保留。

```css
:root {
  /* 字体栈：et-book 打头是关键；CJK 衬线并入末尾，使正文混排中文走 Noto Serif SC */
  --serif: 'et-book', Palatino, 'Palatino Linotype', 'Palatino LT STD',
           'Book Antiqua', Georgia, 'Noto Serif SC', 'Songti SC', 'STSong', serif;
  --sans:  'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; /* UI chrome，不动 */
  --mono:  'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  --cn-serif: 'Noto Serif SC', 'Songti SC', 'STSong', serif; /* header 中文名专用，保留 */
}
```

颜色 token 对照（现状 ↔ theme.css，已等价，**不改**）：

| 本站 token | light | dark | theme.css 对应 |
|---|---|---|---|
| `--bg` | `#fffff8` | `#151515` | `--theme-bg` ✅ |
| `--text` | `#111111` | `#dddddd` | `--theme-text` ✅ |
| `--text-strong` | `#111111` | `#eeeeee` | `--theme-heading` ✅ |
| `--text-muted` | `#666666` | `#999999` | `--theme-line-numbers-text(#aaa/#666)` ≈ |
| `--code-bg` | `#f7f7f7`类 | `#2d2d2d`类 | `--theme-pre-bg` ✅ |
| `--code-border` | `#e0e0e0`类 | `#3d3d3d`类 | `--theme-pre-border` ✅ |
| `--table-border` | `#cccccc` | `#444444` | `--theme-table-border` ✅ |
| `--table-header-bg` | `#f4f4ee` | `#2a2a2a` | `--theme-table-header-bg` ✅ |
| `--table-row-hover` | `#efefe8` | `#2d2d2d` | `--theme-table-row-hover` ✅ |

> 新增需要的高亮 token（边注 hover，§6 用到），加进 `:root` / `html.dark`：
> ```css
> :root      { --highlight-weak: rgba(128,128,128,0.2); --highlight-strong: rgba(128,128,128,0.4); }
> /* dark 同值（rgba 灰对两种主题都可用），无需在 html.dark 重声明 */
> ```

---

## 3. 全局排版（root / body / p / 标题 / code）

### 3.1 root / body

| 属性 | 目标值 | 来源 | 现状 | 动作 |
|---|---|---|---|---|
| `html font-size` | `10.5pt`（=14px） | tufted L16 | `10.5pt` | ✅ 不改 |
| `body font-family` | `var(--serif)`（含 et-book） | tufte body | `var(--serif)`（无 et-book） | 由 §2 修好 |
| `body background` | `var(--bg)`（`#fffff8`/`#151515`） | tufte+dark | 已对 | ✅ |
| `body color` | `var(--text)`（`#111`/`#ddd`） | tufte | 已对 | ✅ |
| `body line-height` | **删除** | tufte 行高只挂正文元素 | `body{line-height:2.2rem}` | 🔴 **删**（`2.2rem` 在 body 上会污染 header/footer） |

```css
body {
  font-family: var(--serif);
  background-color: var(--bg);
  color: var(--text);
  margin: 0 auto;
  /* 删除原 line-height: 2.2rem; —— 行高改挂 p / 列表 */
}
```

### 3.2 段落 p / 列表（P0：正文偏小是最大病灶）

| 属性 | 目标值 | 来源 | 现状 | 动作 |
|---|---|---|---|---|
| `font-size` | `1.4rem`（=19.6px） | tufte `dl,ol,p,ul` | **未设** → 继承 14px | 🔴 **加**（偏小 5.6px，头号病灶） |
| `line-height` | `2.2rem`（=30.8px） | tufted L105 | `2.2rem` | ✅ 保持 |
| `margin-top` | `1.4rem` | tufte | 未设 | 🔴 加 |
| `margin-bottom` | `1.4rem` | tufte | `0` | 🔴 改 |
| `text-align` | `justify` | tufted L102 | `justify` | ✅ 保持 |
| `text-justify` | `inter-ideograph` | tufted | 有 | ✅ 保持 |

```css
p {
  font-size: 1.4rem;          /* P0：19.6px，对齐 tufte */
  line-height: 2.2rem;        /* tufted */
  margin-top: 1.4rem;
  margin-bottom: 1.4rem;      /* 由 0 改 1.4rem */
  text-align: justify;
  text-justify: inter-ideograph;
}
dl, ol, ul { font-size: 1.4rem; line-height: 2.2rem; }   /* 列表同步 */
```
> 移动端窄屏 justify 必须配 `hyphens:auto`（见 §5.4），否则中文/英文混排右边缘巨大词间空隙。

### 3.3 标题 h1–h5（bold + normal，不加 italic）

真相源 tufted L116-152（覆盖 weight/style/color/size/margin）；h1 的 size/margin 落 canonical tufte。**1rem=14px。**

| 元素 | font-size | weight | style | color | margin (top / bottom) | line-height | 来源 |
|---|---|---|---|---|---|---|---|
| h1 | `3.2rem`(=44.8px)｜或站点 `2.5rem`* | bold | normal | `var(--text)` | `4rem / 1.5rem` | `1` | size/margin: tufte；weight/style/color: tufted |
| h2 | `2.3rem`(=32.2px) | bold | normal | `var(--text)` | `2rem / 1rem` | `1.2` | tufted L126 |
| h3 | `2rem`(=28px) | bold | normal | `var(--text)` | `1.5rem / 0.8rem` | `1.2` | tufted L133 |
| h4 | `1.75rem`(=24.5px) | bold | normal | `var(--text)` | `1.2rem / 0.5rem` | `1.2` | tufted L140 |
| h5 | `1.5rem`(=21px) | bold | normal | `var(--text)` | `1rem / 0.5rem` | `1.2` | tufted L147 |

\* **h1 抉择**：tufted 未覆盖 h1 的 size/margin，canonical 是 `3.2rem`。本站文章标题现状用 `article.blog-post h1{font-size:2.5rem}`（品牌尺度，有意缩放）。**推荐保留 2.5rem 作为站点标题尺度**（标注为设计抉择，非 bug）；若确需 tufte 巨标题则用下方 canonical 值。h2–h5 **已精确对齐 tufted，不动**。

```css
h1, h2, h3, h4, h5 {
  font-family: var(--serif);   /* 继承 et-book */
  font-weight: bold;
  font-style: normal;
  color: var(--text);
}
h1 { font-size: 3.2rem; line-height: 1;   margin: 4rem 0 1.5rem; } /* 或站点保留 2.5rem（见上） */
h2 { font-size: 2.3rem; line-height: 1.2; margin: 2rem 0 1rem; }
h3 { font-size: 2rem;   line-height: 1.2; margin: 1.5rem 0 0.8rem; }
h4 { font-size: 1.75rem;line-height: 1.2; margin: 1.2rem 0 0.5rem; }
h5 { font-size: 1.5rem; line-height: 1.2; margin: 1rem 0 0.5rem; }

/* 标题内 ASCII 段斜体（真 et-book italic，非合成）；正文 em/epigraph 同享 italic 字形 */
.heading-en { font-style: italic; }
em, i, .epigraph p, div.epigraph > blockquote > p { font-style: italic; }
```

> **`.heading-en` 的注入**：需把标题里每段连续 ASCII（charCode ≤ 0x7f）包进 `<span class="heading-en">`，CJK 保持正体。**推荐构建期做**（写一个 rehype 插件遍历 h1–h6 文本节点，按 ASCII run 包 span）——无 FOUC、SSR 友好。图快可直接把 `/Users/glt/proj/academic-homepage/.tufte-ref/format-headings.js` 作为客户端 `<script>` 引入文章布局（DOMContentLoaded 时跑）。

### 3.4 code / inline code（P0：偏小）

| 属性 | 目标值 | 来源 | 现状 | 动作 |
|---|---|---|---|---|
| inline `code` font-size | `1.2rem`(=16.8px) | tufted L239 | `0.88em`（相对父级，不稳定） | 🔴 改绝对 `1.2rem` |
| `pre > code` font-size | `1.2rem` | tufted L207 | `pre{0.85rem}`（≈12px，偏小） | 🔴 改 |
| `pre > code` line-height | `1.5` | tufted L208 | `1.5`（挂在 pre 上） | 移到 `pre>code` |
| `h1/h2/h3 > code` | `.8em` | tufte | 未设 | 加（防标题内代码爆大） |

```css
code { font-size: 1.2rem; }                       /* 由 0.88em → 1.2rem，稳定 */
pre > code { font-size: 1.2rem; line-height: 1.5; }
h1 > code, h2 > code, h3 > code { font-size: .8em; }
```
> `--mono` 保留 JetBrains Mono（现代化等宽，非 bug），canonical 兜底已并入（§2）。

---

## 4. 三栏布局 CSS（核心结构）

### 4.1 机制说明
tufte 三栏不是 flex/grid，而是**同一 body 坐标系上的错位定位**：`body{width:87.5%; padding-left:12.5%}` → 视口左永久空出 12.5% gutter（TOC 的家）；正文逐元素收到 55%；边注 `float:right; width:50%; margin-right:-60%` 浮进正文右侧的负空间。

**致命现状**：`.blog-wrapper{width:55%}` + `body{margin:0 auto}`（无 width/padding/max-width）→ 55% 窄块贴视口左缘，左侧无 TOC gutter，且若外层 55% + 逐元素 55% 会「55% 的 55%」双重收窄到视口 ~30%。

**改法**：让 `.blog-wrapper` 承担 tufte 的 body 角色（不动 `<body>`，避免影响首页居中），正文逐元素 55%，边注回到 `50%/-60%`。

### 4.2 `.blog-wrapper`（= tufte body 坐标系）

```css
.blog-wrapper {
  width: 87.5%;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 12.5%;          /* 视口左留 12.5% gutter 给 TOC */
  box-sizing: border-box;       /* 全局 *{box-sizing:border-box} 已生效，width 含 padding */
  counter-reset: sidenote-counter;  /* 兜底；本站边注用字面量编号，可留 */
}
```
> 删除原 `.blog-wrapper{width:55%}`。

### 4.3 正文逐元素 55%（替换散落的 55% 规则）

> **前提**：`<Content/>` 外包 `<section>`（见 §9 实施 B），否则 `section > p` 全失配。同时给直接挂 article 下的元素加兜底选择器。

```css
.blog-post section > p,
.blog-post section > ul,
.blog-post section > ol,
.blog-post section > dl,
.blog-post section > table,
.blog-post section > footer,
.blog-post > p,                 /* 无 section 包裹的兜底 */
.blog-post .article-byline { width: 55%; }

.blog-post figure { max-width: 55%; }
.blog-post pre    { width: 55%; }
.blog-post .fullwidth,
.blog-post figure.fullwidth { max-width: 90%; clear: both; }
.blog-post .fullwidth img,
.blog-post .fullwidth svg   { max-width: 100%; }
```

### 4.4 图片居中（55% 图在 55% 列里再居中的 trick）

真相源 tufted L60-66 / L73-85。**注意**：拆 wrapper-55% 后 `left:27.5%` 基准 = 55% 列宽，公式仍成立（`left:27.5% + translateX(-50%)` 把图水平居中于列）；移动端归零。

```css
.blog-post section > img,
.blog-post section > svg {
  display: block;
  max-width: 55%;
  position: relative;
  left: 27.5%;
  transform: translateX(-50%);
}
.blog-post section > figure:not(.fullwidth) > img,
.blog-post section > figure:not(.fullwidth) > svg {
  display: block;
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;
}
```

### 4.5 边注 gutter 的负 margin 数学
基准 = 正文列宽 = 55%（记为 C）。`float:right` 贴正文右内壁；`width:50%`=0.5C；`margin-right:-60%`=−0.6C 整体右移 → 边注左缘 = 正文右壁 + (0.6C−0.5C) = 右壁 + **0.1C**（10% 列宽间隙），占据右侧 [+0.1C, +0.6C]，落在 body 那 45% 右负空间内，不挤正文。基准是**包含块**（`<p>`/`<li>`，即 55% 列）——所以**必须**用逐元素 55%，否则若基准是 100% wrapper，`-60%` 会把边注推出视口。（具体 CSS 见 §6.1。）

### 4.6 几何校验（W ≤ 1400px）
左 TOC `[1%, 11.5%]`（fixed `left:1% width:10.5%`）｜12.5% gutter｜正文 `[12.5%, ~60.6%]`（55% of 87.5% 内容区）｜边注 `[~64.9%, ~94.7%]`（右壁+0.1C 起、宽 0.5C）｜右留 ~5%。**三栏零重叠。**

### 4.7 响应式断点
- **760px**：折叠边注为内联卡片（§6.3）+ 正文 100% + `p{hyphens:auto}`（§5.4）。现状断点已 760px ✅。
- **1200px**：才显示 TOC（默认 `display:none`）。真相源 tufted L756。

---

## 5. 其它元素（byline / blockquote / table / bibliography / figure-math）

### 5.1 byline（真相源类名 `.article-byline`，本站现状 `.post-meta`）
真相源 tufted L155-174。**决策：统一改用 `.article-byline`**（remark/astro 输出该类名，删 `.post-meta`），或保留 `.post-meta` 但套用以下值。

```css
.blog-post .article-byline {       /* 若保留旧类名则写 .blog-post .post-meta */
  width: 55%;
  margin: -0.4rem 0 1.6rem;
  color: var(--text);
  font-size: 1.2rem;
  line-height: 1.5;
  opacity: 0.7;
}
.blog-post .article-byline p { width: 100%; margin: 0; text-align: left; line-height: inherit; }
@media (max-width: 760px) { .blog-post .article-byline { width: 100%; } }
```

### 5.2 blockquote / epigraph
真相源 tufte.min.css。本站 blockquote 可能渲染成 `div[style*="border-inline-start"]`（tufted 移动端 L515-517 暗示）——先确认渲染方式，原生 `<blockquote>` 用下方，内联 style 版则给 `.blog-post div[style*="border-inline-start"]{width:55%}` + 移动端 `width:100%`。

```css
.blog-post blockquote { margin: 3em 0; font-size: 1.4rem; }
.blog-post blockquote p { width: 55%; margin-right: 40px; }
.blog-post blockquote footer { width: 55%; font-size: 1.1rem; text-align: right; }
.blog-post div.epigraph > blockquote > p { font-style: italic; }
.blog-post blockquote .sidenote { margin-right: -82%; min-width: 59%; text-align: left; } /* 引用块内边注补偿 */
@media (max-width: 760px) {
  .blog-post blockquote p, .blog-post blockquote footer { width: 100%; }
  .blog-post div[style*="border-inline-start"] { width: 100% !important; }
}
```

### 5.3 table
真相源 tufte `table{width:55%}` + theme.css 暗色 token。现状 `table{width:100%}` 无 hover、无暗色。

```css
.blog-post table { width: 55%; border-collapse: collapse; }   /* fullwidth 表用 .fullwidth 包到 90% */
.blog-post th, .blog-post td { border-bottom: 1px solid var(--table-border); padding: 0.4em 0.6em; }
.blog-post thead th { background: var(--table-header-bg); }
.blog-post tbody tr:nth-child(even) { background: var(--table-row-even); }
.blog-post tbody tr:hover { background: var(--table-row-hover); }
@media (max-width: 760px) { .blog-post table { width: 100%; } }
```

### 5.4 figure[role="math"]（KaTeX 块）
真相源 tufted L397-433。

```css
.blog-post figure[role="math"] {
  display: block; width: 55%; text-align: center;
  margin: 1em 0; padding: 0.5em 0; font-size: 1.4em; line-height: 1.2;
  overflow-x: auto; overflow-y: hidden;
}
.blog-post figure[role="math"] > * { display: inline-block; min-width: max-content; text-align: center; }
@media (max-width: 760px) {
  .blog-post figure[role="math"] { width: 100%; }
  .blog-post section > img, .blog-post section > svg { max-width: 100%; left: 0; transform: none; margin: 0 auto; }
}
/* 移动端 justify 必须配连字，否则巨大词间空隙 */
@media (max-width: 760px) { .blog-post p { hyphens: auto; } }
```

### 5.5 bibliography（真相源 = `role="doc-bibliography"`，不是 class）
真相源 live-blog.html L75-81：`<section role="doc-bibliography"><h2>Bibliography</h2><ul style="list-style-type:none"><li id="loc-N"><span class="prefix"><a href="#loc-1" role="doc-backlink">[1]</a></span> …</li>`。
**先 grep 确认本站 remark 实际输出**（`role="doc-bibliography"` 还是 `.bibliography`/`.references` class），统一一种。回链样式：

```css
.blog-post section[role="doc-bibliography"] ul,
.blog-post .bibliography ul, .blog-post .references ol { list-style: none; padding-left: 0; }
.blog-post .prefix a[role="doc-backlink"],
.blog-post .references a { text-decoration: none; color: var(--text-muted); }
.blog-post .prefix a[role="doc-backlink"]:hover { color: var(--text-strong); }
```
> TOC 排除选择器（§7）必须同时列 `.bibliography, .references, [role="doc-bibliography"]` 三者，否则参考文献标题混进 TOC。

### 5.6 header / footer（站点 chrome，确认不吃 12.5% padding）
`.blog-wrapper` 的 `padding-left:12.5%` 只作用其内部；若 header/footer 在 `.blog-wrapper` **外**则安全。对齐 tufted L600-602：

```css
header.site-header, footer { font-size: 1.1rem; color: #666; line-height: 1.6; }
```

---

## 6. 边注 CSS（方案 A：保留字面量编号 + 药丸上标）

**决策依据**：线上 Tufted（live-blog.html L64,73）**根本没用 tufte 的 `counter`**——编号 `1`/`2` 是字面量写死在 HTML 里的（`tufted.css` 全文 grep 无 `counter`）。本站 `remark-sidenotes.ts` 写死字面量与线上 Tufted **完全一致**。**不要改成 counter**（counter 是渲染顺序号，会与作者写的引用号脱钩）。药丸上标已逐字对齐 tufted L488-504，**不要回退到 et-book 裸上标**。

### 6.1 `.sidenote`（边注主体，桌面 ≥761px）
基准链已在 §4.5 论证：`width:50%`/`margin-right:-60%` 相对包含块（55% 列）成立。

| 属性 | 目标值 | 来源 | 现状 | 动作 |
|---|---|---|---|---|
| float / clear | `right` / `right` | tufte | 有 | ✅ |
| width | `50%` | tufte | `25%` | 🔴 改 50% |
| margin-right | `-60%` | tufte | `calc(-25% -1.5rem)` | 🔴 改 -60% |
| **font-size** | **`1.1rem`**(=15.4px) | tufte | `0.82rem`(≈11.5px) | 🔴 **P0**（小 25%，最显眼偏差） |
| **line-height** | `1.3` | tufte | `1.5` | 🔴 改 |
| **color** | `var(--text)` | tufte（边注用正文色，靠位置区分主次） | `var(--text-muted)` 灰 | 🔴 **P0** 改正文色 |
| margin-top | `.3rem` | tufte | 无 | 加 |
| vertical-align | `baseline` | tufte | 无 | 加 |
| position | `relative` | tufte | 无 | 加 |

```css
@media (min-width: 761px) {
  .blog-post .sidenote {
    float: right;
    clear: right;
    width: 50%;                 /* = 50% of 55% 列 */
    margin-right: -60%;
    margin-top: 0.3rem;
    margin-bottom: 0;
    font-size: 1.1rem;          /* P0 */
    line-height: 1.3;
    color: var(--text);         /* P0：正文色，非灰 */
    vertical-align: baseline;
    position: relative;
  }
}
```

### 6.2 上标药丸 `.sidenote-ref` / `.sidenote-link` + 前导编号 `.sidenote-num`
药丸已与 tufted L488-504 **逐字对齐，零偏差，不动**（`display:inline-flex; font-size:0.75rem; line-height:1; min-width:1.6em; height:1.6em; padding:0 0.4em; margin:0 0.15em; border-radius:999px; border:1px solid var(--code-border); background:var(--code-bg)`）。容器 `sup.sidenote-ref{line-height:0; position:relative; vertical-align:baseline; top:-.5em}` 同样已对齐，不动。

`.sidenote-num`（边注内前导 "1."）微调对齐 tufte 旧式数字：
```css
.sidenote-num {
  font-family: 'et-book-roman-old-style', var(--serif);  /* tufte 编号字体（@font-face 第 4 块） */
  font-weight: 400;        /* 由 600 → 400（旧式数字不加粗） */
  color: var(--text);
  margin-right: 0.3em;     /* 由 0.2em 略加 */
}
```

### 6.3 移动端折叠（<760px，默认展开成卡片 = 有意为之）
本站默认 `display:block` 全展开（用户明确要的，与 tufte/Tufted 默认折叠不同，**保留**，无需 toggle JS）。仅把 §6.1 的字号/颜色带过来：

```css
@media (max-width: 760px) {
  .blog-post { width: 100%; padding: 2rem 1rem 3rem; }
  .blog-post .sidenote {
    float: none; width: 100%;
    margin: 0.3rem 0 0.8rem; padding: 0.6rem 0.8rem;
    font-size: 1.1rem;        /* 卡片也要 readable，由继承 0.82rem 改 */
    line-height: 1.4;
    color: var(--text);       /* 由 --text-muted 改 */
    background: var(--code-bg);
    border: 1px solid var(--code-border);
    border-radius: var(--radius-sm, 0.2rem);
    box-sizing: border-box;
  }
}
```

### 6.4 hover 双向高亮（P2，可选，逐字对齐 tufted L614-635）
**注意变量名**：tufted 用 `--highlight-weak`/`--highlight-strong`（**不是** `-bg`/`-shadow`，照抄会失效），box-shadow `5px`，transition 延迟 `1s`。

```css
.sidenote-ref,
.sidenote-ref + .sidenote {
  --highlight: transparent;
  background-color: var(--highlight);
  box-shadow: 0 0 0 5px var(--highlight);
  border-radius: var(--radius-sm, 0.2rem);
  transition: background-color .3s ease 1s, box-shadow .3s ease 1s;
}
.sidenote-ref:hover + .sidenote        { --highlight: var(--highlight-weak);   transition-delay: 0s; }
.sidenote-ref:has(+ .sidenote:hover)   { --highlight: var(--highlight-strong); transition-delay: 0s; }
```

### 6.5 `remark-sidenotes.ts` 微调
- **必改**：`href="#"` 是死链（点击跳页顶）。改成真双向锚：
  ```ts
  `<sup class="sidenote-ref" id="snref-${num}"><a class="sidenote-link" href="#sn-${num}" data-sn="${num}">${num}</a></sup>` +
  `<span class="sidenote" id="sn-${num}"><a class="sidenote-num" href="#snref-${num}">${num}.</a> ${fnText}</span>`
  ```
  （`.sidenote-num` 升级为回跳 `<a>`；ref 加 `id="snref-N"`。）
- **不改**：字面量 `${num}` 编号机制（§6 决策）。
- **不改**：类名仍用 `.sidenote*`（不改成 Tufted 的 `.footnote-ref*`/`.marginnote`，否则破坏本站所有 `.sidenote*` 选择器；本站默认展开无需 toggle JS）。

---

## 7. TOC（左侧固定，完整移植）

真相源算法 `toc.js` L1-137；CSS `tufted.css` L709-760。**三处必须改的差异**（否则坏）：① 根选择器 `article>section` → 本站若已加 `<section>`（§9-B）则原样可用，但脚本兜底用 `article.blog-post`；② bibliography 排除 = `.bibliography, .references, [role="doc-bibliography"]` 三者全列；③ nav 插到 `<body>` 直接子节点（不塞进 `.blog-wrapper`）；④ 变量 `--theme-*` → `--text-muted`/`--text-strong`。

### 7.1 客户端脚本 `public/toc.js`（新建）

```js
/* public/toc.js — Tufted 左侧 TOC，移植自 .tufte-ref/toc.js，适配 .blog-post + html.dark */
(() => {
  const MIN_H3_HEADINGS = 3;

  function collectHeadings(root) {
    return Array.from(root.querySelectorAll("h2, h3")).filter(
      (h) => !h.closest('.bibliography, .references, [role="doc-bibliography"]'),
    );
  }

  function ensureHeadingId(heading, index, usedIds) {
    const baseId = heading.id || `toc-${index + 1}`;
    let id = baseId, suffix = 2;
    while (usedIds.has(id) ||
      (document.getElementById(id) && document.getElementById(id) !== heading)) {
      id = `${baseId}-${suffix}`; suffix += 1;
    }
    heading.id = id; usedIds.add(id); return id;
  }

  function buildToc(headings) {
    const nav = document.createElement("nav");
    nav.className = "toc-sidebar";
    nav.setAttribute("aria-label", "文章目录");
    const list = document.createElement("ol");
    const usedIds = new Set();
    headings.forEach((heading, index) => {
      const id = ensureHeadingId(heading, index, usedIds);
      const item = document.createElement("li");
      const link = document.createElement("a");
      item.classList.add(`toc-${heading.tagName.toLowerCase()}`);
      if (index > 0) item.classList.add("toc-after-title");
      link.href = `#${id}`;
      link.textContent = heading.textContent.trim();
      item.appendChild(link); list.appendChild(item);
    });
    nav.appendChild(list); return nav;
  }

  function bindSmoothScroll(nav) {
    nav.addEventListener("click", (event) => {
      const link = event.target.closest("a");
      if (!link || !nav.contains(link)) return;
      const target = document.getElementById(link.hash.slice(1));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", link.hash);
    });
  }

  function bindScrollSpy(nav, headings) {
    const linksById = new Map(
      Array.from(nav.querySelectorAll("a")).map((l) => [l.hash.slice(1), l]),
    );
    function setActive(id) {
      nav.querySelector("a.is-active")?.classList.remove("is-active");
      linksById.get(id)?.classList.add("is-active");
    }
    setActive(headings[0].id);
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: "0px 0px -70% 0px", threshold: 0 },   // 必须一字不差
    );
    headings.forEach((h) => observer.observe(h));
  }

  function init() {
    const root = document.querySelector("article.blog-post");   // 本站无 section 时的根
    if (!root) return;
    const headings = collectHeadings(root);
    const h3Count = headings.filter((h) => h.tagName === "H3").length;
    if (h3Count < MIN_H3_HEADINGS) return;                       // <3 个 h3 不渲染
    const nav = buildToc(headings);
    document.body.insertBefore(nav, document.body.firstChild);   // 挂 body，绕开 .blog-wrapper 裁切
    bindSmoothScroll(nav);
    bindScrollSpy(nav, headings);
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();
```

### 7.2 `.toc-sidebar` CSS（追加 global.css，含 dark）
真相源 tufted L709-760。`position:fixed` 不继承 padding，`left:1%` 相对视口，与 `.blog-wrapper` 从视口 0 起算自洽。

```css
/* ===== Table of Contents（左侧固定，移植自 tufted.css L709-760）===== */
.toc-sidebar {
  position: fixed;
  top: 15rem;
  left: 1%;
  z-index: 10;
  display: none;                       /* 默认隐藏，仅 ≥1200px 显示 */
  width: 10.5%;
  max-height: calc(100vh - 11rem);
  overflow-y: auto;
  color: var(--text-muted);            /* 替 --theme-line-numbers-text */
  font-family: var(--serif);
}
.toc-sidebar ol { margin: 0; padding: 0; list-style: none; }
.toc-sidebar li { margin: 0 0 0.2em; }
.toc-sidebar .toc-after-title { padding-left: 0.8em; }   /* tufted 唯一缩进规则 */

.toc-sidebar a:any-link {
  display: block;
  color: inherit;
  font-size: 0.95rem;
  line-height: 1.1;
  text-decoration: none;               /* 覆盖全局 a 下划线（theme.css L131） */
  border-left: 1px solid transparent;
  padding-left: 0.6em;
  transition: border-color 120ms ease, color 120ms ease;
}
.toc-sidebar a:hover,
.toc-sidebar a:focus-visible,
.toc-sidebar a.is-active {
  color: var(--text-strong);           /* 替 --theme-copy-btn-hover-text */
  border-left-color: currentColor;
  outline: none;
  opacity: 1;                          /* 抵消全局 a:hover{opacity:.7} */
}

@media (min-width: 1200px) { .toc-sidebar { display: block; } }
```

### 7.3 引入点
`src/pages/blog/[...slug].astro`，`</BaseLayout>` 之前、`</div>`（`.blog-wrapper` 闭合）之后：
```astro
  </div>
  <script src="/toc.js" is:inline></script>
</BaseLayout>
```
用 `public/toc.js + <script src is:inline>`（非内联），只在文章页加载、不进 Astro 打包管线。

---

## 8.（本节并入 §5/§6/§7，无独立内容）

---

## 9. 实施清单（按文件）

### `src/styles/global.css`（主战场，对照镜像 `.tufte-ref/our-global.css`）
| # | 位置 | 现状 | 改为 | 优先级 |
|---|---|---|---|---|
| G1 | 文件顶部（`:root` 前） | 无 @font-face | 粘贴 §1 四块 @font-face | **P0** |
| G2 | `:root` 行3 `--serif` | Charter 系 | §2 et-book 打头 + CJK 末尾 | **P0** |
| G3 | `:root` 行5 `--mono` | 无 canonical 兜底 | §2 追加 Consolas… | P3 |
| G4 | `:root`/`html.dark` | 无 highlight token | 加 `--highlight-weak/-strong` | P2 |
| G5 | `body` | `line-height:2.2rem` | §3.1 删 line-height | P2 |
| G6 | `p`（行84） | 无 font-size、`margin-bottom:0` | §3.2 加 `1.4rem` + `margin:1.4rem 0` | **P0** |
| G7 | 列表 | — | §3.2 `dl,ol,ul{font-size:1.4rem;line-height:2.2rem}` | P1 |
| G8 | h1–h5（行72-82） | bold/normal ✅ 但缺 color token、h1 size | §3.3（h2–h5 已对，补 `color:var(--text)` + h1 抉择） | P1 |
| G9 | — | 无 `.heading-en` / em italic | §3.3 加 | P1 |
| G10 | `code`（行104）/`pre` | `0.88em` / `0.85rem` | §3.4 `code{1.2rem}` `pre>code{1.2rem/1.5}` `h*>code{.8em}` | **P0** |
| G11 | `.blog-wrapper`（行345） | `width:55%` | §4.2 tufte body 坐标系 | **P0** |
| G12 | 散落 55% 规则 | 各处 | §4.3 统一逐元素 55% | **P0** |
| G13 | 图片 | 部分 | §4.4 `section>img{left:27.5%;transform}` | P1 |
| G14 | `.sidenote`（行473-510） | `25%`/`-25%-1.5rem`/`0.82rem`/灰 | §6.1 `50%/-60%/1.1rem/--text` | **P0** |
| G15 | `.sidenote-num`（行482） | `600`/无字体 | §6.2 `400`/`et-book-roman-old-style` | P1 |
| G16 | `.sidenote` 移动（行514+） | 灰/小 | §6.3 `1.1rem/--text` | **P0** |
| G17 | hover（行489） | `4px`/无延迟 | §6.4 `5px`/`--highlight-weak/-strong`/延迟 | P2 |
| G18 | `.post-meta`（行366） | 旧类名 | §5.1 `.article-byline`（统一类名）值 | P1 |
| G19 | blockquote | — | §5.2 | P2 |
| G20 | `table`（行381，`width:100%`） | 无 hover/暗色 | §5.3 `width:55%` + hover + token | P1 |
| G21 | `figure[role=math]` | 部分 | §5.4 | P1 |
| G22 | bibliography | class 假设 | §5.5（先 grep 确认 role vs class） | **P0** |
| G23 | TOC CSS | 无 | §7.2 粘贴 | P1 |
| G24 | 移动端 | 缺 hyphens | §5.4 `@media(max-width:760px){p{hyphens:auto}}` | P2 |

### `src/pages/blog/[...slug].astro`
- **B（P0 单点根因）**：`<Content/>` 外包 `<section>`：
  ```astro
  <article class="blog-post">
    <h1>{post.data.title}</h1>
    <p class="article-byline">…</p>
    <section><Content /></section>   <!-- 使 section>p + toc.js 的 article>section 命中 -->
  </article>
  ```
- 引入 `<script src="/toc.js" is:inline></script>`（§7.3）。

### `src/layouts/BaseLayout.astro`
- 确认 `@font-face` 通过 global.css 全局生效（无需额外 `<link>`，字体走 CSS `src:url`）；若用 `<link rel="preload">` 优化首屏可选加 et-book-roman-line 的 woff preload。
- 确认 header/footer 在 `.blog-wrapper` 外，不吃 `padding-left:12.5%`（§5.6）。

### `src/plugins/remark-sidenotes.ts`
- §6.5：`href="#"` → 双向锚 `href="#sn-N"` + `id="snref-N"` + `.sidenote-num` 升级为 `<a>`。
- **不改**字面量编号机制、不改 `.sidenote*` 类名。

### 新建 `public/toc.js`
- §7.1 全文。

### 构建期（推荐）`.heading-en` rehype 插件
- 遍历 h1–h6 文本节点，按连续 ASCII run 包 `<span class="heading-en">`。图快可改用客户端 `format-headings.js`。

---

## 10. 验收检查

**构建/功能：**
1. `npm run build`（或 `pnpm build`）通过，无 CSS / Astro 报错。
2. DevTools Network：`/fonts/et-book/et-book-roman-line-figures.woff` 等 4 个文件 **200**（非 404）；`document.fonts` 含 `et-book`。
3. 文章页 DOM：`article.blog-post > section > p` 存在（§9-B 已加 section）；`<sup class="sidenote-ref">` 的 `<a href="#sn-N">`（非 `href="#"`）。
4. 含 ≥3 个 h3 的文章：左侧出现 `.toc-sidebar`（≥1200px），点击平滑滚动 + hash 更新 + scroll-spy 高亮当前节；<1200px 不出现；参考文献标题**不**进 TOC。

**视觉对照 live（逐点）：**
5. 正文字号 ≈ **19.6px**（不是 14px）；正文是 **et-book**（衬线带旧式数字，非 Charter）。
6. 三栏：左 TOC `[1%~11.5%]` ｜正文列起于视口 ~12.5% ｜边注浮在正文右侧、不溢出视口、间隙约 10% 列宽。
7. 边注字号 ≈ **15.4px**、**正文色**（非灰）、`line-height:1.3`；hover 上标药丸与边注双向高亮。
8. 标题 **bold + 正体**（h2 中文不歪），标题内英文/数字段为 **et-book 斜体**（`.heading-en`，非合成倾斜）。
9. inline code / 代码块字号 ≈ **16.8px**（不再偏小）；标题内 code 不爆大。
10. dark 模式（`html.dark`）：bg `#151515` / text `#ddd`，TOC、表格、边注、code 颜色随 token 切换正常。
11. 移动端 <760px：边注变 100% 内联卡片（默认展开）、图片/表格/math 全宽、正文 `hyphens:auto` 无巨大词间空隙。
