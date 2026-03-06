// Expose d3.voronoi on window for code that expects global d3 (e.g. challenges_ui.js).
import * as d3Voronoi from "../node_modules/d3-voronoi/dist/d3-voronoi.js";

if (typeof window !== "undefined") {
  window.d3 = Object.assign(window.d3 || {}, d3Voronoi);
}
