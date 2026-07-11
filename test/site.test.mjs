import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const publicPages = [
  "index.html",
  "projects/index.html",
  "case-study/puteragani/index.html",
  "case-study/wena/index.html",
  "case-study/fernwood/index.html",
  "case-study/kerlyfinance/index.html",
  "case-study/emberslice/index.html",
  "case-study/meridianroasters/index.html"
];

async function read(relativePath) {
  return readFile(join(root, relativePath), "utf8");
}

test("homepage communicates positioning, expertise, portfolio, method, and contact path", async () => {
  const html = await read("index.html");

  assert.match(html, /My SEO work, scored/i);
  assert.match(html, /95\s*\/\s*100/);
  assert.match(html, /Technical foundations/i);
  assert.match(html, /Structured data/i);
  assert.match(html, /websites behind the scores/i);
  assert.match(html, /Verification method/i);
  assert.match(html, /linkedin\.com\/in\/puterabuana/i);
});

test("project archive is generated from the shared project data", async () => {
  const projects = JSON.parse(await read("data/projects.json"));
  const home = await read("index.html");
  const archive = await read("projects/index.html");

  assert.ok(projects.length > 0, "project data should contain at least one real project");
  for (const project of projects) {
    assert.match(home, new RegExp(project.name.replaceAll(".", "\\."), "i"));
    assert.match(archive, new RegExp(project.name.replaceAll(".", "\\."), "i"));
    assert.match(home, new RegExp(project.caseStudyUrl.replaceAll("/", "\\/")));
  }

  assert.equal((home.match(/data-project-card/g) || []).length, projects.length);
  assert.equal((archive.match(/data-project-card/g) || []).length, projects.length);
});

test("case study presents evidence with source labels and honest limitations", async () => {
  const html = await read("case-study/puteragani/index.html");

  assert.match(html, /Owned Website SEO Case Study/i);
  assert.match(html, /Rank Math/i);
  assert.match(html, /SEO Site Checkup/i);
  assert.match(html, /SEOptimer/i);
  assert.match(html, /June 12, 2026/i);
  assert.match(html, /backlink/i);
  assert.match(html, /not.*traffic|traffic.*not/i);
  assert.match(html, /\.pdf/i);
});

test("Wena case study presents local SEO evidence without overstating duplicate sources", async () => {
  const html = await read("case-study/wena/index.html");

  assert.match(html, /Local Business SEO Case Study/i);
  assert.match(html, /Wena Self Photo Studio/i);
  assert.match(html, /Rank Math/i);
  assert.match(html, /92\s*\/\s*100/);
  assert.match(html, /Seobility/i);
  assert.match(html, /90%/);
  assert.match(html, /SEO Site Checkup/i);
  assert.match(html, /84\s*\/\s*100/);
  assert.match(html, /duplicate/i);
  assert.match(html, /booking/i);
  assert.match(html, /\.pdf/i);
});

test("Kerly Finance case study separates paired evidence from the Semrush snapshot", async () => {
  const html = await read("case-study/kerlyfinance/index.html");

  assert.match(html, /Kerly Finance/i);
  assert.match(html, /80%→88%/);
  assert.match(html, /85→90/);
  assert.match(html, /B−→B/);
  assert.match(html, /Semrush/i);
  assert.match(html, /90% Site Health/i);
  assert.match(html, /not establish.*traffic|traffic.*not/i);
  assert.match(html, /\.pdf/i);
});

test("Ember Slice case study presents five paired audits and honest limitations", async () => {
  const html = await read("case-study/emberslice/index.html");

  assert.match(html, /Ember Slice/i);
  assert.match(html, /90→97/);
  assert.match(html, /88%→92%/);
  assert.match(html, /81→86/);
  assert.match(html, /B→B\+/);
  assert.match(html, /Google PageSpeed/i);
  assert.match(html, /91 mobile · 100 desktop/i);
  assert.match(html, /RankNow did not improve/i);
  assert.match(html, /not higher search rankings/i);
  assert.match(html, /ten source files/i);
  assert.match(html, /\.pdf/i);
});

test("Meridian Roasters case study preserves the changed crawl scope alongside score gains", async () => {
  const html = await read("case-study/meridianroasters/index.html");

  assert.match(html, /Meridian Roasters/i);
  assert.match(html, /86\.8→94\.8/);
  assert.match(html, /57%→88%/);
  assert.match(html, /69→82/);
  assert.match(html, /C\+→B−/);
  assert.match(html, /coverage expanded from 2 to 14 pages/i);
  assert.match(html, /do not establish more organic traffic/i);
  assert.match(html, /nine reports/i);
  assert.match(html, /\.pdf/i);
});

