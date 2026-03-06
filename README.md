# Running Challenges

A browser extension to allow you to complete challenges with your parkrun results

The generated extension (initially created for Chrome) adds extra information
to your parkrun results page to describe progress towards various challenges,
including 'Alphabeteer' (running a parkrun starting with every letter of the
alphabet), 'Tourist' (running 20 or more different parkruns), and many more.

# Building the repository

## Website

The `/website` folder containers a Jekyll-based website. You can build and serve the website
locally for testing by running a bash script (Linux and Mac only).

1. From the root of the project, run the bash script:

   `./build/website/build-local-and-run.sh`

   If you have other Jekyll sites running in Docker containers, you can specify a port mapping
   when you run the script (eg to expose port 4002 instead of the default 4000):

   `JEKYLL_PORT=4002 ./build/website/build-local-and-run.sh`

1. In a web browser, open the locally-hosted website:

   `http://localhost:4002/`

   Any changes you make to pages of the website should automatically get picked up when you refresh (F5) the page.

1. To stop the local website running, press CTRL+C in the terminal.

You might find you need to update the Gemfile.lock file occasionally.

## Updating Ruby Dependencies

### Option 1: Using Dependabot (Recommended)

Dependabot will automatically create pull requests for outdated Ruby dependencies. Check the [Dependencies tab](https://github.com/fraz3alpha/running-challenges/network/dependencies) or look for PRs labeled `dependencies` and `ruby`.

### Option 2: Manual Update

If you need to update manually, run from the `website` directory:

```bash
cd website
bundle update
git add Gemfile.lock
git commit -m "chore: update Ruby dependencies"
```

### Option 3: Using Docker (Legacy)

If you prefer the Docker approach:

```bash
cd website
docker run -it -v `pwd`:/tmp/website-data jekyll/jekyll bash
```

Then inside the container:

```bash
bundle update
```

## Browser Extensions: Docker build

You can test local changes by building both the Chrome and Firefox extensions at once with Docker:

From the root of the repository, build the image:

```
docker build -t rc:latest .
```

Then run the Docker container:

```
docker run --rm -v `pwd`:/rc rc:latest
```

## Browser Extensions: non-Docker build

The bulk of the code that is common to the Chrome and Firefox extensions lives
in the `browser-extensions/extension/src` directory, and is supplemented by additional
browser-specific files and libraries from either `browser-extensions/chrome` or
`browser-extensions/firefox` when the extension is built.

Most of the images live in the top-level directory `images` so that they are
shared between the extensions and the website, they are also copied into the
extension when a build occurs.

### Build Dependencies

Mozilla provide a small tool - [`web-ext` tool](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Getting_started_with_web-ext),
to package and lint check Firefox browser extensions,
which is used for packaging both the Chrome and Firefox extensions. The lint
checking is of limited use for Chrome, but is still run for reference. Install it
with `pnpm add -g web-ext` (or use the toolchain from `mise.toml` via `./script/bootstrap`).

### Building the extensions

Both the Chrome and Firefox extensions are built from a single source tree under
`browser-extensions/extension/src/`. The recommended way to build is:

```
./script/setup
```

or, after bootstrapping, `./script/update`. You can also build directly with:

```
source build/version.sh && export EXTENSION_BUILD_VERSION EXTENSION_BUILD_ID
pnpm --filter running-challenges-extension run build:extension
```

Third-party libraries (jQuery, Leaflet, and plugins) are installed as pnpm
dependencies and copied into the build; the build script uses the extension
package’s `node_modules`. This produces unpacked and packaged builds in
`browser-extensions/chrome/build` and `browser-extensions/firefox/build`
(including `web-ext-artifacts` with the `.zip` packages).

Your build of the extension is not signed, so Firefox does not allow you to install it directly from your built file.
Instead, for testing purposes, you have to install it as a [temporary installation in Firefox](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/) (it automatically deletes itself when you quit Firefox).

## Development scripts

This repository includes a `script/` directory that follows GitHub's [scripts-to-rule-them-all](https://github.com/github/scripts-to-rule-them-all) pattern.
These scripts are the preferred way to bootstrap the project, run tests, and quickly see changes in the browser extensions.

- `./script/bootstrap`  
  Installs core tooling (via `mise` and `pnpm`) and JavaScript test dependencies; see `build/README.md` for build-time details.

- `./script/setup`  
  Runs `script/bootstrap`, then builds both the Chrome and Firefox extensions via the Node build script.

- `./script/update`  
  Rebuilds both extensions (after bootstrap), and is safe to run after pulling new changes.

- `./script/server [PARKRUN_URL]`  
  Rebuilds the extensions via `script/update`, then runs `web-ext run` against the Firefox build so you can see changes in Firefox immediately.
  - If `PARKRUN_URL` is provided as the first argument, that URL is opened.
  - If no argument is given, the `PARKRUN_URL` environment variable is used if set.
  - If neither is provided, it defaults to `https://www.parkrun.com.au/parkrunner/1001388/all`.

- `./script/server-website [PORT]`  
  Builds the website assets and runs the local Jekyll site via Docker (`build/website/build-local-and-run.sh`). If `PORT` is provided, it overrides the `JEKYLL_PORT` environment variable for that run (default 4000).

- `./script/test`
  Runs the JavaScript unit tests with coverage via the `running-challenges-tests` pnpm workspace package (`browser-extensions/extension/src/js/tests`), then runs the Playwright UI tests in `browser-extensions/extension/src/js/tests/ui-test` (Chrome extension loaded via `@playwright/test`).

- `./script/cibuild`  
  Wrapper suitable for CI servers; currently runs `script/test`.

## Tool versions with mise

To ensure consistent tool versions between local development and CI, this repository uses [`mise`](https://mise.jdx.dev/):

- Tool versions are defined in `mise.toml` (for example, Node.js 20, pnpm 10, and Ruby 3.4).
- On a local machine:
  - Install [mise](https://mise.jdx.dev/) if you do not have it, then from the repository root run `./script/bootstrap`. Bootstrap runs `mise install` to install the toolchain (Node.js, pnpm, Ruby) from `mise.toml`, then `pnpm install` for extension build dependencies (such as `web-ext`).
- In GitHub Actions, the [`jdx/mise-action`](https://github.com/jdx/mise-action) workflow step reads `mise.toml` and installs the same tool versions; extension jobs then run `pnpm install --frozen-lockfile`.
- To verify the Jekyll website builds and runs (e.g. after upgrading Ruby), run `./script/server-website`.

# Automated builds

This repository uses GitHub Actions for continuous integration and deployment. The following workflows are configured:

## Production Website Build

- **Trigger**: Push to `master` branch
- **Action**: Builds and deploys the main website to `gh-pages` branch
- **Workflow**: `.github/workflows/build-website.yml`

## Staging Website Build

- **Trigger**: Push to any branch except `master`, `gh-pages`, or `gh-pages-staging`
- **Action**: Builds and deploys a staging version to `staging.running-challenges.co.uk`
- **Workflow**: `.github/workflows/build-staging-website.yml`

## Extension Build & Release

- **Trigger**: Push to `master` branch or manual dispatch
- **Action**: Builds Chrome and Firefox extensions, creates GitHub releases on version tags
- **Workflow**: `.github/workflows/build-extension.yml`

## Code Quality Analysis

- **Trigger**: Push to `master` branch, pull requests, or manual dispatch
- **Action**: Runs CodeQL security analysis
- **Workflow**: `.github/workflows/codeql-analysis.yml`

## Website screenshots

- **Local**: Run `./script/update-screenshots` to capture screenshots from the live parkrun site with the Chrome extension loaded. Requires extension built (`./script/update`). Screenshots are defined in `browser-extensions/extension/src/js/tests/ui-test/screenshots.yml`.

# Dependency Management

This repository uses [Dependabot](https://docs.github.com/en/code-security/dependabot) to automatically keep dependencies up-to-date:

## Automated Updates

- **GitHub Actions**: All workflow actions are automatically updated weekly
- **pnpm (JavaScript)**: Extension, unit-test, and Playwright UI-test workspace packages are updated weekly (root `pnpm-lock.yaml`). Check the [Dependencies tab](https://github.com/fraz3alpha/running-challenges/network/dependencies) or look for PRs labelled `dependencies` and `pnpm`.
- **Ruby/Bundler**: Jekyll and other Ruby gems are updated weekly
- **Schedule**: Every Monday at 9:00 AM UTC

## Configuration

Dependabot is configured in `.github/dependabot.yml` and will:

- Create pull requests for outdated dependencies
- Group related updates to reduce PR noise
- Assign appropriate labels (`dependencies`, `github-actions`, `pnpm`, `ruby`, `bundler`, `automated`)
- Use consistent commit message format (`chore:` prefix)

## Manual Updates

If you need to update dependencies manually:

- **GitHub Actions**: Edit workflow files in `.github/workflows/`
- **pnpm**: Run `pnpm update` at the repo root (or `pnpm update --filter running-challenges-tests` for test deps only)
- **Ruby**: Run `bundle update` in the `website/` directory

# Adding a new volunteer role

Occasionally parkrun create a new volunteer role, for example the "Car Park Marshall",
which needs to be added in. By default the extension won't pick up these unknown
roles, and they will need adding in in a few places:

- Add the name of the role, and any known translations to `browser-extensions/extension/src/js/lib/i18n.js`,
  putting an entry in at least the `default` section.
- Add the `name` and a suitable `shortname` to the `generate_volunteer_challenge_data()`
  function in `browser-extensions/extension/src/js/lib/challenges.js`
- Create the new badge as a layer in `images/badges/256x256/badges.xcf`, and export
  it as a `.png` file.
- Follow the instructions in `images/badges/README.md` to generate the star badges.
- Update `website/_data/badges.yml` with a section for the additional role

# Adding a new country

It is impossible to add a new country until the new website is made live, and there are events on the map.

- Find the website URLs for the 2 pages the extension modifies. They seem to follow the english spelling these days, and are only available through the 'parkrunner' URLS, that replaced the older 'athlete' based ones:
  - "_://www.parkrun.org.uk/parkrunner/_/all/"
  - "_://www.parkrun.org.uk/parkrunner/_/"
    Each of these needs to be added to the `manifest.json` file for all the supported browsers.
- Look in the volunteer rosters and attempt to find the translations to add to the `i18n.js` (internationalisation) file - unless it has changed, look at https://www.parkrun.org.uk/parkrunner/88720/, as they have done nearly everything.
- Add the ISO code for the country to the flag map in `challenges.js`
- Add the ISO code to the list of flags for the website under the `flags.yml` data file.
- Get the flag from https://emojipedia.org/twitter/twemoji-2.6/ as described in the flags README.
- Add the country code and country name to `background.js`
- Update `browser-extensions/extension/src/js/tests/ui-test/update.sh` with the new parkrun domain, and run the script to pull in new test files
- Add the new country to the Github actions test list: `.github/workflows/build-extension.yml`

# Version numbers

There hasn't been any real consistency in how the versions have been numbered, with the versions mostly going up
a point release when something was changed. The only thing that has been consistent is that the last number has
referred back to the GitHub Actions build that generated the release.

To make this more consistent, from January 2020 the numbering, which follows the format
`<major>.<minor>.<patch>.<build-number>` will refer to:

### Major version

Something big has changed in the way the extension works. We may never go to version 2, but it's here if that happens.

### Minor version

A new challenge, stat, or badge has been added - or there has been a significant addition to the way the data is
displayed on the webpage.

### Patch version

Bug fixes or minor rendering changes

### Build Number

This will remain as it always has, including the GitHub Actions build number.

# Releasing a new version

1. When everything has been tested and merged into master, tag master with the
   version in `build/version.sh`. This will trigger a GitHub Actions workflow to build and create a GitHub release.
   `    git tag v0.7.5
git push origin v0.7.5`
1. Watch the [GitHub Actions workflow](https://github.com/fraz3alpha/running-challenges/actions) run.
1. Head over to the [releases](https://github.com/fraz3alpha/running-challenges/releases)
   tab in Github and find the release for the [version you tagged](https://github.com/fraz3alpha/running-challenges/releases/tag/v0.7.5).
1. Edit the release with any information that you may want to include in release notes, or perhaps form the basis of the blog post.
1. Download the zips and test them in Chrome and Firefox to check they load and don't give any errors - load a couple of profiles and if you have added some new countries or badges, check those.
   - In Firefox, go to `about:debugging` and load a temporary add-on
   - In Chrome, go to `chrome://extensions` and load an unpacked extension
1. Go to the [Chrome webstore](https://chrome.google.com/webstore/developer/dashboard) and upload the new version.
1. Go to the [Mozilla Add-ons site](https://addons.mozilla.org/en-GB/firefox/) and upload the new version. Make sure to check that it is compatible with Android, this is unchecked by default. Add the release notes when asked.
1. Complete the release by creating a PR to include:
   - Prepare for the next release by updating the version string in `build/version.sh`
     to the next appropriate number (this can always be changed later)
   - Add a blog post in `website/_posts` - just copy the last release and change
     the pertinent bits.

## Further documentation

Additional documentation lives in README files in subfolders:

- [pnpm-migration.md](pnpm-migration.md) — plan for unifying the extension codebase and managing dependencies with pnpm.
- `build/README.md` — build-time dependencies.
- `browser-extensions/extension/src/README.md` — example parkrunner pages to help with manual testing.
- `browser-extensions/extension/src/js/README.md` — unit and automated browser testing for the extension.
- `browser-extensions/extension/src/js/tests/ui-test/README.md` — Playwright-based UI testing notes.
- `browser-extensions/extension/src/css/README.md` — notes on custom CSS for the extension.
- `images/README.md` — general image guidelines.
- `images/badges/README.md` — challenge badge image generation and star overlays.
- `images/flags/README.md` — adding and attributing new country flags.
- `js/lib/third-party/README.md` — overview of third-party JavaScript and CSS libraries used by the project.
