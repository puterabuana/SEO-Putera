const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");

function closeNavigation() {
  if (!navToggle || !nav) return;
  navToggle.setAttribute("aria-expanded", "false");
  nav.classList.remove("is-open");
  document.body.classList.remove("nav-open");
}

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const open = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!open));
    nav.classList.toggle("is-open", !open);
    document.body.classList.toggle("nav-open", !open);
  });

  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeNavigation();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNavigation();
  });
}

const revealItems = document.querySelectorAll(".reveal");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (reducedMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -6% 0px", threshold: 0.08 }
  );

  revealItems.forEach((item) => observer.observe(item));
}

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});

const projectCards = [...document.querySelectorAll("[data-project-card]")];
const filterButtons = document.querySelectorAll("[data-filter]");
const filterStatus = document.querySelector("[data-filter-status]");

document.querySelectorAll("[data-project-total]").forEach((element) => {
  element.textContent = String(projectCards.length).padStart(2, "0");
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selected = button.dataset.filter || "all";
    let visible = 0;

    filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    projectCards.forEach((card) => {
      const categories = (card.dataset.categories || "").split(",");
      const match = selected === "all" || categories.includes(selected);
      card.hidden = !match;
      if (match) visible += 1;
    });

    if (filterStatus) {
      filterStatus.textContent = `${visible} project${visible === 1 ? "" : "s"} shown for ${selected === "all" ? "all categories" : selected}.`;
    }
  });
});

document.querySelectorAll("[data-accordion] .faq-item button").forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.closest(".faq-item");
    const answer = item?.querySelector(".faq-answer");
    if (!item || !answer) return;

    const willOpen = button.getAttribute("aria-expanded") !== "true";

    document.querySelectorAll("[data-accordion] .faq-item").forEach((entry) => {
      entry.classList.remove("is-open");
      entry.querySelector("button")?.setAttribute("aria-expanded", "false");
      const entryAnswer = entry.querySelector(".faq-answer");
      if (entryAnswer) entryAnswer.hidden = true;
    });

    if (willOpen) {
      item.classList.add("is-open");
      button.setAttribute("aria-expanded", "true");
      answer.hidden = false;
    }
  });
});

const dialog = document.querySelector("[data-lightbox-dialog]");
const dialogImage = document.querySelector("[data-lightbox-target]");
const closeButton = document.querySelector("[data-lightbox-close]");

if (dialog && dialogImage && typeof dialog.showModal === "function") {
  document.querySelectorAll("[data-lightbox]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      dialogImage.src = trigger.dataset.image;
      dialogImage.alt = trigger.dataset.alt || "SEO audit evidence";
      dialog.showModal();
    });
  });

  closeButton?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}
