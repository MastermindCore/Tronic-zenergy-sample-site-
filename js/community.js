async function loadCommunity() {
  await window.TZ_FIREBASE.initFirebase();

  const posts = window.TZ_FIREBASE.DEMO_MODE
    ? JSON.parse(localStorage.getItem("tz_demo_community") || "[]")
    : await fetchApprovedPosts();

  renderPosts(posts);

  document.getElementById("post-form").addEventListener("submit", handleSubmit);
}

async function fetchApprovedPosts() {
  const { rtdb, dbMod } = window.__tz;
  const snap = await dbMod.get(dbMod.ref(rtdb, "communityPosts"));
  if (!snap.exists()) return [];
  return Object.entries(snap.val())
    .map(([id, v]) => ({ id, ...v }))
    .filter((p) => p.status === "approved");
}

function renderPosts(posts) {
  const grid = document.getElementById("community-grid");
  grid.innerHTML = "";
  if (!posts.length) {
    grid.innerHTML = `<p>No posts yet, be the first to share what you've built.</p>`;
    return;
  }
  posts.slice().reverse().forEach((p) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      ${p.imageUrl ? `<div class="thumb" style="margin-bottom:14px"><img src="${p.imageUrl}" alt="" style="width:100%;height:100%;object-fit:cover"></div>` : ""}
      <h3 style="margin-bottom:6px">${p.title}</h3>
      <p style="margin:0">${p.caption}</p>
      <p class="form-note" style="margin-top:10px">by ${p.name}</p>
    `;
    grid.appendChild(card);
  });
}

async function handleSubmit(e) {
  e.preventDefault();
  const title = document.getElementById("post-title").value.trim();
  const caption = document.getElementById("post-caption").value.trim();
  const imageUrl = document.getElementById("post-image").value.trim();
  const statusEl = document.getElementById("post-status");

  await window.TZ_FIREBASE.initFirebase();
  const user = await window.TZ_AUTH.tzCurrentUser();
  if (!user) {
    statusEl.textContent = "Log in first to post to the community wall.";
    statusEl.style.display = "block";
    return;
  }

  if (window.TZ_FIREBASE.DEMO_MODE) {
    const posts = JSON.parse(localStorage.getItem("tz_demo_community") || "[]");
    posts.push({ title, caption, imageUrl, name: user.name || user.displayName, status: "approved" });
    localStorage.setItem("tz_demo_community", JSON.stringify(posts));
    renderPosts(posts);
    statusEl.textContent = "Demo mode: your post is live immediately. In production it waits for Ezra to approve it first.";
    statusEl.style.display = "block";
    e.target.reset();
    return;
  }

  const { rtdb, dbMod } = window.__tz;
  await dbMod.push(dbMod.ref(rtdb, "communityPosts"), {
    title, caption, imageUrl,
    name: user.displayName, uid: user.uid,
    status: "pending",
    createdAt: dbMod.serverTimestamp(),
  });
  statusEl.textContent = "Posted. It'll appear here once Ezra approves it.";
  statusEl.style.display = "block";
  e.target.reset();
}

document.addEventListener("DOMContentLoaded", loadCommunity);
