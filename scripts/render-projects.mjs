import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const projects = JSON.parse(await readFile(join(root, "data/projects.json"), "utf8"));

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function replaceRegion(html, name, markup, relativePath) {
  const startMarker = `<!-- ${name}_START -->`;
  const endMarker = `<!-- ${name}_END -->`;
  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker);
  if (start === -1 || end === -1) return html;
  if (end < start) {
    throw new Error(`${relativePath}: ${name} markers are out of order`);
  }
  return `${html.slice(0, start + startMarker.length)}\n${markup}\n            ${html.slice(end)}`;
}

/* ---- Project cards (existing gallery) ---- */
function renderProject(project, index) {
  const categories = project.categories.map(escapeHtml).join(",");
  const categoryLabels = project.categories
    .map((category) => `<span>${escapeHtml(category)}</span>`)
    .join("");
  const score = project.primaryScore;
  const hasShowcase = Boolean(project.showcaseImage);
  const showcaseSrc = project.showcaseVersion
    ? `${project.showcaseImage}?v=${encodeURIComponent(project.showcaseVersion)}`
    : project.showcaseImage;
  const supportingScores = (project.supportingScores || [])
    .map((item) => `<span><small>${escapeHtml(item.tool)}</small><strong>${escapeHtml(item.value)}</strong></span>`)
    .join("");
  const projectVisual = hasShowcase
    ? `<img class="project-showcase-backdrop" src="${escapeHtml(showcaseSrc)}" alt="" aria-hidden="true" loading="${index === 0 ? "eager" : "lazy"}">
                  <div class="project-showcase-frame">
                    <img class="project-showcase-image" src="${escapeHtml(showcaseSrc)}" alt="${escapeHtml(project.showcaseAlt || `${project.name} website preview`)}" loading="${index === 0 ? "eager" : "lazy"}">
                  </div>
                  <div class="project-showcase-vignette" aria-hidden="true"></div>`
    : `<div class="project-browser" aria-hidden="true">
                    <div class="browser-chrome"><span></span><span></span><span></span><small>${escapeHtml(project.name)}</small></div>
                    <div class="project-thumb">
                      <div class="project-thumb-topline">
                        <span>${escapeHtml(score.tool)}</span>
                        <strong>${escapeHtml(score.value)}<small>/${escapeHtml(score.max)}</small></strong>
                      </div>
                      <div class="project-thumb-grid">
                        <i></i><i></i><i></i><i></i>
                      </div>
                      <div class="project-thumb-lines">
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                  </div>`;

  return `
            <article class="project-card reveal" data-project-card data-categories="${categories}">
              <a class="project-card-link" href="${escapeHtml(project.caseStudyUrl)}" aria-label="Open ${escapeHtml(project.name)} SEO case study">
                <div class="project-visual project-visual-${(index % 3) + 1}${hasShowcase ? " project-visual-showcase" : ""}">
                  ${projectVisual}
                  <div class="score-ticket">
                    <span>${escapeHtml(score.tool)}</span>
                    <strong>${escapeHtml(score.value)}<small>/${escapeHtml(score.max)}</small></strong>
                    <em>Verified</em>
                  </div>
                  <div class="score-stack" aria-label="Supporting audit scores">
                    ${supportingScores}
                  </div>
                </div>
                <div class="project-card-body">
                  <div>
                    <p class="project-index">${String(index + 1).padStart(2, "0")} / ${escapeHtml(project.dateLabel)}</p>
                    <h3>${escapeHtml(project.name)}</h3>
                    <p>${escapeHtml(project.summary)}</p>
                  </div>
                  <div class="project-card-meta">
                    <div class="tag-list">${categoryLabels}</div>
                    <span class="project-scope">${escapeHtml(project.scope)}</span>
                  </div>
                </div>
              </a>
            </article>`;
}

