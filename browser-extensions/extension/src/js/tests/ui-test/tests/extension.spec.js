// @ts-check
const { test: base, expect, chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const PLAYWRIGHT_DEBUG_DIR = path.join(__dirname, "..", "playwright-debug");

function safeDebugFilename(title) {
  return title.replace(/[^a-zA-Z0-9-]/g, "_").slice(0, 80);
}

async function saveDebugArtifactsOnFailure(page, testInfo) {
  if (testInfo.status !== "failed") return;
  try {
    fs.mkdirSync(PLAYWRIGHT_DEBUG_DIR, { recursive: true });
    const baseName = safeDebugFilename(testInfo.title);
    const htmlPath = path.join(PLAYWRIGHT_DEBUG_DIR, `${baseName}.html`);
    const html = await page.content();
    fs.writeFileSync(htmlPath, html, "utf8");
  } catch (_) {
    // Ignore (e.g. page closed or no page)
  }
}

const countryDomain = process.env.COUNTRY_HOSTNAME
  ? process.env.COUNTRY_HOSTNAME
  : "parkrun.org.uk";

const extensionPath = path.join(
  __dirname,
  "../extension-binaries/chrome-extension-package",
);

if (
  !fs.existsSync(extensionPath) ||
  !fs.existsSync(path.join(extensionPath, "manifest.json"))
) {
  throw new Error(
    `Chrome extension not found at ${extensionPath}. Build the extension and unzip the Chrome zip into extension-binaries/chrome-extension-package/. Run from repo root: pnpm --filter running-challenges-extension run build:extension, then unzip browser-extensions/chrome/build/web-ext-artifacts/running_challenges-chrome-*.zip into that directory.`,
  );
}

function getFixturePath(hostname, athleteId, suffix) {
  return path.join(
    __dirname,
    "..",
    "supporting-data",
    "sites",
    hostname,
    "contents",
    "parkrunner",
    athleteId,
    suffix,
    "index.html",
  );
}

const ONE_PX_TRANSPARENT_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

function getVolunteerFixturePath(hostname, athleteId) {
  return path.join(
    __dirname,
    "..",
    "supporting-data",
    "sites",
    hostname,
    "contents",
    "parkrunner",
    athleteId,
    "index.html",
  );
}

/**
 * Install route mocks so tests need no network: main doc, volunteer fetch,
 * events.json, and OSM tiles are fulfilled from fixtures; all other requests
 * are aborted. Call before page.goto().
 */
async function installNetworkFreeMocks(page, hostname, athleteId) {
  const mainUrl = `https://www.${hostname}/parkrunner/${athleteId}/all/`;
  const volunteerUrl = `https://www.${hostname}/parkrunner/${athleteId}/`;
  const mainPath = getFixturePath(hostname, athleteId, "all");
  const volunteerPath = getVolunteerFixturePath(hostname, athleteId);
  const eventsPath = path.join(
    __dirname,
    "..",
    "supporting-data",
    "sites",
    "images.parkrun.com",
    "contents",
    "events.json",
  );

  if (!fs.existsSync(mainPath)) {
    throw new Error(
      `Fixture not found: ${mainUrl} (${mainPath}). Run ui-test/update.sh to refresh.`,
    );
  }
  if (!fs.existsSync(volunteerPath)) {
    throw new Error(
      `Volunteer fixture not found: ${volunteerUrl} (${volunteerPath}). Run ui-test/update.sh to refresh.`,
    );
  }
  if (!fs.existsSync(eventsPath)) {
    throw new Error(`Fixture not found: ${eventsPath}`);
  }

  const mainHtml = fs.readFileSync(mainPath, "utf8");
  const volunteerHtml = fs.readFileSync(volunteerPath, "utf8");
  const eventsJson = fs.readFileSync(eventsPath, "utf8");

  await page.route("**/*", (route) => {
    const url = route.request().url();
    if (url === mainUrl) {
      return route.fulfill({
        status: 200,
        contentType: "text/html",
        body: mainHtml,
      });
    }
    if (url === volunteerUrl) {
      return route.fulfill({
        status: 200,
        contentType: "text/html",
        body: volunteerHtml,
      });
    }
    if (url === "https://images.parkrun.com/events.json") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: eventsJson,
      });
    }
    if (url.includes("tile.openstreetmap.org")) {
      return route.fulfill({
        status: 200,
        contentType: "image/png",
        body: ONE_PX_TRANSPARENT_PNG,
      });
    }
    return route.abort();
  });
}

