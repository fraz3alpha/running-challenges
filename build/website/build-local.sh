#!/usr/bin/env bash

# Set up tools variables
source build/tools.sh

# This script pushing the built copy of the this site to a staging repository

# Use this to make a file that won't be cached if we changed the contents.
# RUNNING_CHALLENGES_DATA_COMMIT=`cd running-challenges-data && git rev-parse HEAD`

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
cp -r js/lib/third-party/d3-voronoi website/assets/js/lib/third-party/
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

# echo "Copying data to website"
# mkdir -p website/assets/js/lib/data
# export DATA_GEO_JS="website/assets/js/lib/data/geo-${RUNNING_CHALLENGES_DATA_COMMIT}.js" && echo "var parkrun_data_geo = " > "${DATA_GEO_JS}" && cat running-challenges-data/data/parkrun-geo/parsed/geo.json >> "${DATA_GEO_JS}"
# export DATA_SPECIAL_EVENTS_JS="website/assets/js/lib/data/special-events-${RUNNING_CHALLENGES_DATA_COMMIT}.js" && echo "var parkrun_data_special_events = " > "${DATA_SPECIAL_EVENTS_JS}" && cat running-challenges-data/data/parkrun-special-events/2019-20/parsed/all.json >> "${DATA_SPECIAL_EVENTS_JS}"

# Replace the placeholders in the map includes, there is probably a better way to do this
# ${SED} -i "s/data\/geo-.*.js/data\/geo-${RUNNING_CHALLENGES_DATA_COMMIT}.js/" website/_pages/map.md
# ${SED} -i "s/data\/special-events-.*.js/data\/special-events-${RUNNING_CHALLENGES_DATA_COMMIT}.js/" website/_pages/map.md
# based on https://jekyllrb.com/docs/continuous-integration/travis-ci/

# Move into the website directory
cd website

SITE_DIR=_site

# Clear out the build directory
rm -rf ${SITE_DIR} && mkdir ${SITE_DIR}

docker run --rm --name jekyll \
-v `pwd`:/srv/jekyll \
-v `pwd`/vendor/bundle:/usr/local/bundle \
jekyll/jekyll jekyll build --trace

# Print summary
echo "Built site, total size: `du -sh ${SITE_DIR}`"
