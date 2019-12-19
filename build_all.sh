#!/bin/bash -xe

# Build Firefox add-on
./build/extension-firefox/build.sh

# Build Chrome extension
./build/extension-chrome/build.sh
