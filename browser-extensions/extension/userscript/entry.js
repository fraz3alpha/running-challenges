// Entry point for the Running Challenges userscript bundle.
// This file is bundled and minified by scripts/build-userscript.mjs.
// Bootstrap must run first so window.$ and window.L exist before any extension code.
import "./bootstrap.js";

import "../node_modules/leaflet.fullscreen/Control.FullScreen.js";
import "../node_modules/leaflet.markercluster/dist/leaflet.markercluster.js";
import "../node_modules/leaflet-extra-markers/dist/js/leaflet.extra-markers.min.js";
import "../node_modules/leaflet-canvasicon/leaflet-canvasicon.js";
import "../node_modules/leaflet-piechart/leaflet-piechart.js";
import "./d3-bootstrap.js";

// Core extension logic, loaded in the same order as the browser extension.
import "../src/js/lib/cache.js";
import "../src/js/lib/i18n.js";
import "../src/js/lib/challenges.js";
import "../src/js/lib/challenges_ui.js";
import "../src/js/lib/escape-html.js";
import "../src/js/content-scripts/content-script-parkrunner.js";

// Ensure the main page initialiser runs once the DOM is ready.
if (typeof document !== "undefined") {
  const start = function () {
    if (typeof create_page === "function") {
      create_page();
    }
  };

  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    start();
  } else {
    window.addEventListener("DOMContentLoaded", start, { once: true });
  }
}

