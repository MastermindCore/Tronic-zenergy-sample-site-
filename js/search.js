/**
 * Site-wide search. Pulls from classes (modules/topics), projects, and
 * news so a search from any page's nav can jump straight to the result.
 */

async function tzSearch(query) {
  await window.TZ_FIREBASE.initFirebase();
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const [modules, projects, news] = await Promise.all([
    window.TZ_FIREBASE.DEMO_MODE ? window.TZ_DEMO.classes.modules : fetchModules(),
    window.TZ_FIREBASE.DEMO_MODE ? window.TZ_DEMO.projects.items : fetchProjects(),
    window.TZ_FIREBASE.DEMO_MODE ? window.TZ_DEMO.news : fetchNews(),
  ]);

  const results = [];

  modules.forEach((m) => {
    if (m.title.toLowerCase().includes(q) || m.summary.toLowerCase().includes(q)) {
      results.push({ type: "Class", title: m.title, href: `classes.html` });
    }
    (m.topics || []).forEach((t) => {
      if (t.title.toLowerCase().includes(q)) {
        results.push({ type: "Lesson", title: t.title, href: `classes.html` });
      }
    });
  });

  projects.forEach((p) => {
    if (p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) {
      results.push({ type: "Project", title: p.title, href: `projects.html` });
    }
  });

  news.forEach((n) => {
    if (n.title.toLowerCase().includes(q) || n.summary.toLowerCase().includes(q)) {
      results.push({ type: "Article", title: n.title, href: `news.html` });
    }
  });

  return results.slice(0, 12);
}

async function fetchModules() {
  const { rtdb, dbMod } = window.__tz;
  const snap = await dbMod.get(dbMod.ref(rtdb, "modules"));
  if (!snap.exists()) return [];
  return Object.entries(snap.val()).map(([id, v]) => ({ id, topics: Object.values(v.topics || {}), ...v }));
}
async function fetchProjects() {
  const { rtdb, dbMod } = window.__tz;
  const snap = await dbMod.get(dbMod.ref(rtdb, "projects"));
  return snap.exists() ? Object.entries(snap.val()).map(([id, v]) => ({ id, ...v })) : [];
}
async function fetchNews() {
  const { rtdb, dbMod } = window.__tz;
  const snap = await dbMod.get(dbMod.ref(rtdb, "news"));
  return snap.exists() ? Object.entries(snap.val()).map(([id, v]) => ({ id, ...v })) : [];
}

function wireSiteSearch() {
  const input = document.getElementById("site-search-input");
  const results = document.getElementById("site-search-results");
  if (!input || !results) return;

  let debounceTimer = null;
  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    const value = input.value.trim();
    if (!value) { results.style.display = "none"; results.innerHTML = ""; return; }
    debounceTimer = setTimeout(async () => {
      const hits = await tzSearch(value);
      results.innerHTML = hits.length
        ? hits.map((h) => `<a href="${h.href}" class="search-result-row"><span class="tag tag-cyan">${h.type}</span><span>${h.title}</span></a>`).join("")
        : `<div style="padding:12px;color:var(--gray-dim);font-size:0.88rem">No matches yet.</div>`;
      results.style.display = "block";
    }, 200);
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-box")) results.style.display = "none";
  });
}

document.addEventListener("DOMContentLoaded", wireSiteSearch);
