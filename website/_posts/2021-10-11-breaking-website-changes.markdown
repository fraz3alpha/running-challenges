---
layout: post
title:  "Breaking website changes"
date:   2021-10-11 20:00:00 +0000
categories:
  - news
---

Your extension is broken, fix it, fix it, fix it!

## I've been living under a rock, what has broken?

On the 6th October 2021, parkrun started rolling out some changes to their website - this included moving the page that we add all the badges to and making it available at a different URL. The old page we used is still there, but it contains different data - so the extension doesn't know what to do with it, and promptly spits out the helpful error: "Error Map container not found".

## When will it be fixed?

Soon. Probably in October.

Many thanks to [Russell Boyatt](https://github.com/rboyatt) who contributed some code to get most things back working again. We have merged a [PR](https://github.com/fraz3alpha/running-challenges/pull/305) into a development branch so that we can test it out. We've also tried to write some automated tests to prove the extension loads on each parkrun site as that is incredibly tedious to check and no-one has got time for that...

Russell has also been busy getting the [changes](https://github.com/fraz3alpha/running-challenges/pull/308) made to support the Austrian site that appeared recently, awesome work!

We have very little free time at the moment and it's a non-trivial task to release a new version of the extension - even after all the code has been written, so please bear with us.

## I would like to know what's happening with the extension on Firefox for Android

This is still not available. It's because the browser has restricted the number of extensions to a very small carefully vetted list of extensions that have millions of users that they can spend hours making sure they aren't doing anything against their policies - as and when their security model means they can accept community created extensions again we'll try and get our extension listed once more.

## If I give you some money will you do XYZ

No, that's not really how it works. We did this for a bit of fun, and we aren't taking any money for it, we'll mostly do things as time allows and if we find it interesting - if you have some cash that is burning a hole in your pocket go to [the parkrun shop](https://www.parkrun.org.uk/shop/) and buy yourself something to support parkrun.

If you have a regular supply of burning-a-hole-in-your-pocket money, or you just want a warm fuzzy feeling of keeping parkrun around, why not sign up to [parkrun Forever](https://parkrunforever.com/about/) and make a regular donation?

## Any progress on training up the new team member?

Progress has been made on standing, but not on Javascript.

## How do I get more updates?

It's a lot easier to write a quick Tweet than post something on this website, so head over to our Twitter account - [@RunChallenges](https://twitter.com/RunChallenges) for all the latest updates. You don't need a Twitter account to read our recent updates, and it always best to check there first before asking us directly - we'll generally put a post out as soon as we notice something is broken.