---
layout: post
title:  "What's broken now (May 2022 Edition)"
date:   2021-05-15 12:00:00 +0000
categories:
  - news
---

There's always something broken, but where are things at now?

## Which parkrun websites currently work?

The English language parkrun websites seem to work, ones that are shown in the local language still don't - for example Finland works, because the site is in English, but Austria doesn't as it's German/Austrian German. I think we put a fix in for this, but possibly never released it. 

## Which browsers does the extension currently work on?

It seems to be Chrome and Edge at the moment. As you may be aware from previous posts, Firefox on Android was supported, but then Mozilla yanked support for any mobile extensions other than a select few. Unfortunately, while we weren't looking, it seems that Firefox on a Desktop browser is no longer working because a reviewer went through and retrospectively rejected every single version we have ever released. So, it's not available on Firefox at all any more! We think that is desktop rejection is fixable though - it's just that the review comment says we've done something we aren't allowed to do, but to the best of our knowledge we haven't done that, sooo... I guess we just resubmit it at some point in the future and ask for clarification?

Here are the extension store links:

- [Chrome](https://chrome.google.com/webstore/detail/running-challenges/kdapmdimgdebpgolimjnmcdlkbkddoif)
- [Edge](https://microsoftedge.microsoft.com/addons/detail/running-challenges/cfofipfcckojdhjbganfgflkiebajegg)

## Which bits of the extension that used to work, don't any more?

There have been some website changes around volunteer naming, which means that a couple of volunteer roles don't get picked up any more. We've documented this in an [issue](https://github.com/fraz3alpha/running-challenges/issues/328), and the two we know have changed are:
- First Timers Briefing is now First Timers Welcome
- Run Report Writer is now Report Writer
We don't know if they have changed in every language though, and that's a harder thing to check!

## Any progress on some automated tests?

For the technical amongst you - Andy has been trying to get some automated tests running so we can spot when things go bad, using a combination of Github Actions and Selenium to see if we can check that the extension is working on a regular basis. This seems to work in Chrome, but the reliability of loading an extension into a headless copy of Firefox in the Selenium framework either flat-out refuses to work, or is incredibly unreliable as to whether it does anything or not, so at the moment it's essentially worthless.

## Anything else we get comments about

- If you set your home parkrun in the extension you can still only select from the 5k events, we've had a few people ask about finding their local junior parkrun and couldn't find it - as an aside, some challenges do pick up junior parkruns, but not all, it's not exactly clear sometimes.
- The Compass Club batch only looks for the compass points in English, we've had some parkrunners from outside the UK after their local translations (Milano Nord etc...), but this was just a bit of fun and we had never intended for this to be translateable (Lowestoft doesn't even have 'West' in for example) - so we have no plans to change this.
- As parkrun has been going for so long now some countries have come and gone, as have individual parkruns, and indeed the names of some parkruns have changed. As the extension works on the **current data** displayed on the parkrun website, it is only ever going to pick up the current state of affairs, so this might lead to things like:
  - Missing country badges if you've gone to only one parkrun in a country, but now that one has shutdown (e.g. Crissy Fields in the USA) - and we can't find it on the map.
  - Missing parkrun initial letters if the parkrun you did has sinced changed its name (the extension has no knowledge of previous names)

## Surely the new team member can do Javascript now?

You have to walk before you can run, and before you can program a computer you probably need to be able to type. Walking has been achieved, but so far effective communication is lacking, never mind typing, so no.
