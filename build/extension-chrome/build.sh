# Create empty build directory
rm -rf browser-extensions/chrome/build && mkdir -p browser-extensions/chrome/build

mkdir -p browser-extensions/chrome/build/images
# cp -r images/badges/**/*/png browser-extensions/chrome/images/

cp -r browser-extensions/chrome/js browser-extensions/chrome/build/
cp -r browser-extensions/chrome/html browser-extensions/chrome/build/

cp -r browser-extensions/chrome/manifest.json browser-extensions/chrome/build/
