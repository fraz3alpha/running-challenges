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
in the `browser-extensions/common` directory, and is supplemented by additional
browser-specific files and libraries from either `browser-extensions/chrome` or
`browser-extensions/firefox` when the extension is built.

Most of the images live in the top-level directory `images` so that they are
shared between the extensions and the website, they are also copied into the
extension when a build occurs.

### Build Dependencies

Mozilla provide a small tool - [`web-ext` tool](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Getting_started_with_web-ext),
to package and lint check Firefox browser extensions,
which is used for packaging both the Chrome and Firefox extensions. The lint
checking is of limited use for Chrome, but is still run for reference. It can be
installed with `npm install --global web-ext`.

### Chrome Extension

The Chrome extension is the original version, and can be built by running the build
script from the root of the repository:
```
bash ./build/extension-chrome/build.sh
```
This will create an unpacked version of the extension in `browser-extensions/chrome/build`,
together with a packaged version in the `web-ext-artifacts` directory.

### Firefox Addon

The Firefox addon is built from largely the same code as the Chrome extension
with a few small tweaks (such as a different manifest file, and some `sed`
replacements). It uses a separate build script from the Chrome version, but is
built in an identical way:
```
bash ./build/extension-firefox/build.sh
```
This will create an unpacked version of the extension in `browser-extensions/firefox/build`,
together with a packaged version in the `web-ext-artifacts` directory.

Your build of the extension is not signed, so Firefox does not allow you to install it directly from your built file.
Instead, for testing purposes, you have to install it as a [temporary installation in Firefox](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/) (it automatically deletes itself when you quit Firefox).

# Automated builds

This repository is integrated with TravisCI so that code pushed to the master
branch in GitHub is built. This will update the website, and if a suitable tag
is present, then a GitHub Release is created and a copy of the extension at that
level is uploaded for further submission to the Chrome and Firefox extension/addon
webstores.

Each PR created, and when additional commits are pushed to existing PR branches,
an additional build it run to build a copy of the website on staging.running-challenges.co.uk .

# Adding a new volunteer role

Occasionally parkrun create a new volunteer role, for example the "Car Park Marshall",
which needs to be added in. By default the extension won't pick up these unknown
roles, and they will need adding in in a few places:

- Add the name of the role, and any known translations to `browser-extensions/common/js/lib/i18n.js`,
  putting an entry in at least the `default` section.
- Add the `name` and a suitable `shortname` to the `generate_volunteer_challenge_data()`
  function in `browser-extensions/common/js/lib/challenges.js`
- Create the new badge as a layer in `images/badges/256x256/badges.xcf`, and export
  it as a `.png` file.
- Follow the instructions in `images/badges/README.md` to generate the star badges.
- Update `website/_data/badges.yml` with a section for the additional role

# Adding a new country

It is impossible to add a new country until the new website is made live, and there are events on the map.

- Find the website URLs for the 3 pages the extension modifies. They seem to follow the english spelling these days:
  - "*://www.parkrun.jp/results/athleteeventresultshistory/*"
  - "*://www.parkrun.jp/results/athleteresultshistory/*"
  - "*://www.parkrun.jp/*/results/athletehistory/*"
  Each of these needs to be added to the `manifest.json` file for all the supported browsers.
- Look in the volunteer rosters and attempt to find the translations to add to the `i18n.js` (internationalisation) file
- Add the ISO code for the country to the flag map in `challenges.js`
- Add the ISO code to the list of flags for the website under the `flags.yml` data file.
- Get the flag from https://emojipedia.org/twitter/twemoji-2.6/ as described in the flags README.
- Add the country code and country name to `background.js`

# Version numbers

There hasn't been any real consistency in how the versions have been numbered, with the versions mostly going up
a point release when something was changed. The only thing that has been consistent is that the last number has 
referred back to the Travis build that generated the release.

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

This will remain as it always has, including the Travis build number.

# Releasing a new version

1. When everything has been tested and merged into master, tag master with the
version in `build/version.sh`. This will trigger a Travis build to push the built
zips to a Github release.
    ```
    git tag v0.7.5
    git push origin v0.7.5
    ```
1. Watch the [Travis build](https://travis-ci.org/fraz3alpha/running-challenges) run.
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
