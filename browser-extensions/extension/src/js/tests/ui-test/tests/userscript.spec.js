// @ts-check
const { test, expect } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const PLAYWRIGHT_DEBUG_DIR = path.join(__dirname, "..", "playwright-debug");

const countryDomain = process.env.COUNTRY_HOSTNAME
  ? process.env.COUNTRY_HOSTNAME
  : "parkrun.org.uk";

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
    if (url.startsWith("https://images.parkrun.com/") && url.includes("events.json")) {
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
    if (
      url.includes("images/badges/") ||
      url.includes("images/flags/") ||
      url.includes("running-challenges.co.uk/img/badges/") ||
      url.includes("running-challenges.co.uk/img/flags/")
    ) {
      return route.fulfill({
        status: 200,
        contentType: "image/png",
        body: ONE_PX_TRANSPARENT_PNG,
      });
    }
    const extramarkersImgMatch = url.match(
      /unpkg\.com\/leaflet-extra-markers@[\d.]+\/dist\/img\/([^/?#]+\.png)/,
    );
    if (extramarkersImgMatch) {
      const extramarkersImgPath = path.join(
        __dirname,
        "..",
        "..",
        "..",
        "..",
        "node_modules",
        "leaflet-extra-markers",
        "dist",
        "img",
        extramarkersImgMatch[1],
      );
      if (fs.existsSync(extramarkersImgPath)) {
        return route.fulfill({
          status: 200,
          contentType: "image/png",
          body: fs.readFileSync(extramarkersImgPath),
        });
      }
    }
    return route.abort();
  });
}

test.afterEach(async ({ page }, testInfo) => {
  await saveDebugArtifactsOnFailure(page, testInfo);
});

test(
  "Userscript renders explorer map and badges on a parkrun results page",
  async ({ page }, testInfo) => {
  // Load the built userscript bundle from the website assets.
  const userscriptPath = path.join(
    __dirname,
    "..",
    "..",
    "..",
    "..",
    "..",
    "..",
    "..",
    "website",
    "assets",
    "js",
    "running-challenges.user.js",
  );

  if (!fs.existsSync(userscriptPath)) {
    throw new Error(
      `Userscript bundle not found at ${userscriptPath}. Run ./script/update from the repo root to build it.`,
    );
  }

  // Capture console output and page errors for debugging the userscript behaviour.
  const consoleEvents = [];
  page.on("console", (msg) => {
    consoleEvents.push({ type: msg.type(), text: msg.text() });
  });
  page.on("pageerror", (err) => {
    consoleEvents.push({ type: "pageerror", text: err.message });
  });

  const saveConsoleAndRethrow = async (err) => {
    await testInfo.attach("userscript-console-and-errors.json", {
      body: JSON.stringify(consoleEvents, null, 2),
      contentType: "application/json",
    });
    fs.mkdirSync(PLAYWRIGHT_DEBUG_DIR, { recursive: true });
    fs.writeFileSync(
      path.join(PLAYWRIGHT_DEBUG_DIR, "userscript-console-and-errors.json"),
      JSON.stringify(consoleEvents, null, 2),
      "utf8",
    );
    throw err;
  };

  try {
  // Use the same fixture parkrunner as the basic extension test: 1309364 (Andy Taylor).
  await installNetworkFreeMocks(page, countryDomain, "1309364");

  // Listen for events.json before navigation so we never miss the response.
  const eventsJsonPromise = page.waitForResponse(
    (resp) =>
      resp.url().includes("events.json") && resp.status() === 200,
    { timeout: 15000 },
  );

  await page.goto(
    `https://www.${countryDomain}/parkrunner/1309364/all/`,
    {
      waitUntil: "domcontentloaded",
    },
  );

  // Inject the userscript after the page has loaded (matches Tampermonkey @run-at document-end).
  // addInitScript runs before the document exists and causes "Cannot read properties of undefined (reading 'createElement')".
  const userscriptSource = fs.readFileSync(userscriptPath, "utf8");
  await page.addScriptTag({ content: userscriptSource });
  await eventsJsonPromise;

  const messagesDiv = page.locator("#running_challenges_messages_div");
  await expect(messagesDiv).toHaveText(
    "Additional badges provided by Running Challenges",
    { timeout: 20000 },
  );
  const explorerMap = page.locator("#explorer_map");
  await expect(explorerMap).toHaveCount(1);

  // Badges: athlete 1309364 has runner-tourist; badge images must load (correct URLs so they can be fulfilled by our route).
  const badgesDiv = page.locator("#running_challenges_badges_div");
  await expect(badgesDiv).toHaveCount(1);
  await expect(page.locator("#badge-awarded-runner-tourist")).toBeVisible({
    timeout: 5000,
  });
  const badgeImages = badgesDiv.locator("img");
  await expect(badgeImages.first()).toBeVisible({ timeout: 1000 });
  const atLeastOneBadgeLoaded = await page.evaluate(() => {
    const imgs = document.querySelectorAll("#running_challenges_badges_div img");
    return Array.from(imgs).some((img) => img.naturalWidth > 0);
  });
  expect(atLeastOneBadgeLoaded).toBe(true);

  // Flags: at least one country flag (e.g. UK) must be present and its image must load.
  const flagsDiv = page.locator("#running_challenges_flags_div");
  await expect(flagsDiv).toHaveCount(1);
  const flagImages = flagsDiv.locator("img");
  await expect(flagImages.first()).toBeVisible({ timeout: 5000 });
  const atLeastOneFlagLoaded = await page.evaluate(() => {
    const imgs = document.querySelectorAll("#running_challenges_flags_div img");
    return Array.from(imgs).some((img) => img.naturalWidth > 0);
  });
  expect(atLeastOneFlagLoaded).toBe(true);

  // Map: tiles must be contained (not scattered). Map fills container width (100%) and has fixed height.
  const mapContainer = page.locator("#explorer_map");
  await expect(mapContainer).toHaveCSS("height", "400px");
  await expect(mapContainer).toHaveCSS("width", /^\d+(\.\d+)?px$/);
  const tilesInsideMap = mapContainer.locator(".leaflet-tile-pane img, .leaflet-tile");
  await expect(tilesInsideMap.first()).toBeVisible({ timeout: 5000 });
  const allTiles = page.locator(".leaflet-tile-pane img, .leaflet-tile");
  const tilesWithinMap = mapContainer.locator(".leaflet-tile-pane img, .leaflet-tile");
  const totalTiles = await allTiles.count();
  const tilesInMap = await tilesWithinMap.count();
  expect(tilesInMap).toBe(totalTiles);

  // All Leaflet tiles and markers must be inside the explorer map in the DOM and the map must clip (overflow:hidden) so nothing is visibly scattered.
  const mapStructureCheck = await page.evaluate(() => {
    const mapEl = document.getElementById("explorer_map");
    if (!mapEl) return { ok: false, reason: "no map" };
    const overflow = window.getComputedStyle(mapEl).overflow;
    const allTilesInPage = document.querySelectorAll(".leaflet-tile-pane img, .leaflet-tile");
    const allTilesInMap = mapEl.querySelectorAll(".leaflet-tile-pane img, .leaflet-tile");
    const allMarkersInPage = document.querySelectorAll(
      ".leaflet-marker-icon, .leaflet-piechart-icon"
    );
    const allMarkersInMap = mapEl.querySelectorAll(
      ".leaflet-marker-icon, .leaflet-piechart-icon"
    );
    const tilesContained = allTilesInPage.length === allTilesInMap.length;
    const markersContained = allMarkersInPage.length === allMarkersInMap.length;
    const clips = overflow === "hidden" || overflow === "auto";
    return {
      ok: tilesContained && markersContained && clips,
      tilesContained,
      markersContained,
      clips,
      overflow,
      tileCount: allTilesInPage.length,
      markerCount: allMarkersInPage.length,
    };
  });
  expect(
    mapStructureCheck.ok,
    mapStructureCheck.reason ||
      `Map structure: tilesContained=${mapStructureCheck.tilesContained} markersContained=${mapStructureCheck.markersContained} clips=${mapStructureCheck.clips} overflow=${mapStructureCheck.overflow}`,
  ).toBe(true);
  } catch (err) {
    await saveConsoleAndRethrow(err);
  }
});

