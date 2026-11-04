document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector(".site-nav");
  const toggle = document.querySelector(".nav-toggle");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }
  const links = document.querySelector(".nav-links");
  const actionLinks = document.querySelectorAll(".nav-actions a, .nav-actions button");
  if (links) {
    actionLinks.forEach((el) => {
      const li = document.createElement("li");
      li.className = "mobile-only";
      const a = document.createElement(el.tagName === "A" ? "a" : "a");
      a.textContent = el.textContent;
      a.href = el.getAttribute("href") || "#";
      if (el.id === "logout-btn") a.addEventListener("click", (e) => { e.preventDefault(); el.click(); });
      li.appendChild(a);
      links.appendChild(li);
    });
  }
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
});
