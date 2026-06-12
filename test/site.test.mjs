import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();

async function read(relativePath) {
  return readFile(join(root, relativePath), "utf8");
}

test("homepage communicates positioning, proof, services, and contact path", async () => {
  const html = await read("index.html");

  assert.match(html, /<h1[^>]*>[\s\S]*Technical SEO/i);
  assert.match(html, /95\s*\/\s*100/);
  assert.match(html, /109\s+pages/i);
  assert.match(html, /Technical SEO/i);
  assert.match(html, /On-Page SEO/i);
  assert.match(html, /Structured Data/i);
  assert.match(html, /Case Study/i);
  assert.match(html, /linkedin\.com\/in\/puterabuana/i);
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

test("every public page has core search and social metadata", async () => {
  for (const path of ["index.html", "case-study/puteragani/index.html"]) {
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
  for (const path of ["index.html", "case-study/puteragani/index.html"]) {
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
