/**
 * Run before any other userscript code so that extension code (which expects
 * globals $ and L) can run. Must be the first import in entry.js.
 */
import $ from "../node_modules/jquery/dist/jquery.js";
import L from "../node_modules/leaflet/dist/leaflet.js";

window.$ = window.jQuery = $;
window.L = L;
