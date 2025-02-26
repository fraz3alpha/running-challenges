#!/bin/bash -xe

if ! type -p web-ext &>/dev/null; then
    npm install --global web-ext
fi

# Set up version variables
source build/version.sh
# Set up tools variables
source build/tools.sh

# Create empty build directory
export TMP_BUILD_DIR=browser-extensions/firefox/build
rm -rf ${TMP_BUILD_DIR} && mkdir -p ${TMP_BUILD_DIR}

# Copy the images that need to be bundled
mkdir -p ${TMP_BUILD_DIR}/images

mkdir ${TMP_BUILD_DIR}/images/badges
cp -r images/badges/256x256/*.png ${TMP_BUILD_DIR}/images/badges/

mkdir ${TMP_BUILD_DIR}/images/flags
cp -r images/flags/twemoji/png/*.png ${TMP_BUILD_DIR}/images/flags/

cp -r images/logo ${TMP_BUILD_DIR}/images/

# Copy the required third party CSS libraries from the top level shared project dir
mkdir -p ${TMP_BUILD_DIR}/css/third-party/
cp -r css/third-party/leaflet ${TMP_BUILD_DIR}/css/third-party/
cp -r css/third-party/leaflet-extramarkers ${TMP_BUILD_DIR}/css/third-party/
cp -r css/third-party/leaflet-fullscreen ${TMP_BUILD_DIR}/css/third-party/
cp -r css/third-party/leaflet-markercluster ${TMP_BUILD_DIR}/css/third-party/

# Copy the required third party Javascript libraries from the top level shared project dir
mkdir -p ${TMP_BUILD_DIR}/js/lib/third-party/
cp -r js/lib/third-party/jquery ${TMP_BUILD_DIR}/js/lib/third-party/
cp -r js/lib/third-party/leaflet ${TMP_BUILD_DIR}/js/lib/third-party/
cp -r js/lib/third-party/leaflet-canvasicon ${TMP_BUILD_DIR}/js/lib/third-party/
cp -r js/lib/third-party/leaflet-extramarkers ${TMP_BUILD_DIR}/js/lib/third-party/
cp -r js/lib/third-party/leaflet-fullscreen ${TMP_BUILD_DIR}/js/lib/third-party/
cp -r js/lib/third-party/leaflet-markercluster ${TMP_BUILD_DIR}/js/lib/third-party/
cp -r js/lib/third-party/leaflet-piechart ${TMP_BUILD_DIR}/js/lib/third-party/
cp -r js/lib/third-party/d3-voronoi ${TMP_BUILD_DIR}/js/lib/third-party/

# Copy the common code, but don't include the tests
rsync -av browser-extensions/common/js ${TMP_BUILD_DIR} --exclude tests 
cp -r browser-extensions/common/html ${TMP_BUILD_DIR}/
cp -r browser-extensions/common/css ${TMP_BUILD_DIR}/

# Write out the version file
echo "var extensionVersion = \"${EXTENSION_BUILD_VERSION}\"" > ${TMP_BUILD_DIR}/js/lib/version.js

# Copy the extras libraries and code for Firefox
# None at the moment

# Replace all instances of "chrome-extension://" with "moz-extension://" for
# Firefox compatibility in css files
# Deprecated in preference of using .patch files
# find ${TMP_BUILD_DIR}/ -type f -name "*.css" -exec ${SED} -i "s/chrome-extension/moz-extension/g" {} \;

# Copy the metadata
cp browser-extensions/firefox/manifest.json ${TMP_BUILD_DIR}/manifest.json

# Replace placeholders in the manifest file
${SED} -i "s/REPLACE_EXTENSION_BUILD_ID/$EXTENSION_BUILD_ID/" ${TMP_BUILD_DIR}/manifest.json
${SED} -i "s/REPLACE_EXTENSION_BUILD_VERSION/$EXTENSION_BUILD_VERSION/" ${TMP_BUILD_DIR}/manifest.json

# Apply the custom patches
for i in patches/firefox/*.patch; do patch -p0 --directory "${TMP_BUILD_DIR}" < $i; done

# Move into the build directory and package everything up
cd ${TMP_BUILD_DIR}
web-ext lint
web-ext build

# Rename built package with the browser in the name
find web-ext-artifacts -type f -name "running_challenges-*.zip" -exec  bash -c 'x="{}"; mv $x "`echo $x | sed s/running_challenges/running_challenges-firefox/`"' \;

# Print the size of the built extension
ls -l web-ext-artifacts/running_challenges-*.zip
