---
layout: page
title: Special Events Map
permalink: /map/
javascript_libs:
  - third-party/leaflet/leaflet-1.3.1.js
  - third-party/leaflet-canvasicon/leaflet-canvasicon-0.1.4.js
  - third-party/leaflet-extramarkers/leaflet-extramarkers-1.0.5.js
  - third-party/leaflet-fullscreen/leaflet-fullscreen-1.0.1.js
  - third-party/leaflet-markercluster/leaflet-markercluster-1.3.0.js
  - leaflet-slidemenu/leaflet-sidemenu.js
  - data/geo.js
  - data/special-events.js
javascript_onload:
  - file: map.js
    function: draw_map('mapid')
css_libs:
  - third-party/leaflet/leaflet.css
  - third-party/leaflet-extramarkers/leaflet.extra-markers.css
  - third-party/leaflet-fullscreen/leaflet-fullscreen.css
  - third-party/leaflet-markercluster/MarkerCluster.css
  - third-party/leaflet-markercluster/MarkerCluster.Default.css
  - leaflet-slidemenu/leaflet-sidemenu.css
  - map.css
---

The following map lists the special events over the Christmas/New Year period for
2018/2019. We will revisit this map later in 2019 with updated data for the
2019/2020 extra-parkrun season!

<div id="mapid"></div>
<br/>

### Usage Notes

- Go fullscreen to get the best view, and hide the menu if you like.
- 5k parkrun events have circular markers, junior parkrun events have square markers.
- Not all time & event distance (5k/junior) combinations have markers on the map.
- This map works on mobile devices for when you are out and about.

### Other fantastic maps and tools

- If you are interested in doing the double this New Year's Day, head over to the
[Rikki Prince](https://twitter.com/rikkiprince)'s amazing
[Double Finder Tool](https://tailrun.uk/nyd/2020/) to see which ones 
you might be able to do in 2020.
- If you are on the lookout for filling in a spot on your Wilson Index, head over
to Mark Pinney's [Challenge Chaser](http://www.challenge-chaser.com/map).
- And of course, for all things tourism related, check out
[Tim GP](https://twitter.com/timdp)'s absolutely awesome
[Tourist Tool](https://touristtool.mybluemix.net/)!
