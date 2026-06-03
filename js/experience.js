/**
 * Loads work experience from data/experience.json (story-first cards + detail modal).
 */

const EXPERIENCE_URL = "data/experience.json";

let allExperience = [];

const els = {
  list: document.getElementById("experience-list"),
  error: document.getElementById("experience-error"),
  modal: document.getElementById("experience-modal"),
  modalTitle: document.getElementById("experience-modal-title"),
  modalBody: document.getElementById("experience-modal-body"),
  modalClose: document.querySelector("#experience-modal [data-modal-close]"),
};

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function parseYearMonth(value) {
  if (!value || value === "Present") return null;
  const [year, month] = String(value).split("-").map(Number);
  if (!year) return null;
  return { year, month: month || 1 };
}

function formatDateRange(startDate, endDate) {
  const start = parseYearMonth(startDate);
  const end = endDate === "Present" ? null : parseYearMonth(endDate);
  const fmt = (d) => {
    if (!d) return "";
    const date = new Date(d.year, d.month - 1);
    return date.toLocaleString("en-US", { month: "short", year: "numeric" });
  };
  const startStr = fmt(start) || startDate || "";
  const endStr = endDate === "Present" ? "Present" : fmt(end) || endDate || "";
  return `${startStr} to ${endStr}`.trim();
}

function sortExperience(items) {
  return [...items].sort((a, b) => {
    const orderA = a.order ?? 999;
    const orderB = b.order ?? 999;
    if (orderA !== orderB) return orderA - orderB;

    const endA = a.endDate === "Present" ? "9999-12" : a.endDate || "";
    const endB = b.endDate === "Present" ? "9999-12" : b.endDate || "";
    if (endA !== endB) return endB.localeCompare(endA);

    return (b.startDate || "").localeCompare(a.startDate || "");
  });
}

function renderTags(tags) {
  if (!tags?.length) return "";
  const items = tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("");
  return `<ul class="tags" aria-label="Topics">${items}</ul>`;
}

function renderExperienceItem(item) {
  const company = escapeHtml(item.company || "Company");
  const role = escapeHtml(item.role || "Role");
  const dates = escapeHtml(formatDateRange(item.startDate, item.endDate));
  const location = item.location ? `<span class="experience-location">${escapeHtml(item.location)}</span>` : "";
  const blurb = escapeHtml(item.blurb || "");
  const id = escapeHtml(item.id || "");
  const hasStories = (item.stories || []).length > 0;

  const companyHtml = item.url
    ? `<a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">${company}</a>`
    : company;

  const storyBtn = hasStories
    ? `<button type="button" class="btn btn-details" data-open-experience="${id}">Read the story</button>`
    : "";

  return `
    <article class="experience-item">
      <div class="experience-header">
        <div class="experience-heading">
          <h3 class="experience-role">${role}</h3>
          <p class="experience-company">${companyHtml}</p>
        </div>
        <div class="experience-meta">
          <time class="experience-dates" datetime="${escapeHtml(item.startDate || "")}/${escapeHtml(item.endDate || "")}">${dates}</time>
          ${location}
        </div>
      </div>
      <p class="experience-blurb">${blurb}</p>
      ${storyBtn ? `<div class="experience-card-actions">${storyBtn}</div>` : ""}
      ${renderTags(item.tags)}
    </article>
  `;
}

function renderModalStories(stories) {
  return (stories || [])
    .map((story) => {
      const title = story.title
        ? `<h3 class="story-chapter-title">${escapeHtml(story.title)}</h3>`
        : "";
      const paragraphs = (story.paragraphs || [])
        .map((p) => `<p>${escapeHtml(p)}</p>`)
        .join("");
      return `<section class="story-chapter">${title}${paragraphs}</section>`;
    })
    .join("");
}

function findExperience(id) {
  return allExperience.find((item) => item.id === id);
}

function openModal(item) {
  els.modalTitle.textContent = `${item.role} · ${item.company}`;
  els.modalBody.innerHTML = renderModalStories(item.stories);
  els.modal.hidden = false;
  document.body.classList.add("modal-open");
  els.modalClose?.focus();
}

function closeModal() {
  els.modal.hidden = true;
  document.body.classList.remove("modal-open");
  els.modalBody.innerHTML = "";
}

function bindEvents() {
  els.list.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-open-experience]");
    if (!btn) return;
    const item = findExperience(btn.dataset.openExperience);
    if (item) openModal(item);
  });

  els.modal?.addEventListener("click", (e) => {
    if (
      e.target.matches("[data-modal-close]") ||
      e.target === els.modal.querySelector(".modal-backdrop")
    ) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && els.modal && !els.modal.hidden) closeModal();
  });
}

async function loadExperience() {
  els.error.hidden = true;
  try {
    const res = await fetch(EXPERIENCE_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    allExperience = sortExperience(data.experience || []);
    els.list.innerHTML = allExperience.map(renderExperienceItem).join("");
    els.list.hidden = allExperience.length === 0;
    bindEvents();
  } catch (err) {
    console.error("Failed to load experience:", err);
    els.error.hidden = false;
    els.list.hidden = true;
  }
}

loadExperience();
