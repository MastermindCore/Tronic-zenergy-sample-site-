async function loadClasses() {
  await window.TZ_FIREBASE.initFirebase();
  const modules = window.TZ_FIREBASE.DEMO_MODE
    ? window.TZ_DEMO.classes.modules
    : await fetchModulesFromRtdb();

  const list = document.getElementById("module-list");
  list.innerHTML = "";

  modules.forEach((mod) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <span class="tag tag-cyan">${mod.level}</span>
      <h3 style="margin:10px 0 6px">${mod.title}</h3>
      <p>${mod.summary}</p>
      <ul style="padding-left:18px;color:var(--gray);margin:0 0 16px">
        ${mod.topics.map((t) => `<li>${t.title}</li>`).join("")}
      </ul>
      <div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid var(--line);padding-top:14px">
        <span class="mono" style="color:var(--white);font-weight:600">$${mod.priceUsd}</span>
        <a class="btn btn-primary" href="dashboard.html?buy=${mod.id}">Enroll</a>
      </div>
    `;
    list.appendChild(card);
  });
}

async function fetchModulesFromRtdb() {
  const { rtdb, dbMod } = window.__tz;
  const snap = await dbMod.get(dbMod.ref(rtdb, "modules"));
  if (!snap.exists()) return [];
  return Object.entries(snap.val())
    .map(([id, v]) => ({ id, ...v, topics: Array.isArray(v.topics) ? v.topics : Object.entries(v.topics || {}).map(([tid, t]) => ({ id: tid, ...t })) }))
    .sort((a, b) => a.order - b.order);
}

document.addEventListener("DOMContentLoaded", loadClasses);
