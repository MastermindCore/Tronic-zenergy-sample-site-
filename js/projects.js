let ALL_PROJECTS = [];
let ACTIVE_CATEGORY = "All";

async function loadProjects() {
  await window.TZ_FIREBASE.initFirebase();
  const data = window.TZ_FIREBASE.DEMO_MODE
    ? window.TZ_DEMO.projects
    : await fetchProjectsFromRtdb();

  ALL_PROJECTS = data.items;
  renderCategoryChips(["All", ...data.categories]);
  renderProjects();

  document.getElementById("project-search").addEventListener("input", renderProjects);
}

async function fetchProjectsFromRtdb() {
  const { rtdb, dbMod } = window.__tz;
  const [catSnap, itemSnap] = await Promise.all([
    dbMod.get(dbMod.ref(rtdb, "projectCategories")),
    dbMod.get(dbMod.ref(rtdb, "projects")),
  ]);
  const categories = catSnap.exists() ? Object.values(catSnap.val()) : [];
  const items = itemSnap.exists() ? Object.entries(itemSnap.val()).map(([id, v]) => ({ id, ...v })) : [];
  return { categories, items };
}

function renderCategoryChips(categories) {
  const row = document.getElementById("category-chips");
  row.innerHTML = "";
  categories.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = "tag" + (cat === ACTIVE_CATEGORY ? " tag-electric" : "");
    btn.style.cursor = "pointer";
    btn.style.border = cat === ACTIVE_CATEGORY ? "1px solid var(--electric)" : "1px solid var(--line-strong)";
    btn.textContent = cat;
    btn.addEventListener("click", () => {
      ACTIVE_CATEGORY = cat;
      renderCategoryChips(categories);
      renderProjects();
    });
    row.appendChild(btn);
  });
}

function renderProjects() {
  const grid = document.getElementById("project-grid");
  const q = document.getElementById("project-search").value.trim().toLowerCase();

  const filtered = ALL_PROJECTS.filter((p) => {
    const matchesCategory = ACTIVE_CATEGORY === "All" || p.category === ACTIVE_CATEGORY;
    const matchesQuery = !q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  grid.innerHTML = "";
  if (!filtered.length) {
    grid.innerHTML = `<p>No projects match that search yet.</p>`;
    return;
  }

  filtered.forEach((p) => {
    const card = document.createElement("div");
    card.className = "card hoverable";
    card.innerHTML = `
      <div class="thumb">
        ${p.youtubeId
          ? `<img src="https://img.youtube.com/vi/${p.youtubeId}/hqdefault.jpg" alt="" style="width:100%;height:100%;object-fit:cover">`
          : `<svg viewBox="0 0 24 24" fill="none" stroke="#2F8FFF" stroke-width="1.4"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>`
        }
        ${p.youtubeId ? `<a class="play" href="https://youtube.com/watch?v=${p.youtubeId}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="#fff"><circle cx="12" cy="12" r="11" fill="rgba(7,11,18,0.6)"/><path d="M10 8l6 4-6 4z"/></svg></a>` : ""}
      </div>
      <span class="tag tag-cyan" style="margin:14px 0 8px">${p.category}</span>
      <h3 style="margin-bottom:6px">${p.title}</h3>
      <p style="margin:0">${p.description}</p>
    `;
    grid.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", loadProjects);
