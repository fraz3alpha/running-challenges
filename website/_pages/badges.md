---
layout: page
title: Badges & Stats
permalink: /badges/
---

Show off to all your friends, collect your badges and improve your stats today!

The extension contains many challenges and stats, some old, some new, and many
may sound strange at first - so what do they all mean? Hopefully this page explains
all!

  - [Volunteer Badges](#volunteer-badges)
  - [Running Badges](#running-badges)
  - [Country Flags](#country-flags)
  - [Stats](#stats)

* * *

### Volunteer Badges

Also, as a special extra something for those dedicated volunteers you can gain stars for doing a role 5+ times (1 star), 10+ times (2 stars), and 25+ times (3 stars)!

{% for entry in site.data.badges.volunteer %}
  <div style="clear:left" markdown="1">
  ![{{ entry.name }}]({{ site.baseurl }}/img/badges/volunteer-{{ entry.shortname }}.png){: .badge-list-item}
  **{{ entry.name }}** - {{ entry.description }}
  </div>
{% endfor %}

<div style="clear:left"/>

* * *

### Running Badges

{% for entry in site.data.badges.runner %}
  <div style="clear:left" markdown="1">
  ![{{ entry.name }}]({{ site.baseurl }}/img/badges/{% if entry.badge_name %}{{entry.badge_name}}{% else %}runner-{{ entry.shortname }}{% endif %}.png){: .badge-list-item}
  **{{ entry.name }}** - {{ entry.description }}
  </div>
{% endfor %}

<div style="clear:left"/>

* * *

### Country Flags

You will also get a flag for each of the countries you have touristed in (in the order in which you first attended a parkrun there). The currently available countries are:

{% for entry in site.data.flags.flags %}
  <div style="clear:left" markdown="1">
  ![{{ entry.name }}]({{ site.baseurl }}/img/flags/{{ entry.shortname }}.png){: .badge-list-item}
  **{{ entry.name }}**
  </div>
{% endfor %}

<div style="clear:left"/>

* * *

### Stats

There are many stats that parkrunners keep, and a few of these are obvious such
as the number of parkruns you have done, or how many different parkruns you have
been to, but there are also some more mysterious ones, such as the *p-index* or
ones that are hard to calculate such as the furthest distance from home you have
travelled to go to a parkrun. The Running Challenges extension currently calculates
the following stats:

|Stat|Description|
|:--------:|:--------|
{% for entry in site.data.stats.stats %}|{{ entry.name }}<a id="{{ entry.shortname }}"/>|{{ entry.description }}|
{% endfor %}
