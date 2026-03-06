#!/usr/bin/env node
/**
 * Build Chrome and Firefox extensions from browser-extensions/extension/src.
 * Expects EXTENSION_BUILD_VERSION and EXTENSION_BUILD_ID in env (set by caller from build/version.sh).
 * Run from repo root so that paths resolve correctly; or from extension package dir (script resolves root).
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const extensionDir = path.resolve(__dirname, "..");
const candidateRoot = path.resolve(extensionDir, "../..");
const root = fs.existsSync(path.join(candidateRoot, "build/version.sh"))
  ? candidateRoot
  : process.cwd();

const EXTENSION_BUILD_VERSION = process.env.EXTENSION_BUILD_VERSION || "2.0.1";
const EXTENSION_BUILD_ID = process.env.EXTENSION_BUILD_ID || "0";

const srcDir = path.join(extensionDir, "src");
const manifestDir = path.join(srcDir, "manifest");

function deepMerge(base, override) {
  const result = { ...base };
  for (const key of Object.keys(override)) {
    if (
      key in result &&
      typeof result[key] === "object" &&
      result[key] !== null &&
      !Array.isArray(result[key]) &&
      typeof override[key] === "object" &&
      override[key] !== null &&
      !Array.isArray(override[key])
    ) {
      result[key] = deepMerge(result[key], override[key]);
    } else {
      result[key] = override[key];
    }
  }
  return result;
}

function run(cmd, opts = {}) {
  execSync(cmd, { stdio: "inherit", cwd: root, ...opts });
}

function buildBrowser(browser) {
  const buildDir = path.join(root, "browser-extensions", browser, "build");

  console.log(`Building ${browser} extension...`);

  if (fs.existsSync(buildDir)) {
    fs.rmSync(buildDir, { recursive: true });
  }
  fs.mkdirSync(buildDir, { recursive: true });

  const nm = path.join(extensionDir, "node_modules");

  run(
    `mkdir -p "${buildDir}/images/badges" "${buildDir}/images/flags" "${buildDir}/css/third-party" "${buildDir}/js/lib/third-party"`,
  );
  run(`cp -r images/badges/256x256/*.png "${buildDir}/images/badges/"`);
  run(`cp -r images/flags/twemoji/png/*.png "${buildDir}/images/flags/"`);
  run(`cp -r images/logo "${buildDir}/images/"`);

  run(
    `mkdir -p "${buildDir}/js/lib/third-party/jquery" "${buildDir}/js/lib/third-party/leaflet" "${buildDir}/js/lib/third-party/leaflet-fullscreen" "${buildDir}/js/lib/third-party/leaflet-markercluster" "${buildDir}/js/lib/third-party/leaflet-extramarkers" "${buildDir}/js/lib/third-party/leaflet-canvasicon" "${buildDir}/js/lib/third-party/leaflet-piechart" "${buildDir}/js/lib/third-party/d3-voronoi"`,
  );
  run(
    `cp "${nm}/jquery/dist/jquery.js" "${buildDir}/js/lib/third-party/jquery/jquery-3.6.0.js"`,
  );
  run(
    `cp "${nm}/leaflet/dist/leaflet.js" "${buildDir}/js/lib/third-party/leaflet/leaflet-1.3.1.js"`,
  );
  run(
    `cp "${nm}/leaflet.fullscreen/Control.FullScreen.js" "${buildDir}/js/lib/third-party/leaflet-fullscreen/leaflet-fullscreen-1.1.0.js"`,
  );
  run(
    `cp "${nm}/leaflet.markercluster/dist/leaflet.markercluster.js" "${buildDir}/js/lib/third-party/leaflet-markercluster/leaflet-markercluster-1.3.0.js"`,
  );
  run(
    `cp "${nm}/leaflet-extra-markers/dist/js/leaflet.extra-markers.min.js" "${buildDir}/js/lib/third-party/leaflet-extramarkers/leaflet-extramarkers-1.0.6.js"`,
  );
  run(
    `cp "${nm}/d3-voronoi/dist/d3-voronoi.js" "${buildDir}/js/lib/third-party/d3-voronoi/d3-voronoi.js"`,
  );
  run(
    `cp "${nm}/leaflet-canvasicon/leaflet-canvasicon.js" "${buildDir}/js/lib/third-party/leaflet-canvasicon/leaflet-canvasicon-0.1.6.js"`,
  );
  run(
    `cp "${nm}/leaflet-piechart/leaflet-piechart.js" "${buildDir}/js/lib/third-party/leaflet-piechart/leaflet-piechart-0.1.2.js"`,
  );

  run(
    `mkdir -p "${buildDir}/css/third-party/leaflet" "${buildDir}/css/third-party/leaflet-fullscreen" "${buildDir}/css/third-party/leaflet-markercluster" "${buildDir}/css/third-party/leaflet-extramarkers"`,
  );
  run(
    `cp "${nm}/leaflet/dist/leaflet.css" "${buildDir}/css/third-party/leaflet/leaflet.css"`,
  );
  run(
    `cp -r "${nm}/leaflet/dist/images" "${buildDir}/css/third-party/leaflet/"`,
  );
  const extramarkersCssDir = path.join(
    nm,
    "leaflet-extra-markers",
    "dist",
    "css",
  );
  const extramarkersImgDir = path.join(
    nm,
    "leaflet-extra-markers",
    "dist",
    "img",
  );
  const extramarkersDest = path.join(
    buildDir,
    "css",
    "third-party",
    "leaflet-extramarkers",
  );
  run(`mkdir -p "${extramarkersDest}/images"`);
  run(
    `cp "${extramarkersCssDir}/leaflet.extra-markers.min.css" "${extramarkersDest}/leaflet.extra-markers.css"`,
  );
  run(`cp ${extramarkersImgDir}/*.png "${extramarkersDest}/images/"`);
  const extramarkersCssPath = path.join(
    extramarkersDest,
    "leaflet.extra-markers.css",
  );
  const cssContent = fs.readFileSync(extramarkersCssPath, "utf8");
  const extensionUrlPrefix =
    browser === "chrome"
      ? "chrome-extension://__MSG_@@extension_id__"
      : "moz-extension://__MSG_@@extension_id__";
  const basePath = `${extensionUrlPrefix}/css/third-party/leaflet-extramarkers/images`;
  const rewrittenCss = cssContent.replace(
    /url\("\.\.\/img\/([^"]+)"\)/g,
    (_, file) => `url("${basePath}/${file}")`,
  );
  fs.writeFileSync(extramarkersCssPath, rewrittenCss);
  run(
    `cp "${nm}/leaflet.fullscreen/Control.FullScreen.css" "${buildDir}/css/third-party/leaflet-fullscreen/Control.FullScreen.css"`,
  );
  run(
    `cp "${nm}/leaflet.fullscreen/icon-fullscreen.png" "${buildDir}/css/third-party/leaflet-fullscreen/icon-fullscreen.png"`,
  );
  run(
    `cp "${nm}/leaflet.fullscreen/icon-fullscreen-2x.png" "${buildDir}/css/third-party/leaflet-fullscreen/icon-fullscreen-2x.png"`,
  );
  run(
    `cp "${nm}/leaflet.markercluster/dist/MarkerCluster.css" "${buildDir}/css/third-party/leaflet-markercluster/"`,
  );
  run(
    `cp "${nm}/leaflet.markercluster/dist/MarkerCluster.Default.css" "${buildDir}/css/third-party/leaflet-markercluster/"`,
  );
  run(
    `rsync -av browser-extensions/extension/src/js "${buildDir}" --exclude tests`,
  );
  run(
    `cp -r browser-extensions/extension/src/html browser-extensions/extension/src/css "${buildDir}/"`,
  );
  if (fs.existsSync(path.join(srcDir, "images"))) {
    run(
      `cp -r browser-extensions/extension/src/images/* "${buildDir}/images/"`,
    );
  }

  fs.writeFileSync(
    path.join(buildDir, "js/lib/version.js"),
    `var extensionVersion = "${EXTENSION_BUILD_VERSION}"\n`,
  );

  const baseManifest = JSON.parse(
    fs.readFileSync(path.join(manifestDir, "base.json"), "utf8"),
  );
  const overrideManifest = JSON.parse(
    fs.readFileSync(path.join(manifestDir, `${browser}.json`), "utf8"),
  );
  const manifest = deepMerge(baseManifest, overrideManifest);
  let manifestStr = JSON.stringify(manifest, null, 2);
  manifestStr = manifestStr
    .replace(/REPLACE_EXTENSION_BUILD_VERSION/g, EXTENSION_BUILD_VERSION)
    .replace(/REPLACE_EXTENSION_BUILD_ID/g, EXTENSION_BUILD_ID);
  fs.writeFileSync(path.join(buildDir, "manifest.json"), manifestStr + "\n");

  const artifactsDir = path.join(buildDir, "web-ext-artifacts");
  run(
    `pnpm exec web-ext build --source-dir "${buildDir}" --artifacts-dir "${artifactsDir}" --ignore-files js/lib/third-party/**`,
  );
  if (browser === "firefox") {
    try {
      // Ignore third-party libraries in lint to avoid noise from their innerHTML usage.
      run(
        `pnpm exec web-ext lint --self-hosted --source-dir "${buildDir}" --ignore-files js/lib/third-party/**`,
      );
    } catch (_) {
      // lint can fail (e.g. Bus error on some platforms); build already ran
    }
  }

  const zips = fs
    .readdirSync(artifactsDir)
    .filter((f) => f.startsWith("running_challenges-") && f.endsWith(".zip"));
  for (const zip of zips) {
    if (!zip.includes(`running_challenges-${browser}`)) {
      const newName = zip.replace(
        "running_challenges-",
        `running_challenges-${browser}-`,
      );
      fs.renameSync(
        path.join(artifactsDir, zip),
        path.join(artifactsDir, newName),
      );
    }
  }

  const finalZips = fs
    .readdirSync(artifactsDir)
    .filter((f) => f.endsWith(".zip"));
  finalZips.forEach((f) => console.log(path.join(artifactsDir, f)));
}

buildBrowser("chrome");
buildBrowser("firefox");
console.log("Extension build complete.");
