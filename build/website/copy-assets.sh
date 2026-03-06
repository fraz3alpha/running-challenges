#!/usr/bin/env bash
set -e

# Run from repo root so paths (website/, images/, js/, etc.) resolve
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "Copying shared resources to the website folder"

echo "Copying badges to website img/badges directory"
mkdir -p website/img/badges
cp -r images/badges/256x256/*.png website/img/badges/

echo "Copying flags to website img/flags directory"
mkdir -p website/img/flags
cp -r images/flags/twemoji/png/*.png website/img/flags/

echo "Copying logos to website img/logo directory"
mkdir -p website/img/logo
cp -r images/logo/*.png website/img/logo/

echo "Copying screenshots to website img/screenshots directory"
mkdir -p website/img/screenshots
cp -r images/screenshots/*.png website/img/screenshots/

echo "Copying third party Javascript libraries into the assets directory"
mkdir -p website/assets/js/lib/third-party/
JQ_NM="browser-extensions/extension/node_modules/jquery/dist"
mkdir -p website/assets/js/lib/third-party/jquery
cp "$JQ_NM/jquery.min.js" website/assets/js/lib/third-party/jquery/jquery-3.6.0.js
L_NM="browser-extensions/extension/node_modules/leaflet/dist"
mkdir -p website/assets/js/lib/third-party/leaflet
cp "$L_NM/leaflet.js" website/assets/js/lib/third-party/leaflet/leaflet-1.3.1.js
D3_NM="browser-extensions/extension/node_modules/d3-voronoi/dist"
mkdir -p website/assets/js/lib/third-party/d3-voronoi
cp "$D3_NM/d3-voronoi.js" website/assets/js/lib/third-party/d3-voronoi/d3-voronoi.js
LEM_DIST="browser-extensions/extension/node_modules/leaflet-extra-markers/dist"
mkdir -p website/assets/js/lib/third-party/leaflet-extramarkers
cp "$LEM_DIST/js/leaflet.extra-markers.min.js" website/assets/js/lib/third-party/leaflet-extramarkers/leaflet-extramarkers-1.0.6.js
LFS_NM="browser-extensions/extension/node_modules/leaflet.fullscreen"
mkdir -p website/assets/js/lib/third-party/leaflet-fullscreen
cp "$LFS_NM/Control.FullScreen.js" website/assets/js/lib/third-party/leaflet-fullscreen/leaflet-fullscreen-1.1.0.js
LM_NM="browser-extensions/extension/node_modules/leaflet.markercluster/dist"
mkdir -p website/assets/js/lib/third-party/leaflet-markercluster
cp "$LM_NM/leaflet.markercluster.js" website/assets/js/lib/third-party/leaflet-markercluster/leaflet-markercluster-1.3.0.js
LCI_NM="browser-extensions/extension/node_modules/leaflet-canvasicon"
mkdir -p website/assets/js/lib/third-party/leaflet-canvasicon
cp "$LCI_NM/leaflet-canvasicon.js" website/assets/js/lib/third-party/leaflet-canvasicon/leaflet-canvasicon-0.1.6.js
LPC_NM="browser-extensions/extension/node_modules/leaflet-piechart"
mkdir -p website/assets/js/lib/third-party/leaflet-piechart
cp "$LPC_NM/leaflet-piechart.js" website/assets/js/lib/third-party/leaflet-piechart/leaflet-piechart-0.1.2.js

echo "Copying third party CSS libraries into the assets directory"
mkdir -p website/assets/css/third-party/
mkdir -p website/assets/css/third-party/leaflet
cp "$L_NM/leaflet.css" website/assets/css/third-party/leaflet/
cp -r "$L_NM/images" website/assets/css/third-party/leaflet/
mkdir -p website/assets/css/third-party/leaflet-extramarkers/images
cp "$LEM_DIST/css/leaflet.extra-markers.min.css" website/assets/css/third-party/leaflet-extramarkers/leaflet.extra-markers.css
sed 's|url("../img/|url("images/|g' website/assets/css/third-party/leaflet-extramarkers/leaflet.extra-markers.css > website/assets/css/third-party/leaflet-extramarkers/leaflet.extra-markers.css.tmp && mv website/assets/css/third-party/leaflet-extramarkers/leaflet.extra-markers.css.tmp website/assets/css/third-party/leaflet-extramarkers/leaflet.extra-markers.css
cp "$LEM_DIST/img/"*.png website/assets/css/third-party/leaflet-extramarkers/images/
mkdir -p website/assets/css/third-party/leaflet-fullscreen
cp "$LFS_NM/Control.FullScreen.css" website/assets/css/third-party/leaflet-fullscreen/leaflet-fullscreen.css
cp "$LFS_NM/icon-fullscreen.png" "$LFS_NM/icon-fullscreen-2x.png" website/assets/css/third-party/leaflet-fullscreen/
mkdir -p website/assets/css/third-party/leaflet-markercluster
cp "$LM_NM/MarkerCluster.css" "$LM_NM/MarkerCluster.Default.css" website/assets/css/third-party/leaflet-markercluster/
