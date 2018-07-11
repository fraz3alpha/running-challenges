# Running Challenges

A browser extension to allow you to complete challenges with your parkrun results

The generated extension (initially created for Chrome) adds extra information
to your parkrun results page to describe progress towards various challenges,
including 'Alphabeteer' (running a parkrun starting with every letter of the
alphabet), 'Tourist' (running 20 or more different parkruns), and many more.

## Website

The /blog folder containers a Jekyll based website

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

## Chrome Extension

The Chrome extension is the original version, and can be built by running the build
script from the root of the repository:
```
bash ./build/extension-chrome/build.sh
```
This will create an unpacked version of the extension in `browser-extensions/chrome/build`,
together with a zipped version called `extension.zip` in that folder

### Chrome Extension Build Dependencies

The build for Chrome has minimal dependencies, and only uses standard unix commands
including `cp` and `zip`

## Firefox Addon

The Firefox addon is built from the Chrome extension source tree with a few small
tweaks (a different manifest file, and some `sed` replacements). It uses a separate
build script from the Chrome version, but is built in an identical way:
```
bash ./build/extension-firefox/build.sh
```
This will create an unpacked version of the extension in `browser-extensions/firefox/build`,
together with a zipped version called `running_challenges-<version>.zip` in the
`web-ext-artifacts` directory, creating by running the `web-ext build` command

### Firefox Addon Build Dependencies

The build for Firefox has a few more dependencies than Chrome, including `sed`
to search and replace some content, and the [`web-ext` tool](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Getting_started_with_web-ext)
which can be installed with `npm install --global web-ext` (this is the recommended
way of packaging Firefox addons, so we've gone with that)
