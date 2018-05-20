---
layout: page
title: Badges
permalink: /badges/
---

Show off to all your friends, collect your badges today!

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
  ![{{ entry.name }}]({{ site.baseurl }}/img/badges/runner-{{ entry.shortname }}.png){: .badge-list-item}
  **{{ entry.name }}** - {{ entry.description }}
  </div>
{% endfor %}

<div style="clear:left"/>

* * *

### Country Badges

You will also get a flag for each of the countries you have touristed in (in the order in which you first attended a parkrun there). The currently available countries are:

{% for entry in site.data.badges.flags %}
  <div style="clear:left" markdown="1">
  ![{{ entry.name }}]({{ site.baseurl }}/img/flags/{{ entry.shortname }}.png){: .badge-list-item}
  **{{ entry.name }}**
  </div>
{% endfor %}

<div style="clear:left"/>