test("every public page has core search and social metadata", async () => {
  for (const path of publicPages) {
    const html = await read(path);

    assert.match(html, /<html[^>]+lang="en"/i);
    assert.match(html, /<title>[^<]{20,65}<\/title>/i);
    assert.match(html, /<meta[^>]+name="description"[^>]+content="[^"]{100,170}"/i);
    assert.match(html, /<link[^>]+rel="canonical"/i);
    assert.match(html, /<meta[^>]+property="og:title"/i);
    assert.match(html, /<meta[^>]+name="twitter:card"/i);
    assert.match(html, /<script[^>]+type="application\/ld\+json"/i);
  }
});

test("navigation and evidence images are accessible", async () => {
  for (const path of publicPages) {
    const html = await read(path);

    assert.match(html, /<a[^>]+class="skip-link"[^>]+href="#main-content"/i);
    assert.match(html, /<main[^>]+id="main-content"/i);
    assert.doesNotMatch(html, /<img(?![^>]+\balt=)[^>]*>/i);
    assert.doesNotMatch(html, /<button(?![^>]+\btype=)[^>]*>/i);
  }
});

test("audit evidence and crawl-control files are shipped", async () => {
  const files = [
    "assets/images/audits/rankmath-95.webp",
    "assets/images/audits/sitecheckup-85.webp",
    "assets/images/audits/seoptimer-overview.webp",
    "assets/images/audits/pagespeed-results.webp",
    "assets/reports/rankmath-audit.pdf",
    "assets/reports/seo-site-checkup-audit.pdf",
    "assets/reports/seoptimer-audit.pdf",
    "assets/images/audits/wena-rankmath-92.webp",
    "assets/images/audits/wena-seobility-90.webp",
    "assets/images/audits/wena-sitecheckup-84.webp",
    "assets/reports/wena/rankmath-audit.pdf",
    "assets/reports/wena/seobility-audit.pdf",
    "assets/reports/wena/seo-site-checkup-audit.pdf",
    "assets/reports/kerlyfinance/rankmath-before.pdf",
    "assets/reports/kerlyfinance/rankmath-after.pdf",
    "assets/reports/kerlyfinance/seobility-before.pdf",
    "assets/reports/kerlyfinance/seobility-after.pdf",
    "assets/reports/kerlyfinance/seo-site-checkup-before.pdf",
    "assets/reports/kerlyfinance/seo-site-checkup-after.pdf",
    "assets/reports/kerlyfinance/seoptimer-before.pdf",
    "assets/reports/kerlyfinance/seoptimer-after.pdf",
    "assets/reports/kerlyfinance/semrush-after.pdf",
    "assets/images/projects/emberslice-showcase.webp",
    "assets/images/audits/emberslice/rankmath-before.webp",
    "assets/images/audits/emberslice/rankmath-after.webp",
    "assets/images/audits/emberslice/seobility-before.webp",
    "assets/images/audits/emberslice/seobility-after.webp",
    "assets/images/audits/emberslice/seosite-before.webp",
    "assets/images/audits/emberslice/seosite-after.webp",
    "assets/images/audits/emberslice/pagespeed-mobile-after.webp",
    "assets/images/audits/emberslice/pagespeed-desktop-after.webp",
    "assets/reports/emberslice/rankmath-before.pdf",
    "assets/reports/emberslice/rankmath-after.pdf",
    "assets/reports/emberslice/ranknow-before.pdf",
    "assets/reports/emberslice/ranknow-after.pdf",
    "assets/reports/emberslice/seobility-before.pdf",
    "assets/reports/emberslice/seobility-after.pdf",
    "assets/reports/emberslice/seo-site-checkup-before.pdf",
    "assets/reports/emberslice/seo-site-checkup-after.pdf",
    "assets/reports/emberslice/seoptimer-before.pdf",
    "assets/reports/emberslice/seoptimer-after.pdf",
    "assets/images/projects/meridianroasters-showcase.webp",
    "assets/images/audits/meridianroasters/seobility-before.webp",
    "assets/images/audits/meridianroasters/seobility-after.webp",
    "assets/images/audits/meridianroasters/seosite-before.webp",
    "assets/images/audits/meridianroasters/seosite-after.webp",
    "assets/images/audits/meridianroasters/seoptimer-before.webp",
    "assets/images/audits/meridianroasters/seoptimer-after.webp",
    "assets/reports/meridianroasters/ranknow-before.pdf",
    "assets/reports/meridianroasters/ranknow-after.pdf",
    "assets/reports/meridianroasters/seobility-before.pdf",
    "assets/reports/meridianroasters/seobility-after.pdf",
    "assets/reports/meridianroasters/seo-site-checkup-before.pdf",
    "assets/reports/meridianroasters/seo-site-checkup-after.pdf",
    "assets/reports/meridianroasters/seoptimer-before.pdf",
    "assets/reports/meridianroasters/seoptimer-after.pdf",
    "assets/reports/meridianroasters/semrush-after.pdf",
    "robots.txt",
    "sitemap.xml"
  ];

  for (const path of files) {
    await access(join(root, path));
    const details = await stat(join(root, path));
    const minimumSize = path === "robots.txt" ? 20 : 100;
    assert.ok(details.size > minimumSize, `${path} should not be empty`);
  }
});
