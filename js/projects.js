/**
 * Loads projects from data/projects.json and renders cards, filters, and detail modal.
 */

const PROJECTS_URL = "data/projects.json";

let allProjects = [];
let activeTag = "all";

const els = {
  grid: document.getElementById("projects-grid"),
  filters: document.getElementById("project-filters"),
  empty: document.getElementById("projects-empty"),
  error: document.getElementById("projects-error"),
  modal: document.getElementById("project-modal"),
  modalTitle: document.getElementById("project-modal-title"),
  modalBody: document.getElementById("project-modal-body"),
  modalClose: document.querySelector("#project-modal [data-modal-close]"),
  lightbox: document.getElementById("gallery-lightbox"),
  lightboxImg: document.getElementById("gallery-lightbox-img"),
  lightboxCaption: document.getElementById("gallery-lightbox-caption"),
};

function sortProjects(projects) {
  return [...projects].sort((a, b) => {
    const orderA = a.order ?? 999;
    const orderB = b.order ?? 999;
    if (orderA !== orderB) return orderA - orderB;
    return (a.title || "").localeCompare(b.title || "");
  });
}

function collectTags(projects) {
  const tags = new Set();
  for (const project of projects) {
    for (const tag of project.tags || []) {
      tags.add(tag);
    }
  }
  return [...tags].sort((a, b) => a.localeCompare(b));
}

