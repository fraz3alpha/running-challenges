# Plan: Finish third-party CSS (source from npm)

## Current state (after implementation)

- **Leaflet core**: CSS and images come from npm in the build (`leaflet/dist/leaflet.css`, `leaflet/dist/images`).
- **leaflet.fullscreen**: CSS and icons from npm (`Control.FullScreen.css`, `icon-fullscreen*.png`).
- **leaflet.markercluster**: CSS from npm (`MarkerCluster.css`, `MarkerCluster.Default.css`).
- **leaflet-extramarkers**: **Done.** CSS and images are sourced from the `leaflet-extra-markers` npm package in the build script; extension URL rewriting is done in-script. The vendored `css/third-party/leaflet-extramarkers` directory has been removed.

The only remaining “third-party CSS” to finish was **leaflet-extramarkers**; it is now sourced from npm with in-build URL rewriting.

## Goal

1. Source leaflet-extramarkers **CSS and images** from `node_modules/leaflet-extra-markers` (e.g. `dist/` or equivalent) in the build, same as we do for JS.
2. Keep extension URL rewriting (Chrome vs Firefox) so marker images load correctly in the extension context.
3. Remove the vendored `css/third-party/leaflet-extramarkers` from the repo.

## Steps

### 1. Confirm npm package layout

- From repo root (or `browser-extensions/extension` where `nm` points): inspect `node_modules/leaflet-extra-markers` (or the pnpm-linked path).
- Find:
  - CSS file (e.g. `dist/leaflet.extra-markers.css` or `dist/css/...`).
  - Image directory and filenames (e.g. `images/markers_default.png`, `markers_shadow.png`, `*@2x.png`). The package uses `img/`; we copy to `images/` and rewrite URLs in the build script.

### 2. Change the build script

- **Current:** `cp -r css/third-party/leaflet-extramarkers "${buildDir}/css/third-party/"` (from repo root).
- **New:**
  - Copy leaflet-extramarkers **CSS** from npm into `"${buildDir}/css/third-party/leaflet-extramarkers/"` (e.g. to `leaflet.extra-markers.css`).
  - Copy leaflet-extramarkers **images** from npm into `"${buildDir}/css/third-party/leaflet-extramarkers/images/"` (same path the CSS expects after rewriting).
- After copying, read the CSS in Node, replace `url("../img/...")` with the appropriate `chrome-extension://` or `moz-extension://` URL, and write the result.

### 3. Verify and remove vendored CSS

- Run the full extension build and load in Chrome and Firefox; confirm marker icons (e.g. on the explorer map) render.
- Run the Playwright UI tests (including “Leaflet markers load with icons (no network)”) to guard regressions.
- Remove the vendored directory at repo root: `css/third-party/leaflet-extramarkers/`.

### 4. Update docs

- **pnpm-migration.md**: State that leaflet-extramarkers (and other third-party) CSS/images are sourced from npm with in-build URL rewriting.

## Risks / notes

- **Image path mismatch**: If the npm package uses `img/` instead of `images/`, copy or symlink into `images/` in the build so the rewritten CSS still matches.
- **No other vendored CSS**: After this, there are no remaining vendored third-party assets in the plan; leaflet-piechart is sourced from GitHub via pnpm. No further “third-party CSS” to migrate for the current plan.

## Out of scope (unchanged)

- leaflet-canvasicon and leaflet-piechart are from npm / GitHub (pnpm); no vendored JS remains.
- No new bundler or build tool; we only change where leaflet-extramarkers CSS/images come from and how extension URLs are applied.
