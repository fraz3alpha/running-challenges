---
layout: post
title:  "Where did my flags go?"
date:   2019-11-19 20:00:00 +0000
categories:
  - chrome-extension
  - firefox-addon
---

You may have noticed that your flags have disappeared, you can't save your athlete ID in
the options page, your regionnaire badge has disappeared, or you no longer have your NENDY 
and average parkrun location listed... Read on to find out what broke, why, and what we're doing 
to fix it...

## What broke?

The Running Challenges extension uses the location of parkruns to determine which countries you 
have been to - adding flags under your badges, to generate the Regionnaire challenge info, as 
well as work out stats such as your NENDY.

There were also some knock on errors, which wouldn't have happened if we had coded the extension
to cope with the event location data being missing, such as saving your profile.

## Why did it break?

During the summer the main parkrun website changed the way they generated the event map - 
out went a XML file (geo.xml) that had existed from the Google Maps days, and in came a 
JSON file (events.json). The new file was much more efficient to render the event markers 
on the map, but broke our extension...

## Has it been fixed?

Yes and no. Most of the extension is back to full strength - the flags are still available, 
and you'll still be able to determine your NENDY, but the Regionnaire challenge is missing
parts. We've also made the code more robust if data is missing. It won't be bulletproof, but 
hopefully it is better.

## The state of the Regionnaire challenge

The only regions that we now have access to in the events data are the countries, there are no
subregions in the data we pull down. Not every country had sub-regions before, so for parkrunners in 
the USA, or most of Europe, there is no change. The UK, Australia, and South Africa were the 
largest ones with sub-regions, and now all those parkruns are counted against the country at a single 
level.

As there isn't any sensible sub-division, the regionnaire challenge badge would effectively only be 
achieveable for those people who had done every event in a whole country - so it has been removed for now.

The Regionnaire table remains, but now it is more of a parkrun event explorer - showing you how many 
events you have done in each country, and allowing you to browse them on the map. As yet there is no
highlighting of which ones have been done, but that'll probably be re-introduced as time allows.

## But, but, I want my regions back!

If there is a simple and sensible way of making them return, we will try to do so. We don't want to spend hours
crafting a list, and we certainly don't want to be drawn into debates about which region an event should 
go in. We'll see how it goes without the information for now, fix a few other things first, and then 
come back to looking at it again. 


[![Running Challenges in the Chrome Web Store]({{ site.baseurl }}/img/ChromeWebStore_BadgeWBorder_v2_206x58.png "Running Challenges in the Chrome Web Store")]({{ site.data.webstore.webstore-running-challenges-link }})[![Running Challenges in the Firefox Add-ons Web Store]({{ site.baseurl }}/img/firefox_web_store-172x60.png "Running Challenges in the Firefox Add-ons Web Store")]({{ site.data.webstore.firefox-running-challenges-link }})
{: style="text-align: center;"}
