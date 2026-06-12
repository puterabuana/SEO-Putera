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

  const desktopCase = await desktop.newPage();
  results.push(await inspectPage(desktopCase, "/case-study/puteragani/", "seo-putera-case-study-desktop.png"));

  const lightboxTrigger = desktopCase.locator("[data-lightbox]").first();
  await lightboxTrigger.click();
  const lightboxOpen = await desktopCase.locator("[data-lightbox-dialog]").evaluate((element) => element.open);
  results.push({ interaction: "case-study lightbox", passed: lightboxOpen });
  await desktop.close();

  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true
  });
  const mobileHome = await mobile.newPage();
  results.push(await inspectPage(mobileHome, "/", "seo-putera-home-mobile.png"));

  await mobileHome.locator("[data-nav-toggle]").click();
  const navExpanded = await mobileHome.locator("[data-nav-toggle]").getAttribute("aria-expanded");
  const navVisible = await mobileHome.locator("[data-nav]").isVisible();
  results.push({ interaction: "mobile navigation", passed: navExpanded === "true" && navVisible });

  const mobileCase = await mobile.newPage();
  results.push(await inspectPage(mobileCase, "/case-study/puteragani/", "seo-putera-case-study-mobile.png"));
  await mobile.close();

  await browser.close();

  const failures = results.filter((result) => {
    if ("passed" in result) return !result.passed;
    return (
      result.h1Count !== 1 ||
      result.horizontalOverflow ||
      result.imagesMissingAlt !== 0 ||
      result.imageFailures !== 0 ||
      result.consoleErrors.length !== 0
    );
  });

  console.log(JSON.stringify({ results, failures: failures.length }, null, 2));
  if (failures.length) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
