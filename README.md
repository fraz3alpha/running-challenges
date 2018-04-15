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
