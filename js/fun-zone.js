let FACTS = [];
let LAST_INDEX = -1;

async function loadFunZone() {
  await window.TZ_FIREBASE.initFirebase();
  FACTS = window.TZ_FIREBASE.DEMO_MODE ? window.TZ_DEMO.facts : await fetchFactsFromRtdb();

  showRandomFact();
  renderFactList();

  document.getElementById("another-fact-btn").addEventListener("click", showRandomFact);
}

async function fetchFactsFromRtdb() {
  const { rtdb, dbMod } = window.__tz;
  const snap = await dbMod.get(dbMod.ref(rtdb, "funFacts"));
  return snap.exists() ? Object.values(snap.val()) : [];
}

function showRandomFact() {
  if (!FACTS.length) return;
  let i = Math.floor(Math.random() * FACTS.length);
  if (FACTS.length > 1 && i === LAST_INDEX) i = (i + 1) % FACTS.length;
  LAST_INDEX = i;
  document.getElementById("fact-display").textContent = FACTS[i];
}

function renderFactList() {
  const list = document.getElementById("fact-list");
  list.innerHTML = "";
  FACTS.forEach((f) => {
    const li = document.createElement("li");
    li.style.marginBottom = "14px";
    li.textContent = f;
    list.appendChild(li);
  });
}

document.addEventListener("DOMContentLoaded", loadFunZone);
