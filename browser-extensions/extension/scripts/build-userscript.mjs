#!/usr/bin/env node

import esbuild from "esbuild";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const extensionDir = path.resolve(__dirname, "..");
const rootDir = path.resolve(extensionDir, "..", "..");
const websiteJsDir = path.join(rootDir, "website", "assets", "js");
const outfile = path.join(websiteJsDir, "running-challenges.user.js");

const leafletCssPath = path.join(
  extensionDir,
  "node_modules",
  "leaflet",
  "dist",
  "leaflet.css",
);
const extramarkersCssPath = path.join(
  extensionDir,
  "node_modules",
  "leaflet-extra-markers",
  "dist",
  "css",
  "leaflet.extra-markers.min.css",
);
const EXTRAMARKERS_IMG_BASE =
  "https://unpkg.com/leaflet-extra-markers@1.0.6/dist/img/";

let leafletCssEmbed = '""';
if (fs.existsSync(leafletCssPath)) {
  let combinedCss =
    ".leaflet-container { position: relative; }\n" +
    fs.readFileSync(leafletCssPath, "utf8");
  if (fs.existsSync(extramarkersCssPath)) {
    const extramarkersCss = fs.readFileSync(extramarkersCssPath, "utf8");
    combinedCss +=
      "\n" +
      extramarkersCss.replace(/url\s*\(\s*["']?\.\.\/img\//g, `url("${EXTRAMARKERS_IMG_BASE}`);
  }
  leafletCssEmbed = JSON.stringify(combinedCss);
}

// Tampermonkey etc. expect @version in the form x.y.z (three parts)
const USCRIPT_VERSION = (process.env.EXTENSION_BUILD_VERSION || "2.0.1").replace(
  /^v/,
  "",
);

const userscriptHeader = `// ==UserScript==
// @name         Running Challenges
// @namespace    https://running-challenges.co.uk/
// @version      ${USCRIPT_VERSION}
// @description  Adds Running Challenges badges to your parkrun results page without installing a browser extension.
// @author       Running Challenges
// @match        https://www.parkrun.ca/parkrunner/*/all/
// @match        https://www.parkrun.co.at/parkrunner/*/all/
// @match        https://www.parkrun.co.nl/parkrunner/*/all/
// @match        https://www.parkrun.co.nz/parkrunner/*/all/
// @match        https://www.parkrun.co.za/parkrunner/*/all/
// @match        https://www.parkrun.com.au/parkrunner/*/all/
// @match        https://www.parkrun.com.de/parkrunner/*/all/
// @match        https://www.parkrun.dk/parkrunner/*/all/
// @match        https://www.parkrun.fi/parkrunner/*/all/
// @match        https://www.parkrun.fr/parkrunner/*/all/
// @match        https://www.parkrun.ie/parkrunner/*/all/
// @match        https://www.parkrun.it/parkrunner/*/all/
// @match        https://www.parkrun.jp/parkrunner/*/all/
// @match        https://www.parkrun.lt/parkrunner/*/all/
// @match        https://www.parkrun.my/parkrunner/*/all/
// @match        https://www.parkrun.no/parkrunner/*/all/
// @match        https://www.parkrun.org.uk/parkrunner/*/all/
// @match        https://www.parkrun.pl/parkrunner/*/all/
// @match        https://www.parkrun.ru/parkrunner/*/all/
// @match        https://www.parkrun.se/parkrunner/*/all/
// @match        https://www.parkrun.sg/parkrunner/*/all/
// @match        https://www.parkrun.us/parkrunner/*/all/
// @run-at       document-end
// @grant        none
// ==/UserScript==`;

const shim = `
(function () {
  if (typeof document !== "undefined" && document.head) {
    var _s = document.createElement("style");
    _s.textContent = ${leafletCssEmbed};
    document.head.appendChild(_s);
  }
  // Provide a minimal chrome-style API so the extension code can run unchanged.
  if (typeof window.chrome === "undefined") {
    window.chrome = {};
  }
  var chrome = window.chrome;

  if (!chrome.runtime) {
    chrome.runtime = {
      getURL: function (path) {
        var p = path.charAt(0) === "/" ? path.slice(1) : path;
        if (!p) return "https://running-challenges.co.uk/";
        var base = "https://running-challenges.co.uk/";
        if (p.indexOf("images/") === 0) {
          return base + "img/" + p.slice(7);
        }
        if (p.indexOf("html/") === 0) {
          if (p === "html/help.html" || p === "html/options.html") {
            return base + "getstarted/";
          }
          return base + p;
        }
        return base + p;
      },
    };
  }

  // Always use our localStorage-backed shim so the script works without the extension.
  chrome.storage = chrome.storage || {};
  var prefix = "rc_";
  chrome.storage.local = {
      get: function (keysOrDefaults) {
        return new Promise(function (resolve) {
          var result = {};
          if (Array.isArray(keysOrDefaults)) {
            keysOrDefaults.forEach(function (key) {
              var raw = localStorage.getItem(prefix + key);
              if (raw != null) {
                try {
                  result[key] = JSON.parse(raw);
                } catch (_) {
                  result[key] = raw;
                }
              }
            });
          } else if (keysOrDefaults && typeof keysOrDefaults === "object") {
            Object.keys(keysOrDefaults).forEach(function (key) {
              var raw = localStorage.getItem(prefix + key);
              if (raw != null) {
                try {
                  result[key] = JSON.parse(raw);
                } catch (_) {
                  result[key] = raw;
                }
              } else {
                result[key] = keysOrDefaults[key];
              }
            });
          }
          resolve(result);
        });
      },
      set: function (items) {
        return new Promise(function (resolve) {
          Object.keys(items).forEach(function (key) {
            localStorage.setItem(prefix + key, JSON.stringify(items[key]));
          });
          resolve();
        });
      },
      remove: function (keys) {
        return new Promise(function (resolve) {
          if (!Array.isArray(keys)) keys = [keys];
          keys.forEach(function (key) {
            localStorage.removeItem(prefix + key);
          });
          resolve();
        });
      },
    };

  if (typeof window.browserAPI === "undefined") {
    window.browserAPI = chrome;
  }
  if (typeof window.extensionVersion === "undefined") {
    window.extensionVersion = "userscript";
  }
})();`;

async function build() {
  await esbuild.build({
    entryPoints: [path.join(extensionDir, "userscript", "entry.js")],
    bundle: true,
    minify: true,
    format: "iife",
    target: ["chrome100", "firefox100"],
    outfile,
    banner: {
      js: `${userscriptHeader}\n\n${shim}\n`,
    },
  });
  // eslint-disable-next-line no-console
  console.log(`Built userscript to ${outfile}`);
}

build().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

