#!/bin/bash -xe

export VERSION=2.0.0
# Strip any 'v' characters from the version string, as exist in the git tag
export EXTENSION_BUILD_VERSION=`echo ${EXTENSION_BUILD_VERSION:-$VERSION} | sed -e s/v//`
# Default the build id variable to zero if not set - The CI system should set this to
# it's internal build number 
export EXTENSION_BUILD_ID=${EXTENSION_BUILD_ID:-0}