test(
  "Userscript challenge map (Pirates) shows eight event markers for athlete 482",
  async ({ page }, testInfo) => {
    const userscriptPath = path.join(
      __dirname,
      "..",
      "..",
      "..",
      "..",
      "..",
      "..",
      "..",
      "website",
      "assets",
      "js",
      "running-challenges.user.js",
    );
    if (!fs.existsSync(userscriptPath)) {
      throw new Error(
        `Userscript bundle not found at ${userscriptPath}. Run ./script/update from the repo root to build it.`,
      );
    }

    const consoleEvents = [];
    page.on("console", (msg) => {
      consoleEvents.push({ type: msg.type(), text: msg.text() });
    });
    page.on("pageerror", (err) => {
      consoleEvents.push({ type: "pageerror", text: err.message });
    });
    const saveConsoleAndRethrow = async (err) => {
      await testInfo.attach("userscript-console-and-errors.json", {
        body: JSON.stringify(consoleEvents, null, 2),
        contentType: "application/json",
      });
      fs.mkdirSync(PLAYWRIGHT_DEBUG_DIR, { recursive: true });
      fs.writeFileSync(
        path.join(PLAYWRIGHT_DEBUG_DIR, "userscript-console-and-errors.json"),
        JSON.stringify(consoleEvents, null, 2),
        "utf8",
      );
      throw err;
    };

    try {
      await installNetworkFreeMocks(page, countryDomain, "482");
      const eventsJsonPromise = page.waitForResponse(
        (resp) =>
          resp.url().includes("events.json") && resp.status() === 200,
        { timeout: 15000 },
      );
      await page.goto(
        `https://www.${countryDomain}/parkrunner/482/all/`,
        { waitUntil: "domcontentloaded" },
      );
      const userscriptSource = fs.readFileSync(userscriptPath, "utf8");
      await page.addScriptTag({ content: userscriptSource });
      await eventsJsonPromise;

      await expect(
        page.locator("#running_challenges_messages_div"),
      ).toHaveText("Additional badges provided by Running Challenges", {
        timeout: 20000,
      });

      await page.locator("#challenge_pirates_show_map").click();
      const piratesMap = page.locator("#challenge_map_pirates");
      await expect(piratesMap).toBeVisible({ timeout: 10000 });
      const markerCount = await piratesMap
        .locator(".leaflet-marker-icon")
        .count();
      expect(
        markerCount,
        `Pirates challenge map should have at least 8 event markers (8 qualifying events; extension shows 8), got ${markerCount}`,
      ).toBeGreaterThanOrEqual(8);
    } catch (err) {
      await saveConsoleAndRethrow(err);
    }
  },
);
