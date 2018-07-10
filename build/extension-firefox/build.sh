#!/bin/bash -xe

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

# Copy the code
cp -r browser-extensions/chrome/js ${TMP_BUILD_DIR}/
cp -r browser-extensions/chrome/html ${TMP_BUILD_DIR}/
cp -r browser-extensions/chrome/css ${TMP_BUILD_DIR}/

# Replace all instances of "chrome-extension://" with "moz-extension://" for
# Firefox compatibility in css files
find ${TMP_BUILD_DIR}/ -type f -name "*.css" -exec sed -i "" "s/chrome-extension/moz-extension/g" {} \;


# Copy the metadata
cp -r browser-extensions/chrome/manifest.json.mozilla ${TMP_BUILD_DIR}/manifest.json

# Move into the build directory and package everything up
cd ${TMP_BUILD_DIR}
web-ext lint
web-ext build
