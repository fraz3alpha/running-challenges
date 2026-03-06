#!/usr/bin/env bash
set -e

BUILD_WEBSITE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bash "$BUILD_WEBSITE_DIR/copy-assets.sh"

# Move into the website directory
cd website

SITE_DIR=_site

# Clear out the build directory
rm -rf ${SITE_DIR} && mkdir ${SITE_DIR}

# Set the production flag
export JEKYLL_ENV=production

# Build the site
bundle install
bundle exec jekyll build --trace

# Print summary
echo "Built site, total size: `du -sh ${SITE_DIR}`"

# Initialise the git repo
cd ${SITE_DIR}
# Add a file to say that the site doesn't need building
touch .nojekyll

# Setup git to push to the staging repo
git init
# Add the target remote
git remote add production https://${RUNNING_CHALLENGES_GITHUB_TOKEN}@github.com/fraz3alpha/running-challenges.git
# Create a new branch, and commit all the code
git checkout -b gh-pages
git add -A
git commit -m 'CI build for production'
git log -1
git push --force production gh-pages