function projectMatchesTag(project, tag) {
  if (tag === "all") return true;
  return (project.tags || []).includes(tag);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function renderTags(tags, { clickable = false, projectId = null } = {}) {
  if (!tags?.length) return "";
  const items = tags
    .map((tag) => {
      const label = escapeHtml(tag);
      if (clickable) {
        return `<li><button type="button" class="tag-filter" data-tag="${label}">${label}</button></li>`;
      }
      return `<li>${label}</li>`;
    })
    .join("");
  const aria = projectId ? "" : ' aria-label="Technologies"';
  return `<ul class="tags"${aria}>${items}</ul>`;
}

function pickCardImage(project) {
  if (project.thumbnail?.src) return project.thumbnail;
  const images = project.images || [];
  return images.find((img) => img.type !== "video" && img.src) || images[0];
}

function renderCardImage(project) {
  const img = pickCardImage(project);
  if (!img?.src) return "";
  const alt = escapeHtml(img.alt || "");
  const src = escapeHtml(img.src);
  return `<div class="project-card-media"><img src="${src}" alt="${alt}" loading="lazy" width="400" height="225"></div>`;
}

function renderCardLinks(project) {
  const links = [];
  if (project.github) {
    links.push(
      `<a href="${escapeHtml(project.github)}" target="_blank" rel="noopener noreferrer">Source</a>`
    );
  }
  if (project.demo) {
    links.push(
      `<a href="${escapeHtml(project.demo)}" target="_blank" rel="noopener noreferrer">Live demo</a>`
    );
  }
  if (!links.length) return "";
  return `<div class="card-links">${links.join("")}</div>`;
}

function renderProjectCard(project) {
  const blurb = escapeHtml(project.blurb || "");
  const title = escapeHtml(project.title || "Untitled");
  const id = escapeHtml(project.id || title);

  return `
    <article class="project-card" data-project-id="${id}" data-tags="${escapeHtml((project.tags || []).join(","))}">
      ${renderCardImage(project)}
      <div class="project-card-body">
        <h3>${title}</h3>
        <p>${blurb}</p>
        ${renderTags(project.tags)}
        <div class="project-card-actions">
          <button type="button" class="btn btn-details" data-open-project="${id}">View details</button>
        </div>
        ${renderCardLinks(project)}
      </div>
    </article>
  `;
}

function renderFilterBar(tags) {
  const buttons = [
    `<button type="button" class="tag-filter is-active" data-tag="all">All</button>`,
    ...tags.map(
      (tag) =>
        `<button type="button" class="tag-filter" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</button>`
    ),
  ];
  els.filters.innerHTML = buttons.join("");
  els.filters.hidden = tags.length === 0;
}

const PIPELINE_STEP_ORDER = ["input", "preprocessed", "threshold", "regions", "features"];

function renderGalleryFigure(img) {
  if (!img?.src) return "";
  const alt = escapeHtml(img.alt || "");
  const src = escapeHtml(img.src);
  const caption = img.caption ? `<figcaption>${escapeHtml(img.caption)}</figcaption>` : "";

  if (img.type === "video") {
    return `
      <figure class="project-gallery-item project-gallery-item--video">
        <video src="${src}" controls playsinline preload="metadata" aria-label="${alt}"></video>
        ${caption}
      </figure>
    `;
  }

  const captionText = img.caption || img.alt || "";
  return `
    <figure class="project-gallery-item">
      <button
        type="button"
        class="gallery-expand-btn"
        data-lightbox-src="${src}"
        data-lightbox-alt="${alt}"
        data-lightbox-caption="${escapeHtml(captionText)}"
        aria-label="View full screen${alt ? `: ${alt}` : ""}"
      >
        <img src="${src}" alt="${alt}" loading="lazy">
      </button>
      ${caption}
    </figure>
  `;
}

function renderPipelineGroup(groupTitle, steps) {
  const sorted = [...steps].sort(
    (a, b) =>
      PIPELINE_STEP_ORDER.indexOf(a.step) - PIPELINE_STEP_ORDER.indexOf(b.step)
  );
  const figures = sorted.map(renderGalleryFigure).join("");
  if (!figures) return "";
  const heading = groupTitle
    ? `<h4 class="project-pipeline-title">${escapeHtml(groupTitle)}</h4>`
    : "";
  return `
    <section class="project-pipeline">
      ${heading}
      <div class="project-pipeline-steps">${figures}</div>
    </section>
  `;
}

function renderGallery(images) {
  if (!images?.length) return "";

  const blocks = [];
  let pipelineBuffer = [];
  let pipelineTitle = "";

  const flushPipeline = () => {
    if (!pipelineBuffer.length) return;
    blocks.push(renderPipelineGroup(pipelineTitle, pipelineBuffer));
    pipelineBuffer = [];
    pipelineTitle = "";
  };

  for (const img of images) {
    if (img.group) {
      if (pipelineBuffer.length && img.groupTitle && img.groupTitle !== pipelineTitle) {
        flushPipeline();
      }
      if (!pipelineTitle && img.groupTitle) pipelineTitle = img.groupTitle;
      pipelineBuffer.push(img);
      continue;
    }
    flushPipeline();
    blocks.push(renderGalleryFigure(img));
  }
  flushPipeline();

  const content = blocks.filter(Boolean).join("");
  if (!content) return "";
  return `<div class="project-gallery">${content}</div>`;
}

function renderModalContent(project) {
  const title = escapeHtml(project.title || "Project");
  const paragraphs = (project.description || [])
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join("");

  const blurb = project.blurb
    ? `<p class="project-modal-blurb">${escapeHtml(project.blurb)}</p>`
    : "";

  const links = [];
  if (project.github) {
    links.push(
      `<a class="btn" href="${escapeHtml(project.github)}" target="_blank" rel="noopener noreferrer">GitHub</a>`
    );
  }
  if (project.demo) {
    links.push(
      `<a class="btn" href="${escapeHtml(project.demo)}" target="_blank" rel="noopener noreferrer">Live demo</a>`
    );
  }

  return `
    ${renderGallery(project.images)}
    ${blurb}
    <div class="project-modal-description">${paragraphs}</div>
    ${renderTags(project.tags)}
    ${links.length ? `<div class="link-row project-modal-links">${links.join("")}</div>` : ""}
  `;
}

function getVisibleProjects() {
  return sortProjects(allProjects).filter((p) => projectMatchesTag(p, activeTag));
}

function updateGrid() {
  const visible = getVisibleProjects();
  els.grid.innerHTML = visible.map(renderProjectCard).join("");
  els.empty.hidden = visible.length > 0;
  els.grid.hidden = visible.length === 0;
}

function setActiveFilter(tag) {
  activeTag = tag;
  for (const btn of els.filters.querySelectorAll(".tag-filter")) {
    btn.classList.toggle("is-active", btn.dataset.tag === tag);
  }
  updateGrid();
}

function findProject(id) {
  return allProjects.find((p) => p.id === id);
}

function openModal(project) {
  els.modalTitle.textContent = project.title || "Project";
  els.modalBody.innerHTML = renderModalContent(project);
  els.modal.hidden = false;
  document.body.classList.add("modal-open");
  els.modalClose.focus();
}

function closeModal() {
  closeLightbox();
  els.modal.hidden = true;
  document.body.classList.remove("modal-open");
  els.modalBody.innerHTML = "";
}

function openLightbox(trigger) {
  if (!els.lightbox || !els.lightboxImg) return;
  const src = trigger.dataset.lightboxSrc;
  if (!src) return;

  els.lightboxImg.src = src;
  els.lightboxImg.alt = trigger.dataset.lightboxAlt || "";
  const caption = trigger.dataset.lightboxCaption || "";
  els.lightboxCaption.textContent = caption;
  els.lightboxCaption.hidden = !caption;

  els.lightbox.hidden = false;
  document.body.classList.add("lightbox-open");
  els.lightbox.querySelector("[data-lightbox-close]")?.focus();
}

function closeLightbox() {
  if (!els.lightbox || els.lightbox.hidden) return;
  els.lightbox.hidden = true;
  document.body.classList.remove("lightbox-open");
  els.lightboxImg.src = "";
  els.lightboxCaption.textContent = "";
}

function bindEvents() {
  els.filters.addEventListener("click", (e) => {
    const btn = e.target.closest(".tag-filter");
    if (!btn) return;
    setActiveFilter(btn.dataset.tag);
  });

  els.grid.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-open-project]");
    if (!btn) return;
    const project = findProject(btn.dataset.openProject);
    if (project) openModal(project);
  });

  els.modal.addEventListener("click", (e) => {
    if (e.target.matches("[data-modal-close]") || e.target === els.modal.querySelector(".modal-backdrop")) {
      closeModal();
    }
  });

  els.modalBody.addEventListener("click", (e) => {
    const trigger = e.target.closest(".gallery-expand-btn");
    if (!trigger) return;
    openLightbox(trigger);
  });

  els.lightbox?.addEventListener("click", (e) => {
    if (e.target.matches("[data-lightbox-close]")) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (els.lightbox && !els.lightbox.hidden) {
      closeLightbox();
      return;
    }
    if (!els.modal.hidden) closeModal();
  });
}

async function loadProjects() {
  els.error.hidden = true;
  try {
    const res = await fetch(PROJECTS_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    allProjects = sortProjects(data.projects || []);
    renderFilterBar(collectTags(allProjects));
    updateGrid();
    bindEvents();
  } catch (err) {
    console.error("Failed to load projects:", err);
    els.error.hidden = false;
    els.grid.hidden = true;
    els.filters.hidden = true;
    els.empty.hidden = true;
  }
}

loadProjects();
