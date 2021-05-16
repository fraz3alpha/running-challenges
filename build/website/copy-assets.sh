#!/usr/bin/env bash

# Enable exit on failure
set -e

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
# Copy the required third party libraries from the top level shared project dir
mkdir -p website/assets/js/lib/third-party/
cp -r js/lib/third-party/jquery website/assets/js/lib/third-party/
cp -r js/lib/third-party/leaflet website/assets/js/lib/third-party/
cp -r js/lib/third-party/leaflet-canvasicon website/assets/js/lib/third-party/
cp -r js/lib/third-party/leaflet-extramarkers website/assets/js/lib/third-party/
cp -r js/lib/third-party/leaflet-fullscreen website/assets/js/lib/third-party/
cp -r js/lib/third-party/leaflet-markercluster website/assets/js/lib/third-party/
cp -r js/lib/third-party/leaflet-piechart website/assets/js/lib/third-party/

echo "Copying third party CSS libraries into the assets directory"
# Copy the required third party libraries from the top level shared project dir
mkdir -p website/assets/css/third-party/
cp -r css/third-party/leaflet website/assets/css/third-party/
cp -r css/third-party/leaflet-extramarkers website/assets/css/third-party/
cp -r css/third-party/leaflet-fullscreen website/assets/css/third-party/
cp -r css/third-party/leaflet-markercluster website/assets/css/third-party/
