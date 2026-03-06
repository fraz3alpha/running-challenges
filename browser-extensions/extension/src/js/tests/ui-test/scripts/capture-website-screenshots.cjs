/**
 * Captures website screenshots from screenshots.yml by loading real parkrun pages
 * with the Chrome extension. Run from repo root: ./script/update-screenshots
 * Or from ui-test: node scripts/capture-website-screenshots.cjs
 */
const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");
const os = require("os");
const yaml = require("yaml");

const UI_TEST_DIR = path.join(__dirname, "..");
const REPO_ROOT = path.join(UI_TEST_DIR, "..", "..", "..", "..", "..", "..");
const CHROME_EXTENSION_PATH = path.join(REPO_ROOT, "browser-extensions", "chrome", "build");
const SCREENSHOTS_DIR = path.join(REPO_ROOT, "images", "screenshots");
const SCREENSHOTS_CONFIG_PATH = path.join(UI_TEST_DIR, "screenshots.yml");
const BOTTOM_SELECTOR_TIMEOUT_MS = 60000;
const FALLBACK_BOTTOM_SELECTOR = "#content";

function clipFromTopAndBottom(topBox, bottomBox) {
  if (!topBox || !bottomBox) return null;
  const y = topBox.y;
  const bottomEdge = bottomBox.y + bottomBox.height;
  const height = bottomEdge - y;
  if (height <= 0) return null;
  const left = Math.min(topBox.x, bottomBox.x);
  const right = Math.max(topBox.x + topBox.width, bottomBox.x + bottomBox.width);
  return {
    x: left,
    y,
    width: right - left,
    height,
  };
}

function groupEntriesByUrl(screenshots) {
  const byUrl = new Map();
  for (const entry of screenshots) {
    const url = entry.url;
    if (!byUrl.has(url)) byUrl.set(url, []);
    byUrl.get(url).push(entry);
  }
  return byUrl;
}

async function waitForBottomWithFallback(page, bottomSelector) {
  let bottomEl = page.locator(bottomSelector).first();
  try {
    await bottomEl.waitFor({ state: "visible", timeout: BOTTOM_SELECTOR_TIMEOUT_MS });
    return bottomEl;
  } catch {
    const fallbackEl = page.locator(FALLBACK_BOTTOM_SELECTOR).first();
    await fallbackEl.waitFor({ state: "visible", timeout: 5000 });
    console.warn(
      `Warning: ${bottomSelector} did not appear (extension may not have injected). Using ${FALLBACK_BOTTOM_SELECTOR} as bottom.`,
    );
    return fallbackEl;
  }
}

async function loadPage(page, url, firstEntry) {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle");
  const topEl = page.locator(firstEntry.top).first();
  await topEl.waitFor({ state: "visible", timeout: 10000 });
  await waitForBottomWithFallback(page, firstEntry.bottom);
  await page.waitForLoadState("networkidle");
}

async function captureRegion(page, entry) {
  const { filename, top: topSelector, bottom: bottomSelector } = entry;
  const topEl = page.locator(topSelector).first();
  const bottomEl = page.locator(bottomSelector).first();
  await topEl.waitFor({ state: "visible", timeout: 5000 });
  await bottomEl.waitFor({ state: "visible", timeout: 5000 });
  await topEl.scrollIntoViewIfNeeded();
  const topBox = await topEl.boundingBox();
  const bottomBox = await bottomEl.boundingBox();
  const viewportClip = clipFromTopAndBottom(topBox, bottomBox);
  const outPath = path.join(REPO_ROOT, filename);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  if (!viewportClip) {
    await page.screenshot({ path: outPath, fullPage: true });
    return outPath;
  }
  const scroll = await page.evaluate(() => ({ x: window.scrollX, y: window.scrollY }));
  const pageClip = {
    x: viewportClip.x + scroll.x,
    y: viewportClip.y + scroll.y,
    width: viewportClip.width,
    height: viewportClip.height,
  };
  await page.screenshot({ path: outPath, fullPage: true, clip: pageClip });
  return outPath;
}

async function main() {
  if (
    !fs.existsSync(CHROME_EXTENSION_PATH) ||
    !fs.existsSync(path.join(CHROME_EXTENSION_PATH, "manifest.json"))
  ) {
    throw new Error(
      `Chrome extension not found at ${CHROME_EXTENSION_PATH}. Run ./script/update from repo root.`,
    );
  }

  if (!fs.existsSync(SCREENSHOTS_CONFIG_PATH)) {
    throw new Error(`Screenshots config not found: ${SCREENSHOTS_CONFIG_PATH}`);
  }

  const configContent = fs.readFileSync(SCREENSHOTS_CONFIG_PATH, "utf8");
  const config = yaml.parse(configContent);
  const screenshots = config.screenshots;
  if (!Array.isArray(screenshots) || screenshots.length === 0) {
    throw new Error("screenshots.yml must contain a non-empty 'screenshots' array.");
  }

  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "rc-screenshot-"));
  const extensionPathAbsolute = path.resolve(CHROME_EXTENSION_PATH);

  const context = await chromium.launchPersistentContext(userDataDir, {
    channel: "chromium",
    headless: true,
    args: [
      "--headless=new",
      `--disable-extensions-except=${extensionPathAbsolute}`,
      `--load-extension=${extensionPathAbsolute}`,
    ],
    viewport: { width: 1200, height: 900 },
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  try {
    const byUrl = groupEntriesByUrl(screenshots);
    for (const [url, entries] of byUrl) {
      const page = await context.newPage();
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          console.warn("Page console error:", msg.text());
        }
      });
      await loadPage(page, url, entries[0]);
      for (const entry of entries) {
        const outPath = await captureRegion(page, entry);
        console.log("Screenshot written to", outPath);
      }
      await page.close();
    }
  } finally {
    await context.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