/* ---- Audit scoreboard (one row per site, all tool scores exposed) ---- */
function renderScoreRow(project, index) {
  const audits = project.audits || [];
  const isComparison = Boolean(project.comparison);
  const scoreColumnCount = Math.max(6, ...projects.map((item) => (item.audits || []).length));

  const chips = audits
    .map((audit) => {
      let deltaHtml = "";
      if (isComparison) {
        if (audit.delta != null) {
          if (audit.delta === 0) {
            deltaHtml = `\n                  <span class="score-delta is-same">unchanged</span>`;
          } else {
            const sign = audit.delta > 0 ? "+" : "";
            const cls = audit.delta > 0 ? "is-up" : "is-down";
            deltaHtml = `\n                  <span class="score-delta ${cls}">${sign}${audit.delta}${escapeHtml(audit.deltaUnit || "")}</span>`;
          }
        } else if (audit.deltaLabel) {
          deltaHtml = `\n                  <span class="score-delta is-up">${escapeHtml(audit.deltaLabel)}</span>`;
        }
      }
      return `
                <div class="score-chip${audit.primary ? " is-primary" : ""}">
                  <span class="score-chip-tool">${escapeHtml(audit.tool)}</span>
                  <strong class="score-chip-value">${escapeHtml(audit.display)}<small>${escapeHtml(audit.unit || "")}</small></strong>${deltaHtml}
                  <span class="score-chip-note">${escapeHtml(audit.note || "")}</span>
                </div>`;
    })
    .join("");
  const emptyChips = Array.from({ length: Math.max(0, scoreColumnCount - audits.length) }, () => `
                <div class="score-chip score-chip-empty" aria-hidden="true"></div>`).join("");

  const dateHtml = isComparison
    ? `Audited ${escapeHtml(project.dateBeforeLabel)} → ${escapeHtml(project.dateAfterLabel)} <span class="scoreboard-badge-comparison">Before → After</span>`
    : `Audited ${escapeHtml(project.dateLabel)}`;

  return `
            <article class="scoreboard-row reveal">
              <div class="scoreboard-site">
                <p class="scoreboard-index">${String(index + 1).padStart(2, "0")}</p>
                <div>
                  <h3>${escapeHtml(project.name)}</h3>
                  <p>${escapeHtml(project.type || "")} · ${escapeHtml(project.scope)}</p>
                  <p class="scoreboard-date">${dateHtml}</p>
                </div>
                <a class="scoreboard-link" href="${escapeHtml(project.caseStudyUrl)}" aria-label="Open ${escapeHtml(project.name)} evidence">Evidence <span aria-hidden="true">→</span></a>
              </div>
              <div class="scoreboard-scores" aria-label="Independent audit scores for ${escapeHtml(project.name)}">${chips}${emptyChips}
              </div>
            </article>`;
}

/* ---- Aggregate hero stats ---- */
function renderStats() {
  const siteCount = projects.length;
  const toolNames = new Set();
  const primaries = [];
  for (const project of projects) {
    for (const audit of project.audits || []) {
      toolNames.add(audit.tool);
    }
    if (project.primaryScore?.value) primaries.push(project.primaryScore.value);
  }
  const best = primaries.length ? Math.max(...primaries) : 0;
  const avg = primaries.length ? Math.round(primaries.reduce((a, b) => a + b, 0) / primaries.length) : 0;

  const stats = [
    { value: String(siteCount), label: "Live sites audited" },
    { value: String(toolNames.size), label: "Independent audit tools" },
    { value: `${avg}`, unit: "/100", label: "Average primary audit score" },
    { value: `${best}`, unit: "/100", label: "Top verified score" }
  ];

  return stats
    .map(
      (stat) => `
              <div class="hero-stat">
                <strong>${escapeHtml(stat.value)}${stat.unit ? `<small>${escapeHtml(stat.unit)}</small>` : ""}</strong>
                <span>${escapeHtml(stat.label)}</span>
              </div>`
    )
    .join("");
}

const projectMarkup = projects.map(renderProject).join("\n");
const scoreboardMarkup = projects.map(renderScoreRow).join("\n");
const statsMarkup = renderStats();

for (const relativePath of ["index.html", "projects/index.html"]) {
  const path = join(root, relativePath);
  let html = await readFile(path, "utf8");

  if (!html.includes("<!-- PROJECT_GRID_START -->")) {
    throw new Error(`${relativePath}: project grid markers are missing`);
  }
  html = replaceRegion(html, "PROJECT_GRID", projectMarkup, relativePath);
  html = replaceRegion(html, "SCOREBOARD", scoreboardMarkup, relativePath);
  html = replaceRegion(html, "HERO_STATS", statsMarkup, relativePath);

  await writeFile(path, html);
  console.log(`${relativePath}: rendered ${projects.length} project(s)`);
}
