---
layout: page
title: FAQs
permalink: /faq/
---

**How do I get Running Challenges in my life?**
Head over to the Chrome Web Store and install our free [Running Challenges extension]({{ webstore-running-challenges-link }}) now!
If you are a Firefox user, or want to install it on Firefox for Android, head to
the [Running Challenges Add-on page]({{ site.data.webstore.firefox-running-challenges-link }}) in the Firefox webstore.

**How does Running Challenges work?**
Running Challenges looks at your results on the parkrun website and works out how you're doing in a set of challenges. For each completed challenge or volunteer role, it displays a badge on your page.

**Do I need to log in to Running Challenges?**
Nope! After installing the Running Challenges extension in your Chrome/Firefox web browser, just visit your (or anyone else's!) parkrun results page to see all your lovely badges. Click the shortcut icon in the top-right of the browser window to go directly to your parkrun results page.

**Can I install Running Challenges on my phone or tablet?**
Yes! If you use Android, you can install it in Firefox for Android. Sadly, browser
extensions for Firefox and Chrome are prohibited for iOS devices, so we aren't
able to create a version for an Apple iPhone or iPad.

**Can I use Internet Explorer, or Safari web browsers?**
Running Challenges is currently available only for Chrome or Firefox web browsers. If you normally use a different web browser, you'll need to install Chrome or Firefox on your computer.

**Why does the Chrome Web Store say the extension can "Read and change your data on www.parkrun.ca" when I'm not in Canada?**
The Running Challenges extension works on several parkrun country websites, not just Canada (`.ca`). The Chrome Web Store just chooses (for some reason!) to display one of the web addresses. If you want to know what the Running Challenges extension does with your data, read on...

**What does the Running Challenges extension do with my data?**
When you visit your parkrun results page, Running Challenges looks at your results
on the parkrun page you are viewing and adds your badges and progress tables to
the top of the page.
All your data is kept on the parkrun website and in your web browser (much the
same way as it is when you visit the webpage without the extension - it's just
more fun this way!), no data is transmitted or stored anywhere else.

## Limitations

#### Why can't I have a grace period for the 'Regionnaire' challenge?

Many people have pointed out that it is a common convention in the various online
groups that someone who has attained 'Regionnaire' status is entitled to retain
that status for a period of time, e.g. 8 weeks, even if new parkruns start up
that region. So why can't the *Running Challenges* extension do the same? The
extension retrieves the details of each parkrun from the data used to generate
the map of events on the parkrun website. The only details contained within this
data-source are the name, location, and region for the event - there is no
additional data relating to when the event started, or how many events there have
been at that parkrun, therefore it is not possible to work out which are new
additions. Unfortunately this means that we are limited with the calculations we
can do, and the badge is only displayed for those runners who have completed all
of the currently known parkruns - we recommend you take a screenshot of your
badge when you first achieve it if you want to keep a record of it.

#### Why isn't my volunteering included in more of the challenges?

We agree that it would be nice to include volunteering in more of the challenges;
 for example, counting volunteering weeks in the Gold Obsessive challenge.
  However, the only volunteering data we 
have access to is what you can see on your results pages. The parkrun website displays only the 
volunteer roles you've done and which year you did them. As it's possible to do 
multiple roles in one week, we can't even work out how many weeks you volunteered, 
let alone which role you did on a given Saturday. If parkrun add more volunteering data to their website,
we'll look at including it in challenges and stats.

#### Why don't I see a French flag when I've done parkrun Mandavit in France but I can still see it in my list of parkruns I've done?

When a parkrun closes, parkrun HQ remove it from the map file that they maintain of all
the currently live parkruns. Your results page on the parkrun website still lists you having done
the closed parkrun, so the extension can include the closed parkrun in challenges (eg alphabeteer).
However, your results page does not include country data so we can only go off the map file to 
know which country a parkrun is in and which flags your page should display. 
When the parkrun is removed from the map file, your flag unfortunately disappears too (if that's the only
parkrun you have completed in that country).
