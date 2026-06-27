/* Tufted left-fixed TOC — ported from Tufted Blog Template, adapted for .blog-post + html.dark */
(() => {
  const MIN_HEADINGS = 3;

  function collectHeadings(root) {
    return Array.from(root.querySelectorAll("h2")).filter(
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
    nav.setAttribute("aria-label", "Table of contents");
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
      const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", link.hash);
    });
  }

  // Citation links ([1] in body ⇄ [N] in bibliography) jump INSTANTLY, bypassing
  // the global `html { scroll-behavior: smooth }` (which the TOC still uses).
  function bindCiteJump(root) {
    root.addEventListener("click", (event) => {
      const link = event.target.closest("a.cite");
      if (!link || !link.hash || !root.contains(link)) return;
      const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
      if (!target) return;
      event.preventDefault();
      const html = document.documentElement;
      const prev = html.style.scrollBehavior;
      html.style.scrollBehavior = "auto"; // override smooth → instant
      target.scrollIntoView({ block: "start" });
      history.replaceState(null, "", link.hash);
      requestAnimationFrame(() => { html.style.scrollBehavior = prev; });
    });
  }

  function bindScrollSpy(nav, headings) {
    // decode because link.hash percent-encodes non-ASCII (Chinese) ids, but heading.id is decoded
    const linksById = new Map(
      Array.from(nav.querySelectorAll("a")).map((l) => [decodeURIComponent(l.hash.slice(1)), l]),
    );
    function setActive(id) {
      nav.querySelector("a.is-active")?.classList.remove("is-active");
      linksById.get(id)?.classList.add("is-active");
    }
    setActive(headings[0].id);
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: "0px 0px -70% 0px", threshold: 0 },
    );
    headings.forEach((h) => observer.observe(h));
  }

  function init() {
    const root = document.querySelector("article.blog-post");
    if (!root) return;
    bindCiteJump(root); // citations jump instantly, independent of whether a TOC is built
    const headings = collectHeadings(root);
    if (headings.length < MIN_HEADINGS) return;
    const nav = buildToc(headings);
    document.body.insertBefore(nav, document.body.firstChild);
    bindSmoothScroll(nav);
    bindScrollSpy(nav, headings);
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();
