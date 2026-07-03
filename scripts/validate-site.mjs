import { access, readFile, stat } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";

const root = process.cwd();
const publicPages = ["index.html", "projects/index.html", "case-study/puteragani/index.html", "case-study/wena/index.html"];
const errors = [];

function check(condition, message) {
  if (!condition) errors.push(message);
}

function localTarget(pagePath, href) {
  const clean = href.split("#")[0].split("?")[0];
  if (!clean || clean.startsWith("http") || clean.startsWith("mailto:")) return null;
  if (clean.startsWith("/")) return join(root, clean.slice(1));
  return resolve(root, dirname(pagePath), clean);
}

for (const pagePath of publicPages) {
  const html = await readFile(join(root, pagePath), "utf8");
  const label = pagePath.replaceAll("\\", "/");

  check((html.match(/<h1\b/gi) || []).length === 1, `${label}: expected exactly one H1`);
  check(/<meta[^>]+name="description"[^>]+content="[^"]+"/i.test(html), `${label}: missing description`);
  check(/<link[^>]+rel="canonical"[^>]+href="https:\/\/seo\.puteragani\.com/i.test(html), `${label}: invalid canonical`);
  check(/<script[^>]+type="application\/ld\+json"/i.test(html), `${label}: missing JSON-LD`);
  check(!/<img(?![^>]+\balt=)[^>]*>/i.test(html), `${label}: image without alt`);

  for (const match of html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      JSON.parse(match[1]);
    } catch (error) {
      errors.push(`${label}: invalid JSON-LD (${error.message})`);
    }
  }

  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/gi)) {
    const href = match[1];
    const target = localTarget(pagePath, href);
    if (!target) continue;

    let resolvedTarget = target;
    if (!extname(target)) resolvedTarget = join(target, "index.html");

    try {
      await access(resolvedTarget);
      const details = await stat(resolvedTarget);
      check(details.size > 0, `${label}: empty asset ${href}`);
    } catch {
      errors.push(`${label}: missing local target ${href}`);
    }
  }
}

const projects = JSON.parse(await readFile(join(root, "data/projects.json"), "utf8"));
for (const project of projects) {
  check(project.slug && project.name && project.caseStudyUrl, "data/projects.json: each project needs slug, name, and caseStudyUrl");
  check(project.primaryScore?.tool && Number.isFinite(project.primaryScore?.value), `${project.slug}: primary score needs a tool and numeric value`);
  check(project.published && project.dateLabel, `${project.slug}: audit date is required`);
  check(Array.isArray(project.categories) && project.categories.length > 0, `${project.slug}: at least one category is required`);
}

const sitemap = await readFile(join(root, "sitemap.xml"), "utf8");
check((sitemap.match(/<loc>/g) || []).length === publicPages.length, "sitemap.xml: unexpected URL count");

if (errors.length) {
  console.error(`Validation failed with ${errors.length} issue(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Validation passed: ${publicPages.length} pages, ${projects.length} project(s), metadata, JSON-LD, assets, and internal paths.`);
