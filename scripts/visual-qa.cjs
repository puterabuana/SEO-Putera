const { mkdir } = require("node:fs/promises");
const { join } = require("node:path");
const { chromium } = require("playwright");

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:4173";
const outputDir = join(process.cwd(), "outputs");

async function inspectPage(page, path, screenshotName) {
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  await page.goto(`${baseUrl}${path}`, { waitUntil: "networkidle" });
  await page.screenshot({ path: join(outputDir, screenshotName), fullPage: true });

  const checks = await page.evaluate(() => ({
    title: document.title,
    h1Count: document.querySelectorAll("h1").length,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    viewportWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    imagesMissingAlt: [...document.images].filter((image) => !image.hasAttribute("alt")).length,
    imageFailures: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).length
  }));

  return { path, ...checks, consoleErrors };
}

async function main() {
  await mkdir(outputDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const results = [];

  const desktop = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  const desktopHome = await desktop.newPage();
  results.push(await inspectPage(desktopHome, "/", "seo-putera-home-desktop.png"));

  await desktopHome.locator(".faq-item").nth(1).locator("button").click();
  results.push({
    interaction: "homepage accordion",
    passed: (await desktopHome.locator(".faq-item").nth(1).locator("button").getAttribute("aria-expanded")) === "true"
  });

  const desktopArchive = await desktop.newPage();
  results.push(await inspectPage(desktopArchive, "/projects/", "seo-putera-projects-desktop.png"));
  await desktopArchive.locator('[data-filter="Schema"]').click();
  results.push({ interaction: "project filter", passed: (await desktopArchive.locator("[data-project-card]:visible").count()) === 1 });
  const localSeoProjectCount = await desktopArchive.locator('[data-project-card][data-categories*="Local SEO"]').count();
  await desktopArchive.locator('[data-filter="Local SEO"]').click();
  results.push({ interaction: "local seo project filter", passed: (await desktopArchive.locator("[data-project-card]:visible").count()) === localSeoProjectCount });

  const desktopCase = await desktop.newPage();
  results.push(await inspectPage(desktopCase, "/case-study/puteragani/", "seo-putera-case-study-desktop.png"));
  await desktopCase.locator("[data-lightbox]").first().click();
  results.push({ interaction: "case-study lightbox", passed: await desktopCase.locator("[data-lightbox-dialog]").evaluate((element) => element.open) });

  const desktopWena = await desktop.newPage();
  results.push(await inspectPage(desktopWena, "/case-study/wena/", "seo-putera-wena-desktop.png"));
  await desktopWena.locator("[data-lightbox]").first().click();
  results.push({ interaction: "wena lightbox", passed: await desktopWena.locator("[data-lightbox-dialog]").evaluate((element) => element.open) });

  const desktopFernwood = await desktop.newPage();
  results.push(await inspectPage(desktopFernwood, "/case-study/fernwood/", "seo-putera-fernwood-desktop.png"));
  results.push({ interaction: "fernwood evidence table", passed: (await desktopFernwood.locator(".comparison-wrap").boundingBox()).width > 400 });

  const desktopKerly = await desktop.newPage();
  results.push(await inspectPage(desktopKerly, "/case-study/kerlyfinance/", "seo-putera-kerlyfinance-desktop.png"));
  await desktopKerly.locator("[data-lightbox]").first().click();
  results.push({ interaction: "kerlyfinance lightbox", passed: await desktopKerly.locator("[data-lightbox-dialog]").evaluate((element) => element.open) });

  const desktopEmberslice = await desktop.newPage();
  results.push(await inspectPage(desktopEmberslice, "/case-study/emberslice/", "seo-putera-emberslice-desktop.png"));
  await desktopEmberslice.locator("[data-lightbox]").first().click();
  results.push({ interaction: "emberslice lightbox", passed: await desktopEmberslice.locator("[data-lightbox-dialog]").evaluate((element) => element.open) });

  const desktopMeridian = await desktop.newPage();
  results.push(await inspectPage(desktopMeridian, "/case-study/meridianroasters/", "seo-putera-meridianroasters-desktop.png"));
  await desktopMeridian.locator("[data-lightbox]").first().click();
  results.push({ interaction: "meridianroasters lightbox", passed: await desktopMeridian.locator("[data-lightbox-dialog]").evaluate((element) => element.open) });
  await desktop.close();

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true });
  const mobileHome = await mobile.newPage();
  results.push(await inspectPage(mobileHome, "/", "seo-putera-home-mobile.png"));
  await mobileHome.locator("[data-nav-toggle]").click();
  await mobileHome.locator("[data-nav]").waitFor({ state: "visible" });
  results.push({
    interaction: "mobile navigation",
    passed: (await mobileHome.locator("[data-nav-toggle]").getAttribute("aria-expanded")) === "true" && (await mobileHome.locator("[data-nav]").isVisible())
  });

  const mobileArchive = await mobile.newPage();
  results.push(await inspectPage(mobileArchive, "/projects/", "seo-putera-projects-mobile.png"));
  const mobileCase = await mobile.newPage();
  results.push(await inspectPage(mobileCase, "/case-study/puteragani/", "seo-putera-case-study-mobile.png"));
  const mobileWena = await mobile.newPage();
  results.push(await inspectPage(mobileWena, "/case-study/wena/", "seo-putera-wena-mobile.png"));

  const mobileFernwood = await mobile.newPage();
  results.push(await inspectPage(mobileFernwood, "/case-study/fernwood/", "seo-putera-fernwood-mobile.png"));

  const mobileKerly = await mobile.newPage();
  results.push(await inspectPage(mobileKerly, "/case-study/kerlyfinance/", "seo-putera-kerlyfinance-mobile.png"));

  const mobileEmberslice = await mobile.newPage();
  results.push(await inspectPage(mobileEmberslice, "/case-study/emberslice/", "seo-putera-emberslice-mobile.png"));

  const mobileMeridian = await mobile.newPage();
  results.push(await inspectPage(mobileMeridian, "/case-study/meridianroasters/", "seo-putera-meridianroasters-mobile.png"));
  await mobile.close();
  await browser.close();

  const failures = results.filter((result) => {
    if ("passed" in result) return !result.passed;
    return result.h1Count !== 1 || result.horizontalOverflow || result.imagesMissingAlt !== 0 || result.imageFailures !== 0 || result.consoleErrors.length !== 0;
  });

  console.log(JSON.stringify({ results, failures: failures.length }, null, 2));
  if (failures.length) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
