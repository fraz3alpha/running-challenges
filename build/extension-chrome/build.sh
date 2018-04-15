# Create empty build directory
export TMP_BUILD_DIR=browser-extensions/chrome/build
rm -rf ${TMP_BUILD_DIR} && mkdir -p ${TMP_BUILD_DIR}

mkdir -p ${TMP_BUILD_DIR}/images
# Copy the images that need to be bundled (we will actually only pack the .png files)
cp -r images/badges ${TMP_BUILD_DIR}/images/
cp -r images/flags ${TMP_BUILD_DIR}/images/
cp -r images/logo ${TMP_BUILD_DIR}/images/

# Copy the code
cp -r browser-extensions/chrome/js ${TMP_BUILD_DIR}/
cp -r browser-extensions/chrome/html ${TMP_BUILD_DIR}/

# Copy the metadata
cp -r browser-extensions/chrome/manifest.json ${TMP_BUILD_DIR}/

# Move into the build directory and package everything up
cd ${TMP_BUILD_DIR}
zip -r extension.zip js/ html/ images/**/*.png manifest.json
