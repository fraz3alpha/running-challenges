# Running Challenges

A browser extension to allow you to complete challenges with your parkrun results

The generated extension (initially created for Chrome) adds extra information
to your parkrun results page to describe progress towards various challenges,
including 'Alphabeteer' (running a parkrun starting with every letter of the
alphabet), 'Tourist' (running 20 or more different parkruns), and many more.

# Building the repository

## Website

The /website folder containers a Jekyll based website

It can be built with:

```
docker run --rm --name jekyll \
-v `pwd`:/srv/jekyll \
-v `pwd`/vendor/bundle:/usr/local/bundle \
jekyll/jekyll jekyll build
```

or served for local testing with:

```
docker run --rm --name jekyll \
-p 4000:4000 \
-v `pwd`:/srv/jekyll \
-v `pwd`/vendor/bundle:/usr/local/bundle \
jekyll/jekyll jekyll serve
```

## Browser Extensions

The bulk of the code that is common to the Chrome and Firefox extensions lives
in the `browser-extensions/common` directory, and is supplemented by additional
browser-specific files and libraries from either `browser-extensions/chrome` or
`browser-extensions/firefox` when the extension is built.

Most of the images live in the top-level directory `images` so that they are
shared between the extensions and the website, there are also copied into the
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

# Automated builds

This repository is integrated with TravisCI so that code pushed to the master
branch in GitHub is built. This will update the website, and if a suitable tag
is present, then a GitHub Release is created and a copy of the extension at that
level is uploaded for further submission to the Chrome and Firefox extension/addon
webstores.

Each PR created, and when additional commits are pushed to existing PR branches,
an additional build it run to build a copy of the website on staging.running-challenges.co.uk .

test update 2
