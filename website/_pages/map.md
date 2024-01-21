---
layout: page
title: parkrun Explorer Map
permalink: /map/
javascript_libs:
  - third-party/leaflet/leaflet-1.3.1.js
  - third-party/d3-voronoi/d3-voronoi.js
  - third-party/leaflet-canvasicon/leaflet-canvasicon-0.1.4.js
  - third-party/leaflet-extramarkers/leaflet-extramarkers-1.0.5.js
  - third-party/leaflet-fullscreen/leaflet-fullscreen-1.0.1.js
  - third-party/leaflet-markercluster/leaflet-markercluster-1.3.0.js
  - leaflet-slidemenu/leaflet-sidemenu.js
  # - data/geo-REPLACE_WITH_RUNNING_CHALLENGES_COMMIT_HASH.js
  # - data/special-events-REPLACE_WITH_RUNNING_CHALLENGES_COMMIT_HASH.js
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

The following map replicates the explorer map in the Running Challenges browser extension. At some point the extension will probably stop working, so this is here is a stop-gap. It may also finally provide the map on mobile devices.

<div id="mapid"></div>
<br/>

### Usage Notes

- Go fullscreen to get the best view, and hide the menu if you like.
- This only considers 5k events
- This map works on mobile devices for when you are out and about.
