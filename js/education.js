const EDUCATION_URL = "data/education.json";

const els = {
  list: document.getElementById("education-list"),
  error: document.getElementById("education-error"),
};

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function formatDateRange(startDate, endDate) {
  const fmt = (value) => {
    const [year, month] = String(value).split("-").map(Number);
    if (!year) return value || "";
    const date = new Date(year, (month || 1) - 1);
    return date.toLocaleString("en-US", { month: "short", year: "numeric" });
  };
  return `${fmt(startDate)} to ${fmt(endDate)}`;
}

function sortEducation(items) {
  return [...items].sort((a, b) => {
    const orderA = a.order ?? 999;
    const orderB = b.order ?? 999;
    if (orderA !== orderB) return orderA - orderB;
    return (b.endDate || "").localeCompare(a.endDate || "");
  });
}

function renderEducationItem(item) {
  const school = escapeHtml(item.school || "");
  const degree = escapeHtml(item.degree || "");
  const dates = escapeHtml(formatDateRange(item.startDate, item.endDate));
  const location = item.location
    ? `<span class="experience-location">${escapeHtml(item.location)}</span>`
    : "";

  return `
    <article class="experience-item">
      <div class="experience-header">
        <div class="experience-heading">
          <h3 class="experience-role">${degree}</h3>
          <p class="experience-company">${school}</p>
        </div>
        <div class="experience-meta">
          <time class="experience-dates" datetime="${escapeHtml(item.startDate || "")}/${escapeHtml(item.endDate || "")}">${dates}</time>
          ${location}
        </div>
      </div>
    </article>
  `;
}

async function loadEducation() {
  els.error.hidden = true;
  try {
    const res = await fetch(EDUCATION_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const items = sortEducation(data.education || []);
    els.list.innerHTML = items.map(renderEducationItem).join("");
    els.list.hidden = items.length === 0;
  } catch (err) {
    console.error("Failed to load education:", err);
    els.error.hidden = false;
    els.list.hidden = true;
  }
}

function updateCollapseLabel() {
  const details = document.getElementById("education-details");
  const label = details?.querySelector(".section-collapse-label");
  if (!label) return;
  label.textContent = details.open ? "Hide degrees" : "Show degrees";
}

function syncEducationFromHash() {
  const details = document.getElementById("education-details");
  if (details && location.hash === "#education") {
    details.open = true;
  }
  updateCollapseLabel();
}

const detailsEl = document.getElementById("education-details");
detailsEl?.addEventListener("toggle", updateCollapseLabel);

syncEducationFromHash();
window.addEventListener("hashchange", syncEducationFromHash);

loadEducation();
