const SKILLS_URL = "data/skills.json";

const els = {
  grid: document.getElementById("skills-grid"),
  error: document.getElementById("skills-error"),
};

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function renderCategory(category) {
  const skills = (category.skills || [])
    .map((skill) => `<li>${escapeHtml(skill)}</li>`)
    .join("");
  return `
    <div class="skills-category">
      <h3>${escapeHtml(category.name || "")}</h3>
      <ul class="tags">${skills}</ul>
    </div>
  `;
}

async function loadSkills() {
  els.error.hidden = true;
  try {
    const res = await fetch(SKILLS_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const categories = data.categories || [];
    els.grid.innerHTML = categories.map(renderCategory).join("");
    els.grid.hidden = categories.length === 0;
  } catch (err) {
    console.error("Failed to load skills:", err);
    els.error.hidden = false;
    els.grid.hidden = true;
  }
}

loadSkills();
