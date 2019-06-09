export VERSION=0.7.6
# Strip any 'v' characters from the version string, as exist in the git tag
export EXTENSION_BUILD_VERSION=`echo ${EXTENSION_BUILD_VERSION:-$VERSION} | sed -e s/v//`
# Default the build id variable to zero if not set - Travis should set this to
# the Travis build number
export EXTENSION_BUILD_ID=${EXTENSION_BUILD_ID:-0}
