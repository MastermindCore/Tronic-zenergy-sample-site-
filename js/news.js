async function loadNews() {
  await window.TZ_FIREBASE.initFirebase();
  const articles = window.TZ_FIREBASE.DEMO_MODE
    ? window.TZ_DEMO.news
    : await fetchNewsFromRtdb();

  const list = document.getElementById("news-list");
  list.innerHTML = "";
  articles
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .forEach((a) => {
      const row = document.createElement("article");
      row.className = "card";
      row.style.marginBottom = "16px";
      const date = new Date(a.date + "T00:00:00");
      const dateStr = isNaN(date) ? a.date : date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
      row.innerHTML = `
        <span class="mono" style="color:var(--gray-dim);font-size:0.8rem">${dateStr}</span>
        <h3 style="margin:8px 0 8px">${a.title}</h3>
        <p style="margin-bottom:${a.sourceUrl ? "12px" : "0"}">${a.summary}</p>
        ${a.sourceUrl ? `<a class="btn btn-ghost" href="${a.sourceUrl}" target="_blank" rel="noopener">Read the source</a>` : ""}
      `;
      list.appendChild(row);
    });
}

async function fetchNewsFromRtdb() {
  const { rtdb, dbMod } = window.__tz;
  const snap = await dbMod.get(dbMod.ref(rtdb, "news"));
  return snap.exists() ? Object.entries(snap.val()).map(([id, v]) => ({ id, ...v })) : [];
}

document.addEventListener("DOMContentLoaded", loadNews);
