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

<div id="mapid"></div>

<br/>
If you are interested in doing the double this New Year's Day, head over to the
[Rikki Prince](https://twitter.com/rikkiprince)'s amazing
[Double Finder Tool](http://tailrun.uk/nyd/2019/) to see which ones you might be
able to do.
<br/>
If you are on the lookout for filling in a spot on your Wilson Index, head over
to Mark Pinney's [Challenge Chaser](http://www.challenge-chaser.com/map).
