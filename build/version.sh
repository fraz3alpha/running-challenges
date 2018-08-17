export VERSION=0.7.0
export EXTENSION_BUILD_VERSION=${EXTENSION_BUILD_VERSION:-$VERSION}
# Default the build id variable to zero if not set - Travis should set this to
# the Travis build number
export EXTENSION_BUILD_ID=${EXTENSION_BUILD_ID:-0}
