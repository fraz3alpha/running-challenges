# Third-party libraries

The following third-party libraries have been used in this extension (this
information exists in under each [third-party library folder](https://github.com/fraz3alpha/running-challenges/tree/master/js/lib/third-party),
but is summarised here for ease of use):

- jquery v3.6.0 — from pnpm (`browser-extensions/extension`); extension and website build copy from `node_modules/jquery/dist` (no vendored copy).
- leaflet v1.3.1 — from pnpm (`browser-extensions/extension`); extension and website build copy from `node_modules/leaflet/dist` (JS, CSS, images; no vendored copy).
- d3-voronoi v1.1.4 — from pnpm (`browser-extensions/extension`); extension and website build copy from `node_modules/d3-voronoi/dist` (no vendored copy).

The LeafletJS library is extensible. The following are from pnpm (`browser-extensions/extension`); extension and website build copy from `node_modules` (no vendored copy):

- leaflet-extra-markers v1.0.6 (JS + CSS/images; CSS URL rewrite in extension build)
- leaflet.fullscreen v1.1.0 (JS + CSS + icons)
- leaflet.markercluster v1.3.0 (JS + CSS)

- leaflet-canvasicon v0.1.6 — from pnpm; extension and website build copy from `node_modules/leaflet-canvasicon`.
- leaflet-piechart v0.1.3 — from pnpm (GitHub: sashakavun/leaflet-piechart#29fcbb6be4c5e303cf3d0b94ea95997549afffa9); extension and website build copy from `node_modules/leaflet-piechart`.

Third-party CSS (Leaflet, leaflet-extramarkers, etc.) is copied from pnpm in the
extension build; extension URL rewriting for assets is done in the build script.