const test = base.extend({
  context: async ({ browserName }, use) => {
    const browserTypes = { chromium };
    const launchOptions = {
      channel: "chromium",
      devtools: false,
      headless: true,
      args: [
        `--headless=new`,
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
      viewport: {
        width: 1920,
        height: 1080,
      },
      ignoreHTTPSErrors: true,
    };

    const context = await browserTypes[browserName].launchPersistentContext(
      "",
      launchOptions,
    );
    await use(context);
    await context.close();
  },
});

test.afterEach(async ({ page }, testInfo) => {
  await saveDebugArtifactsOnFailure(page, testInfo);
});

test("Basic extension load test", async ({ page }) => {
  await installNetworkFreeMocks(page, countryDomain, "1309364");
  await page.goto(`https://www.${countryDomain}/parkrunner/1309364/all/`, {
    waitUntil: "domcontentloaded",
  });

  const messagesDiv = page.locator("#running_challenges_messages_div");
  await expect(messagesDiv).toHaveText(
    "Additional badges provided by Running Challenges",
    { timeout: 15000 },
  );
});

test("No results for parkrunner load test", async ({ page }) => {
  await installNetworkFreeMocks(page, countryDomain, "999999");
  await page.goto(`https://www.${countryDomain}/parkrunner/999999/all/`, {
    waitUntil: "domcontentloaded",
  });

  const messagesDiv = page.locator("#running_challenges_messages_div");
  await expect(messagesDiv).toHaveText(
    "No results detected, no challenge data will be compiled",
    { timeout: 15000 },
  );
});

test("Leaflet markers load with icons (no network)", async ({ page }) => {
  await installNetworkFreeMocks(page, countryDomain, "1309364");
  await page.goto(`https://www.${countryDomain}/parkrunner/1309364/all/`, {
    waitUntil: "domcontentloaded",
  });

  const messagesDiv = page.locator("#running_challenges_messages_div");
  await expect(messagesDiv).toHaveText(
    "Additional badges provided by Running Challenges",
    { timeout: 15000 },
  );

  const explorerMap = page.locator("#explorer_map");
  await expect(explorerMap).toHaveCount(1);

  const markers = explorerMap.locator(".leaflet-marker-icon");
  await expect(markers.first()).toBeVisible({ timeout: 10000 });
  expect(await markers.count()).toBeGreaterThan(0);
});

test("Explorer map shows country completion pie charts", async ({ page }) => {
  // Danny NORMAN (A482) has significant UK tourism (e.g. 474/868 UK events).
  await installNetworkFreeMocks(page, countryDomain, "482");
  await page.goto(`https://www.${countryDomain}/parkrunner/482/all/`, {
    waitUntil: "domcontentloaded",
  });

  const messagesDiv = page.locator("#running_challenges_messages_div");
  await expect(messagesDiv).toHaveText(
    "Additional badges provided by Running Challenges",
    { timeout: 15000 },
  );

  const explorerMap = page.locator("#explorer_map");
  await expect(explorerMap).toHaveCount(1);

  // Assert that at least one pie chart canvas is present on the explorer map.
  const pieCharts = explorerMap.locator("canvas.leaflet-piechart-icon");
  await page.waitForFunction(
    () =>
      document.querySelectorAll("canvas.leaflet-piechart-icon").length > 0,
    null,
    { timeout: 15000 },
  );
  expect(await pieCharts.count()).toBeGreaterThan(0);
});

const badgesThatShouldExistMap = {
  // Running badges
  "runner-tourist": ["1309364", "482"],
  "runner-name-badge": ["482"],
  // Volunteer badges
  "volunteer-barcode-scanning": ["88720"],
  "volunteer-car-park-marshal": ["88720"],
  "volunteer-close-down": ["88720"],
  "volunteer-comms-person": ["88720"],
  "volunteer-equipment-storage": ["88720"],
  "volunteer-event-day-course-check": ["88720"],
  "volunteer-finish-tokens": ["88720"],
  "volunteer-first-timers-welcome": ["88720"],
  "volunteer-funnel-manager": ["88720"],
  "volunteer-lead-bike": [],
  "volunteer-manual-entry": ["88720"],
  "volunteer-marshal": ["88720"],
  "volunteer-other": ["88720"],
  "volunteer-pacer": ["88720"],
  "volunteer-photographer": ["88720"],
  "volunteer-report-writer": ["88720"],
  "volunteer-results-processing": ["88720"],
  "volunteer-run-director": ["88720"],
  "volunteer-setup": ["88720"],
  "volunteer-sign-language": ["88720"],
  "volunteer-tail-walker": ["88720"],
  "volunteer-timer": ["88720"],
  "volunteer-token-sorting": ["88720"],
  "volunteer-vi-guide": ["88720"],
  "volunteer-volunteer-coordinator": ["88720"],
  "volunteer-warm-up-leader": ["88720"],
  "volunteer-parkwalker": ["88720"],
};

const notApplicableBadgesPerDomain = {
  "parkrun.co.at": ["volunteer-warm-up-leader"],
  "parkrun.pl": ["volunteer-warm-up-leader"],
};

Object.keys(badgesThatShouldExistMap).forEach((badgeShortname) => {
  if (countryDomain in notApplicableBadgesPerDomain) {
    if (notApplicableBadgesPerDomain[countryDomain].includes(badgeShortname)) {
      console.log(`Skipping ${badgeShortname} for ${countryDomain}`);
      return;
    }
  }

  test(`Check for badge awarded: ${badgeShortname}`, async ({ page }) => {
    for (const parkrunnerId of badgesThatShouldExistMap[badgeShortname]) {
      await page.unroute("**/*");
      await installNetworkFreeMocks(page, countryDomain, parkrunnerId);
      await page.goto(
        `https://www.${countryDomain}/parkrunner/${parkrunnerId}/all/`,
        { waitUntil: "domcontentloaded" },
      );

      await expect(page.locator("#running_challenges_messages_div")).toHaveText(
        "Additional badges provided by Running Challenges",
        { timeout: 15000 },
      );

      await expect(
        page.locator(`#badge-awarded-${badgeShortname}`),
      ).toBeVisible();
    }
  });
});
