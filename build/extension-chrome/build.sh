#!/bin/bash -xe

# Set up version variables
source build/version.sh

# Create empty build directory
export TMP_BUILD_DIR=browser-extensions/chrome/build
rm -rf ${TMP_BUILD_DIR} && mkdir -p ${TMP_BUILD_DIR}

# Copy the images that need to be bundled
mkdir -p ${TMP_BUILD_DIR}/images

mkdir ${TMP_BUILD_DIR}/images/badges
cp -r images/badges/256x256/*.png ${TMP_BUILD_DIR}/images/badges/

mkdir ${TMP_BUILD_DIR}/images/flags
cp -r images/flags/twemoji/png/*.png ${TMP_BUILD_DIR}/images/flags/

cp -r images/logo ${TMP_BUILD_DIR}/images/

# Copy the common code
cp -r browser-extensions/common/js ${TMP_BUILD_DIR}/
cp -r browser-extensions/common/html ${TMP_BUILD_DIR}/
cp -r browser-extensions/common/css ${TMP_BUILD_DIR}/

# Copy the extras libraries and code for Chrome
cp -r browser-extensions/chrome/js ${TMP_BUILD_DIR}/

# Copy the metadata
cp -r browser-extensions/chrome/manifest.json ${TMP_BUILD_DIR}/

# Replace placeholders in the manifest file
sed -i "s/REPLACE_EXTENSION_BUILD_ID/$EXTENSION_BUILD_ID/" ${TMP_BUILD_DIR}/manifest.json
sed -i "s/REPLACE_EXTENSION_BUILD_VERSION/$EXTENSION_BUILD_VERSION/" ${TMP_BUILD_DIR}/manifest.json

# Move into the build directory and package everything up
cd ${TMP_BUILD_DIR}
# zip -r extension.zip js/ html/ images/ css/ manifest.json
web-ext lint
web-ext build
