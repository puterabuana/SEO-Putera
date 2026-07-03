import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const projects = JSON.parse(await readFile(join(root, "data/projects.json"), "utf8"));
const startMarker = "<!-- PROJECT_GRID_START -->";
const endMarker = "<!-- PROJECT_GRID_END -->";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderProject(project, index) {
  const categories = project.categories.map(escapeHtml).join(",");
  const categoryLabels = project.categories
    .map((category) => `<span>${escapeHtml(category)}</span>`)
    .join("");
  const score = project.primaryScore;
  const supportingScores = (project.supportingScores || [])
    .map((item) => `<span><small>${escapeHtml(item.tool)}</small><strong>${escapeHtml(item.value)}</strong></span>`)
    .join("");

  return `
            <article class="project-card reveal" data-project-card data-categories="${categories}">
              <a class="project-card-link" href="${escapeHtml(project.caseStudyUrl)}" aria-label="Open ${escapeHtml(project.name)} SEO case study">
                <div class="project-visual project-visual-${(index % 3) + 1}">
                  <div class="project-browser" aria-hidden="true">
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
                  </div>
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

const projectMarkup = projects.map(renderProject).join("\n");

for (const relativePath of ["index.html", "projects/index.html"]) {
  const path = join(root, relativePath);
  const html = await readFile(path, "utf8");
  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker);

  if (start === -1 || end === -1 || end < start) {
    throw new Error(`${relativePath}: project grid markers are missing or out of order`);
  }

  const output = `${html.slice(0, start + startMarker.length)}\n${projectMarkup}\n            ${html.slice(end)}`;
  await writeFile(path, output);
  console.log(`${relativePath}: rendered ${projects.length} project(s)`);
}
