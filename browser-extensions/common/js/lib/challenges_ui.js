/*
 * data object is of the form:
 * [
 *  alphabeteer: {
 *    "title_text": "Alphabeteer Challenge",
 *    "complete": false,
 *    "subparts": [
 *      'a',
 *      'b',
 *      'c'
 *    ],
 *    "subparts_completed": {
 *      "a": {
 *          "name":
 *          "position":
 *          ...
 *      },
 *    ]
 *    If there are any recommendations about what to do for these parts, then
 *    they can be added to this object
 *    "subparts_remaining_recommendations": {
 *      "c": {'Congleton'}
 *    }
 *  },
 * ]
 */

function generate_challenge_table() {

    // console.log('Generating Challenge Table')
    var table = $('<table></table>')
    // Set the ID so that we can easily find it again
    // table.attr("id", "challenge-table")
    // Use the 'results' id so that we pick up the standard styling
    table.attr("id", "results")
    // Optionally add a class with .addClass(this.tableClass)
    table.append($('<caption></caption>').text('Challenges'))

    // Add a set of links on the top row
    help_link = $('<a></a>').attr("href", browser.extension.getURL("/html/help.html")).attr("target", '_blank').text('help')
    options_link = $('<a></a>').attr("href", browser.extension.getURL("/html/options.html")).attr("target", '_blank').text('options')
    website_link = $('<a></a>').attr("href", "https://running-challenges.co.uk").attr("target", '_blank').text('website')
    help_td = $('<td></td>').attr('colspan', 6).attr('align', 'right')
    help_td.append(website_link)
    help_td.append(" | ")
    help_td.append(options_link)
    help_td.append(" | ")
    help_td.append(help_link)
    help_td.append(" | ")
    help_td.append("v" + extensionVersion)

    table.append($('<tr></tr>').append(help_td))

    return table

}

function add_table_break_row(table, title, help) {
    var tbody = $('<tbody/>')
    var gap_row = $('<tr/>')
    gap_row.append($('<th/>').attr('colspan', 6).append('<span>&nbsp;</span>'))
    tbody.append(gap_row)
    var main_row = $('<tr/>')
    var tooltip = ''
    if (help !== undefined) {
        tooltip = '<span style="font-size: 10px; vertical-align: middle; cursor: default" title="'+help+'">[?]</span>'
    }
    main_row.append($('<th/>').attr('colspan', 6).append('<span><b>'+title+'</b></span> '+tooltip))
    tbody.append(main_row)
    table.append(tbody)
}

function add_challenges_to_table(table, challenge_results_type, data) {
  // console.log(data)
   var ui_challenge_generation_duration = 0

   data.challenge_results[challenge_results_type].forEach(function (challenge) {
       // console.log("Generating table rows for " + challenge.shortname)
       var start_time = new Date()
       if (challenge.shortname == 'regionnaire') {
          //  generate_regionnaire_table_entry(challenge, table, data)
       } else {
           generate_standard_table_entry(challenge, table, data)
       }
       var duration = new Date() - start_time
       ui_challenge_generation_duration += duration
       // console.log("Completed generating table rows for " + challenge.shortname + " in " + duration + "ms")

   });

   // console.log("Completed generating challenge table rows in " + ui_challenge_generation_duration + "ms")

   return table
}

function get_tbody_header(challenge) {
    return $('<tbody></tbody>').attr('id', get_tbody_header_id(challenge))
}

function get_tbody_content(challenge) {
    return $('<tbody></tbody>').attr('id', get_tbody_content_id(challenge))
}

function get_tbody_header_id(challenge) {
    return "challenge_tbody_header_"+challenge['shortname']
}

function get_tbody_content_id(challenge) {
    return "challenge_tbody_content_"+challenge['shortname']
}

function get_flag_icon(country, height, width) {
    var flag_img = $('<img>'); //Equivalent: $(document.createElement('img'))
    flag_img.attr('src', browser.extension.getURL("/images/flags/png/"+country.flag_icon+".png"));
    // badge_img.attr('alt', challenge.name)
    // badge_img.attr('title', challenge.name)
    flag_img.attr('height', height)
    flag_img.attr('width', width)

    return flag_img
}


function get_challenge_icon(challenge, height, width) {
    var badge_img = undefined
    if (challenge.badge_icon !== undefined) {
      badge_img = $('<img>'); //Equivalent: $(document.createElement('img'))
      badge_img.attr('src', browser.extension.getURL("/images/badges/"+challenge.badge_icon+".png"));
      badge_img.attr('alt', challenge.name)
      badge_img.attr('title', challenge.name)
      badge_img.attr('height', height)
      badge_img.attr('width', width)
    }
    return badge_img
}

function get_challenge_header_row(challenge, data) {

    var main_row = $('<tr></tr>')

    var badge_img = get_challenge_icon(challenge, 24, 24)
    if (badge_img !== undefined) {
      badge_img.click(function(){
          $("tbody[id=challenge_tbody_content_"+challenge['shortname']+"]").toggle();
      });
    } else {
      badge_img = ''
    }

    var anchor_tag = $('<a/>')
    anchor_tag.attr('name', challenge['shortname'])
    anchor_tag.append(badge_img)

    main_row.append($('<th></th>').append(anchor_tag))

    // main_row.append($('<th></th>').text(challenge.shortname))
    var help = ''
    if (challenge.help !== undefined) {
        help = '<span style="font-size: 10px; vertical-align: middle; cursor: default" title="'+challenge.help+'">[?]</span>'
    }
    var challenge_map_link_id = "challenge_"+challenge['shortname']+"_show_map"
    var challenge_map_id = "challenge_"+challenge['shortname']+"_map"
    var challenge_map_link = ''
    if (has_geo_data(data) && challenge.has_map === true) {
        challenge_map_link = $('<span/>').attr("id", challenge_map_link_id).html("<span style=\"cursor: default\">show map</span>").click(function() {
        console.log(challenge_map_id)
        console.log(challenge)
        console.log(challenge.nearest_qualifying_events)
        create_challenge_map(challenge_map_id, challenge, data)
      })
    }

    main_row.append($('<th></th>').append(challenge.name + ' ' + help))
    main_row.append($('<th></th>').append(challenge_map_link))
    main_row.append($('<th></th>').text(challenge.completed_on))
    if (challenge.summary_text !== undefined) {
        main_row.append($('<th></th>').text(challenge.summary_text))
    } else {
      if (challenge.subparts_completed_count !== undefined && challenge.subparts_count !== undefined){
        var progress = challenge.subparts_completed_count
        if (challenge.subparts_count > 0) {
          progress +="/"+challenge.subparts_count
        }
        main_row.append($('<th></th>').text(progress))
      }
    }
    if (challenge.complete) {
        main_row.append($('<img/>').attr('src', browser.extension.getURL("/images/badges/tick.png")).attr('width',24).attr('height',24))
    }

    return main_row
}

function generateRegionnaireTableEntry(table, data) {
  // We can only do this if we have geo data
  
  var challenge = {
    "name": "parkrun Explorer",
    "shortname": "regionnaire"
  }

  var challenge_tbody_header = get_tbody_header(challenge)
  var challenge_tbody_detail = get_tbody_content(challenge)

  // Create the header row and add it to the tbody that exists to hold
  // the title row
  var main_row = get_challenge_header_row(challenge, data)
  challenge_tbody_header.append(main_row)

  if (data.geo_data === undefined) {
    // When there is no geo data, just put a row in saying there is nothing to go on.
    var infoRow = $("<tr/>").append($('<td colspan="4" align="center">No parkrun event location information, unable to generate regionnaire results</td>'))
    challenge_tbody_detail.append(infoRow)

    table.append(challenge_tbody_header)
    table.append(challenge_tbody_detail)
  } else {
    // Create a row to hold a map
    var regionnaireMapId = 'regionnaire_map'
    var map_row = $("<tr/>").append($('<td colspan="4"><div id="'+regionnaireMapId+'" style="height:400px; width:400"></div></td>'))
    challenge_tbody_detail.append(map_row)
    var map_row = $("<tr/>").append($('<td colspan="4" align="center">Only currently active events are included in the map and stats</td>'))
    challenge_tbody_detail.append(map_row)

    // draw_regionnaire_data_table(challenge_tbody_detail, challenge)
    drawRegionnaireDataTable(challenge_tbody_detail, data)

    table.append(challenge_tbody_header)
    table.append(challenge_tbody_detail)

    drawRegionnaireMap(regionnaireMapId, data)

    // create_regionnaire_map(regionnaire_map_id, data, challenge)
  }
}

function zoomLevelToScaleOptions(zoomLevel) {
  options = {
    "zoomLevel": zoomLevel,
    "eventNameVisible": false,
    "eventNameTextSize": 0,
    "eventPointRadius": 1.5,
    "pathLineWidth": 1
  }

  if (zoomLevel >= 8) {
    options.eventPointRadius = 4
  }  
  if (zoomLevel >= 9) {
    options.eventPointRadius = 6
  }
  if (zoomLevel >= 10) {
    options.eventPointRadius = 8

    // From this point onwards the event name is visible
    options.eventNameVisible = true

    options.eventNameTextSize = 12
  }
  if (zoomLevel >= 11) {
    
    options.eventPointRadius = 10

    // We need a small line width generally, but it gets lost
    // when there are more features on the map, so increase it
    // when we we have zoomed in a lot
    pathLineWidth = 2
  }
  if (zoomLevel >= 12) {
    options.eventPointRadius = 12
  }

  return options

}

function createVoronoiMapPrototype() {
  // http://usabilityetc.com/2016/06/how-to-create-leaflet-plugins/ has proved useful
  L.VoronoiLayer = L.Layer.extend({

    initialize: function(data) {
      console.log('Voronoi Layer - initialize()')
      this._data = data
    },

    onAdd: function(map) {
      console.log('Voronoi Layer - onAdd()')
        // var nw_point = map.latLngToLayerPoint(bounds.getNorthWest())
        // Store the map
        this._map = map

        var pane = map.getPane(this.options.pane);
        this._pane = pane

        map.on('zoomend viewreset moveend', this._update, this);
        this._update()

        // Force the map to recalculate its size.
        // When it is first drawn, the remainder of the page hasn't,
        // so it it is narrower, and subsequent challenges pad it out -
        // so this makes it correct as soon as it is interacted with.
        // This unfortunately means it's not right initially, but it 
        // fixes itself pretty quickly.

        setTimeout(function(){ 
          console.log("triggering a redraw")
          map.invalidateSize()
        }, 1000);
    },

    onRemove: function(map) {
      console.log('Voronoi Layer - onRemove()')
        L.DomUtil.remove(this._container);
        map.off('zoomend viewreset', this._update, this);
    },

    _update: function() {
      console.log('Voronoi Layer - _update()')

      // Empty the current pane
      L.DomUtil.empty(this._pane)

      // Create a new SVG container, we will add everything to this
      // before adding it to the DOM.
      var this_container = L.DomUtil.create("svg", "leaflet-zoom-hide")

      var vmap = this._map
      var bounds = vmap.getBounds()
      var top_left = vmap.latLngToLayerPoint(bounds.getNorthWest())

      var size = vmap.getSize()

      this_container.setAttribute('width', size.x);
      this_container.setAttribute('height', size.y);
      this_container.setAttribute("style", "margin-left: "+top_left.x + "px; margin-top: "+top_left.y+"px");

      var filtered_points = []
      var layer_data = this._data
      var completed_events = {}
      $.each(layer_data.parkrun_results, function(index, parkrun_event) {
        completed_events[parkrun_event.name] = true
      })
      
      $.each(layer_data.geo_data.data.events, function(event_name, event_info) {
        if (event_has_valid_location(event_info) && event_has_started(event_info)) {
          lat_lon = [+event_info.lat, +event_info.lon]
          // Add the point to the array
          var point = vmap.latLngToLayerPoint(lat_lon);
          event_info.x = point.x
          event_info.y = point.y
          event_info.fill = "none"
          event_info.circleColour = "black"
          event_info.circleColourLine = "gray"
          if (completed_events[event_info.name] == true) {
            event_info.fill = "green"
            event_info.circleColour = "#006000"
          }
          filtered_points.push(event_info)
          // }
        }

      })

      var voronoi = d3.voronoi()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; });

      // As we are using the .polygons() we need to set an extent so that things
      // don't go wrong at the edges. Ordinarily we should set an extent of
      // the size of the canvas, but for those cases where the canvas includes
      // +/-180degrees, we need to crop the diagram there otherwise it goes
      // weird when the lines expand into the repeated map provided by openstreetmap

      // Find the left and right corners of the world :)
      map_point_left_edge = vmap.latLngToLayerPoint([90,-180]);
      map_point_right_edge = vmap.latLngToLayerPoint([-90,180]);

      // Default extents are the edges of the canvas, but if these take it over
      // the edges of the world according to the calculations above, we box
      // them in.
      voronoi_extent_left = [Math.max(top_left.x, map_point_left_edge.x), Math.max(top_left.y, map_point_left_edge.y)]
      voronoi_extent_right = [Math.min(top_left.x+size.x, map_point_right_edge.x), Math.min(top_left.y+size.y, map_point_right_edge.y)]

      voronoi.extent([voronoi_extent_left, voronoi_extent_right]);

      var voronoi_data = voronoi(filtered_points)

      // For reference:
      // https://github.com/zetter/voronoi-maps/blob/master/lib/voronoi_map.js

      var cell_group = document.createElement("g")
      cell_group.setAttribute("transform", "translate(" + (-top_left.x) + "," + (-top_left.y) + ")")

      var voronoi_polygons = voronoi_data.polygons()

      var zoomScaleOptions = zoomLevelToScaleOptions(vmap.getZoom())
      console.log(zoomScaleOptions)

      $.each(voronoi_polygons, function(index, cell) {

        // If there is no cell data, then keep looping
        if (cell === undefined) {
          // console.log("Undefined cell data at index "+index)
          return true
        }

        // Create an icon to represent the parkrun event
        var item_circle = document.createElement("circle")
        
        item_circle.setAttribute("cx", cell.data.x)
        item_circle.setAttribute("cy", cell.data.y)
        item_circle.setAttribute("r", zoomScaleOptions.eventPointRadius)
        item_circle.setAttribute("stroke", filtered_points[index].circleColourLine)
        item_circle.setAttribute("stroke-width", "1")
        item_circle.setAttribute("fill", filtered_points[index].circleColour)

        // If we are zoomed in enough, maybe add some text
        var item_text = undefined
        if (zoomScaleOptions.eventNameVisible) {
          item_text = document.createElement("text")
          item_text.setAttribute("x", cell.data.x)
          item_text.setAttribute("y", cell.data.y + zoomScaleOptions.eventPointRadius + 8) // Move the text down below the point, plus some padding
          item_text.setAttribute("text-anchor", "middle")
          item_text.setAttribute("font-size", zoomScaleOptions.eventNameTextSize+"px")
          item_text.setAttribute("font-weight", "bold")
          item_text.setAttribute("dominant-baseline", "hanging") // Hang the text below
          item_text.innerText = filtered_points[index].name
        }

        // Create a shape to represent the voronoi area associated with this parkrun event
        // It will be filled if the parkrun has been completed

        var item_path = document.createElement("path")
        item_path.setAttribute("d", "M " + get_voronoi_poly(cell).join(" L ") + " Z")
        item_path.setAttribute("stroke", "gray")
        item_path.setAttribute("stroke-width", zoomScaleOptions.pathLineWidth)
        item_path.setAttribute("fill", filtered_points[index].fill)
        item_path.setAttribute("fill-opacity", "0.5")

        // Add the parkrun event and the path object to a holding object - the path goes first so
        // that the parkrun event marker is drawn on top afterwards
        cell_group.appendChild(item_path)
        cell_group.appendChild(item_circle)
        if (item_text !== undefined) {
          cell_group.appendChild(item_text)
        }
        
        // Add this group to the main SVG container
        this_container.appendChild(cell_group)

      })

      // Store the SVG container in the object
      this._container = this_container
      // Add the SVG to the map
      $(this._pane).append($(this_container).prop('outerHTML'))

    }
  });

  L.voronoiLayer = function(options) {
    return new L.VoronoiLayer(options)
  }

}

function drawRegionnaireMap(divId, data) {

  // Get a summary of the completion data
  var countryCompletionInfo = calculateCountryCompletionInfo(data)

  // Find where to focus the map on to start with
  var default_centre = [25,0]
  if (data.info.has_home_parkrun && data.info.is_our_page) {
    var home_parkrun = data.user_data.home_parkrun_info
    if (event_has_valid_location(home_parkrun)) {
      default_centre = [+home_parkrun.lat, +home_parkrun.lon]
    }
  }

  // Creating the Voronoi Map prototype on the L. object.
  createVoronoiMapPrototype();

  console.log("Initialising the regionnaire map container")
  var r_map = L.map(divId).setView(default_centre, 2);
  // Allow it to be fullscreen
  r_map.addControl(new L.Control.Fullscreen());

  var map_data = {
      map: r_map,
      countryCompletionInfo: countryCompletionInfo,
      layers: {
        subregions: [],
        events: []
      }
  }

  // Set the openstreetmap tiles
  var tilelayer_openstreetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })
  tilelayer_openstreetmap.addTo(r_map)

  // Add the Voronoi layer

  var voronoi_layer = L.voronoiLayer(data)
  voronoi_layer.addTo(r_map)

  // Icons
  var FlagIcon = L.Icon.extend({
      options: {
          shadowUrl: undefined,
          iconSize:     [40, 40],
          // Centre the icon by default
          iconAnchor:   [20, 20]
      }
  });

  // Iterate through the top level countries
  // We are using our pre-scanned list here, so that we can take advantage of
  // having removed 'world', and perhaps adjusted any sub-countries (Namibia,
  // Swaziland spring to mind)

  map_data.layers.country_markers = new L.featureGroup();

  var flag_icon_anchor_centred = [20,20]
  var flag_icon_anchor_with_pie = [40,20]

  // Iterate over all the countries we know about
  $.each(data.geo_data.data.countries, function (countryName, countryInfo) {

    // We have the total number of events and complete events in the following
    var countryChildEventsCount = countryCompletionInfo[countryName].childActiveEventsCount
    var countryChildEventsCompletedCount = countryCompletionInfo[countryName].childEventsCompletedCount

    // Only bother displaying this country if it has any events
    if (countryChildEventsCount > 0) {
      if (event_has_valid_location(countryInfo)) {

        // Get the location of the country mid-point, according to parkrun
        var lat_lon = [+countryInfo.lat, +countryInfo.lon]
        // Get the current regions id for later use by the on click callback function
        var countryId = countryInfo.id

        // If we haven't run any events, we omit the pie chart, so centre the
        // flag, else we shuffle it off to the left a bit so the combo is centred
        var flag_anchor = flag_icon_anchor_centred
        if (countryChildEventsCompletedCount > 0) {
          flag_anchor = flag_icon_anchor_with_pie
        }

        // Top level countries have a flag
        var marker = L.marker(lat_lon, {
          icon: new FlagIcon({
            iconUrl: get_flag_image_src(countryName),
            iconAnchor: flag_anchor
          })
        })
        // Add a tooltip showing the name of the country and a summary of the
        // completion numbers
        var marker_tooltip_text = countryName + ' ' + countryChildEventsCompletedCount + '/' + countryChildEventsCount
        var marker_tooltip_options = {
          offset: [0, -16],
          direction: 'top'
        }
        marker.bindTooltip(marker_tooltip_text, marker_tooltip_options)
        marker.on('click', function() {
          // Instead of showing the events, lets just move the map to show the country
          // showCountryEvents(map_data, data, countryId, 0)
          zoomMapToCountryExtents(map_data, data, countryId)
        })
        marker.addTo(map_data.layers.country_markers);

        // Only add the pie chart if we have completed any events at all
        if (countryChildEventsCompletedCount > 0) {
          var pie_marker = L.piechartMarker(lat_lon, {
            radius: 16,
            data: [
              {
                name: 'Run',
                value: countryChildEventsCompletedCount,
                style: {
                  fillStyle: 'rgba(0,140,57,.95)',
                  strokeStyle: 'rgba(0,0,0,.75)',
                  lineWidth: 1
                }
              },
              {
                name: 'Not Run',
                value: (countryChildEventsCount - countryChildEventsCompletedCount),
                style: {
                  fillStyle: 'rgba(0,0,0,.15)',
                  strokeStyle: 'rgba(0,0,0,.75)',
                  lineWidth: 1
                }
              }
            ],
            // Budge the pie chart over to the right a bit, so that the flag+chart are
            // mostly centred on the original point, and not wildly off to one side
            iconAnchor: [-4, 16]
          })
          // Add the same tooltips and on click actions as for the flag
          pie_marker.bindTooltip(marker_tooltip_text, marker_tooltip_options)
          pie_marker.on('click', function() {
            // showCountryEvents(map_data, data, countryId, 0)
            zoomMapToCountryExtents(map_data, data, countryId)
          })
          pie_marker.addTo(map_data.layers.country_markers);
        }

      }
    }

  })

  map_data.layers.country_markers.addTo(map_data.map)
}

function zoomMapToCountryExtents(map_data, data, countryId) {
  console.log('Centering on countryId: '+countryId)

  $.each(data.geo_data.data.countries, function(index, countryInfo) {
    if (countryInfo.id == countryId) {
      // Fit the map to the coordinates provided by the country
      console.log("Centering map on " + countryInfo.bounds)

      var bottomLeft = L.latLng(countryInfo.bounds[1],countryInfo.bounds[0])
      var topRight = L.latLng(countryInfo.bounds[3],countryInfo.bounds[2])
      map_data.map.fitBounds(L.latLngBounds(bottomLeft,topRight))

      return
    }
  })

  // We should only end up here if the country ID didn't match any countries
  // we know about, we would normally have returned by now.

}

function showCountryEvents(map_data, data, countryId, depth) {
  console.log('Click for countryId: '+countryId+' depth='+depth)

  // Remove any existing subregions at or below our depth
  var regions_layer_key = 'subregions'
  if (regions_layer_key in map_data.layers) {
    while (map_data.layers[regions_layer_key].length > depth) {
      var layer = map_data.layers[regions_layer_key].pop()
      // console.log('Removed '+layer)
      map_data.map.removeLayer(layer)
    }
  }
  // ... and pop a fresh layer onto the stack
  map_data.layers[regions_layer_key].push(new L.featureGroup());

  // Remove any existing subregion events ...
  var events_layer_key = 'events'
  if (events_layer_key in map_data.layers) {
    while (map_data.layers[events_layer_key].length > depth) {
      var layers = map_data.layers[events_layer_key].pop()
      if ('done' in layers) {

        map_data.map.removeLayer(layers.done)
      }
      if ('notdone' in layers) {
        map_data.map.removeLayer(layers.notdone)
      }
      // console.log('Removed '+layers)
    }
  }
  // ... and pop a fresh layer onto the stack
  map_data.layers[events_layer_key].push({
    'done': new L.featureGroup(),
    'notdone': new L.featureGroup()
  });

  // Icon for an event we have run
  var event_run_icon = L.ExtraMarkers.icon({
    markerColor: 'green-light',
    shape: 'circle'
  });

  // Icon for an event we have not run
  var event_not_run_icon = L.ExtraMarkers.icon({
    markerColor: 'cyan',
    shape: 'square',
    // These still add the div elements for the shadow, it would be better if it didn't.
    // shadowUrl: null,
    // shadowRetinaUrl: null,
    // shadowSize: [0, 0],
  });

  $.each(data.geo_data.data.events, function (event_name, event_info) {
    if (event_info.country_id == countryId) {
      if (event_has_valid_location(event_info)) {
        // Get the location of the country mid-point, according to parkrun
        var lat_lon = [+event_info.lat, +event_info.lon]
        // Default marker shows we have not run it
        var marker = L.marker(lat_lon, {icon: event_not_run_icon})
        // if (event_name in map_data.events_completed_map) {
        //   marker = L.marker(lat_lon, {icon: event_run_icon})
        // }
        // Add a tooltip showing the name of the event
        var marker_tooltip_text = event_name
        var marker_tooltip_options = {
          offset: [0, -30],
          direction: 'top'
        }
        marker.bindTooltip(marker_tooltip_text, marker_tooltip_options)
        // Create a popup which includes a link to the event
        marker.bindPopup(get_parkrun_popup(event_name, event_info, {distance: false, completed_info: map_data.events_completed_map}))
        // Add it to the appropriate layer group
        // if (event_name in map_data.events_completed_map) {
        //   marker.addTo(map_data.layers[events_layer_key][depth].done)
        // } else {
          marker.addTo(map_data.layers[events_layer_key][depth].notdone)
        // }
      }
    }
  })
  // Add the not-done icons first
  map_data.layers[events_layer_key][depth].notdone.addTo(map_data.map)
  map_data.layers[events_layer_key][depth].done.addTo(map_data.map)

}

var vmap

function get_voronoi_poly(cell) {
  var real_edges = []
  // console.log(cell)
  // console.log(cell.length)
  for (var i=0; i<cell.length; i++) {
    if (cell[i] != null) {
      var point = cell[i].join(" ")
      real_edges.push(point)
    }
  }

  return real_edges
}


var challenge_maps = {}

function create_challenge_map(map_id, challenge_data, data) {

  console.log(challenge_data)

  var home_parkrun_marker_colour = 'purple'

  // Create empty vector for each layer
  // var home_parkrun = new L.featureGroup()
  var events_complete = new L.featureGroup();
  // var events_complete_icon = new EventsIcon({iconUrl: browser.extension.getURL("/images/maps/markers/leaf-green.png")})
  var events_complete_icon = L.ExtraMarkers.icon({
    markerColor: 'green-light',
    shape: 'circle'
  });
  var events_complete_icon_home = L.ExtraMarkers.icon({
    markerColor: home_parkrun_marker_colour,
    shape: 'circle'
  });
  var events_nearest_incomplete = new L.featureGroup();
  // var events_nearest_incomplete_icon = new EventsIcon({iconUrl: browser.extension.getURL("/images/maps/markers/leaf-orange.png")})
  var events_nearest_incomplete_icon = L.ExtraMarkers.icon({
    markerColor: 'yellow',
    shape: 'penta'
  });
  var events_nearest_incomplete_icon_home = L.ExtraMarkers.icon({
    markerColor: home_parkrun_marker_colour,
    shape: 'penta'
  });
  var events_incomplete = new L.featureGroup();
  // var events_incomplete_icon = new EventsIcon({iconUrl: browser.extension.getURL("/images/maps/markers/leaf-red.png")})
  var events_incomplete_icon = L.ExtraMarkers.icon({
    markerColor: 'cyan',
    shape: 'square'
  });
  var events_incomplete_icon_home = L.ExtraMarkers.icon({
    markerColor: home_parkrun_marker_colour,
    shape: 'square'
  });

  var events_ineligible_icon_home = L.ExtraMarkers.icon({
    markerColor: home_parkrun_marker_colour,
    shape: 'star'
  });

  // // Add the home parkrun if it has been defined
  // if (challenge_data.home_parkrun) {
  //   var lat_lon = [+challenge_data.home_parkrun.lat, +challenge_data.home_parkrun.lon]
  //   var popup = 'Home parkrun: ' + challenge_data.home_parkrun.name
  //   var marker = L.marker(lat_lon).bindPopup(popup);
  //   marker.addTo(home_parkrun)
  // }

  // The ID of the element we are going to populate
  var map_element_id = "challenge_map_"+challenge_data.shortname
  // var map_element = document.getElementById(map_element_id)
  // Empty and hide all of the existing map elements
  $('div[id^="challenge_map_"]').each(function() {
    $(this).empty().hide()
  })
  // Make this map element visible
  var map_element = $('div[id="'+map_element_id+'"]').first()
  map_element.show()
  map_element.height(400)

  // See if there are any existing maps, and remove them all
  $.each(challenge_maps, function (id, map_data) {
    map_data.map.remove()
  })
  // Remove all references
  challenge_maps = {}

  // Default to centring on Winchester
  var map_centre_lat_lon = [51.0632, -1.308]
  if (data.info.is_our_page && data.info.has_home_parkrun) {
    var home_parkrun_info = data.user_data.home_parkrun_info
    if (event_has_valid_location(home_parkrun_info)) {
      map_centre_lat_lon = [+home_parkrun_info.lat, +home_parkrun_info.lon]
    }
  }
  var mymap = L.map(map_element_id).setView(map_centre_lat_lon, 10);

  // Add the new map to our set of maps for future reference
  challenge_maps[map_element_id] = {
    "map": mymap,
    "div_id": map_element_id
  }
  var tilelayer_openstreetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })
  tilelayer_openstreetmap.addTo(mymap)

  var events_on_the_map = []
  var added_home_parkrun = false

  // Add the completed events
  $.each(challenge_data.completed_qualifying_events, function(event_name, event_info) {
      if (!events_on_the_map.includes(event_name)) {
        if (event_has_valid_location(event_info)) {
          // Make sure they are numbers
          var lat_lon = [+event_info.lat, +event_info.lon]
          var popup = get_parkrun_popup(event_name, event_info, {distance: true})
          var marker = L.marker(lat_lon, {icon: events_complete_icon}).bindPopup(popup);
          if (data.info.is_our_page && data.info.has_home_parkrun && (data.user_data.home_parkrun_info.name == event_name)) {
              popup = get_parkrun_popup(event_name, event_info, {distance: false})
              marker = L.marker(lat_lon, {icon: events_complete_icon_home}).bindPopup(popup);
              added_home_parkrun = true
          }
          marker.addTo(events_complete)

          events_on_the_map.push(event_name)
        }
      }
  })
  // These markers should be on the top
  events_complete.setZIndex(50)
  // Add Those markers
  events_complete.addTo(mymap)

  if (events_complete.getLayers().length > 0) {
    mymap.fitBounds(events_complete.getBounds().pad(0.1));
  }

  if (data.info.is_our_page) {
    $.each(challenge_data.nearest_qualifying_events, function(event_name, event_info) {
        if (!events_on_the_map.includes(event_name)) {
          if (event_has_valid_location(event_info)) {
            // Make sure they are numbers
            var lat_lon = [+event_info.lat, +event_info.lon]
            var popup = get_parkrun_popup(event_name, event_info, {distance: true})
            var marker = L.marker(lat_lon, {icon: events_nearest_incomplete_icon}).bindPopup(popup);
            if (data.info.is_our_page && data.info.has_home_parkrun && (data.user_data.home_parkrun_info.name == event_name)) {
                popup = get_parkrun_popup(event_name, event_info, {distance: false})
                marker = L.marker(lat_lon, {icon: events_nearest_incomplete_icon_home}).bindPopup(popup);
                added_home_parkrun = true
            }
            marker.addTo(events_nearest_incomplete)

            events_on_the_map.push(event_name)
          }
        }
    })
    events_nearest_incomplete.setZIndex(25)
    // Add Those markers
    events_nearest_incomplete.addTo(mymap)
  }

  $.each(challenge_data.all_qualifying_events, function(event_name, event_info) {
    // console.log("all - " + event_name)
      if (!events_on_the_map.includes(event_name)) {
        if (event_has_valid_location(event_info)) {
          // Make sure they are numbers
          var lat_lon = [+event_info.lat, +event_info.lon]
          var popup = get_parkrun_popup(event_name, event_info, {distance: true})
          var marker = L.marker(lat_lon, {icon: events_incomplete_icon}).bindPopup(popup);
          if (data.info.is_our_page && data.info.has_home_parkrun && (data.user_data.home_parkrun_info.name == event_name)) {
              popup = get_parkrun_popup(event_name, event_info, {distance: false})
              marker = L.marker(lat_lon, {icon: events_incomplete_icon_home}).bindPopup(popup);
              added_home_parkrun = true
          }
          marker.addTo(events_incomplete)

          events_on_the_map.push(event_name)
        }
      }
  })
  events_incomplete.setZIndex(10)
  // Add Those markers
  // events_incomplete.addTo(mymap)

  // If we have not added the home parkrun, this means that it is not eligible
  // for this challenge, but it is still useful to add an icon for it - so lets
  // add it straight to the map now
  if (data.info.is_our_page && data.info.has_home_parkrun && (added_home_parkrun == false)) {
    if (event_has_valid_location(data.user_data.home_parkrun_info)) {
      var lat_lon = [+data.user_data.home_parkrun_info.lat, +data.user_data.home_parkrun_info.lon]
      var marker = L.marker(lat_lon, {icon: events_ineligible_icon_home});
      marker.addTo(mymap)
    }
  }

  base_maps = {
    "openstreetmap": tilelayer_openstreetmap
  }

  overlay_markers = {}

  // Add the overlays in the order we want them to appear

  overlay_markers["Completed Events"] = events_complete

  if (challenge_data.complete == false) {

    if (data.info.is_our_page && data.info.has_home_parkrun && events_nearest_incomplete.getLayers().length > 0) {
      overlay_markers['Nearest Qualifying Events'] = events_nearest_incomplete
    }

    // overlay_markers['Other Qualifying Events'] = events_incomplete
    // Only add it if there are any events in the list
    if (events_incomplete.getLayers().length > 0) {
      // I've override the css that creates the standard markers so they are all
      // red, although we really need to do it in a more configurable way
      var clustered_events_incomplete = L.markerClusterGroup({
        disableClusteringAtZoom: 9,
      });
      clustered_events_incomplete.addLayers(events_incomplete.getLayers())

      overlay_markers['Other Qualifying Events'] = clustered_events_incomplete
    }
  }

  layer_control_options = {
    'hideSingleBase': true
  }

  // Add a control which will provide a way to optionally turn on the layers
  // that we haven't added
  L.control.layers(base_maps, overlay_markers, layer_control_options).addTo(mymap);

  mymap.addControl(new L.Control.Fullscreen());

}

function event_has_valid_location(event_info) {
  var valid_location = false
  if (event_info.lat && event_info.lon) {
    if (event_info.lat != '' && event_info.lon != '') {
      valid_location = true
    }
  }
  return valid_location
}

function event_has_started(event_info) {
  return (event_info.status == 'Live' || event_info.status == 'unknown')
}

function get_parkrun_popup(event_name, event_info, custom_options) {

  var options = {
    distance: true
  }
  if (custom_options.distance !== undefined) {
    options.distance = custom_options.distance
  }

  var event_name_link = event_name + ' parkrun'
  if (event_info.event_url) {
    event_name_link = '<div style="text-align:center"><a href="'+event_info.event_url+'" target="_blank">'+event_name+' parkrun</a></div>'
  } else if (event_info.local_url) {
    event_name_link = '<div style="text-align:center"><a href="'+event_info.local_url+'/'+event_info.shortname+'" target="_blank">'+event_name+' parkrun</a></div>'
  }
  popup = event_name_link
  if (event_info.distance !== undefined && options.distance) {
    popup = popup+'<br/><div style="text-align:center">'+event_info.distance.toFixed(1)+" km away</div>"
  }

  if (custom_options.completed_info && event_name in custom_options.completed_info) {
    popup = popup+'<br/><div style="text-align:center">First attended: '+custom_options.completed_info[event_name][0].date+"</div>"
  }
  return popup
}

function get_regionnaire_flag(country, visited) {

  var flag_icon = get_flag_image_src(country)

  var img = $('<img>');
  img.attr('src', flag_icon);
  img.attr('alt', country)
  img.attr('title', country)
  img.attr('width',16)
  img.attr('height',16)
  if (visited) {
    img.attr('style', 'padding-left:2px; padding-right:2px; opacity:1.0')
  } else {
    img.attr('style', 'padding-left:2px; padding-right:2px; opacity:0.25')
  }

  return img

}

// This is a very complicated table to draw. And given that we've had to rip out some bits
// now that parkrun HQ doesn't allocate parkruns in to a region, this might be overly complex,
// if it even works at all
function drawRegionnaireDataTable(table, data) {

  // Use the common function to see what countries we have visited
  var countryCompletionInfo = calculateCountryCompletionInfo(data)
  console.log(countryCompletionInfo)

  // First of all, add a row with the world stats on, which is the top level region
  // Generate a total for the current completion
  var worldEventsCount = 0
  var worldEventsCompletedCount = 0
  $.each(countryCompletionInfo, function(countryName, countryInfo) {
    worldEventsCount += countryInfo.childActiveEventsCount
    worldEventsCompletedCount += countryInfo.childEventsCompletedCount
  })

  var worldCompletionFractionString = worldEventsCompletedCount +"/"+ worldEventsCount

  var row = $("<tr/>")
  row.append($("<td/>").append(get_regionnaire_flag("World", true)))
  row.append($("<td/>").append($("<b/>").text("World")))
  row.append($("<td/>"))
  row.append($("<td/>").text(worldCompletionFractionString))
  table.append(row)

  var alphabeticallySortedCountries = Object.keys(countryCompletionInfo).sort()
  console.log(alphabeticallySortedCountries)

  $.each(alphabeticallySortedCountries, function(idx, countryName) {
    var countryInfo = countryCompletionInfo[countryName]
    var countryId = countryInfo["id"]
    // Only show those countries with active events
    if (countryInfo.childActiveEventsCount > 0) {
      // Determine how complete this country is
      // Find out how many of the events in this country are actually live

      console.log(countryInfo.childActiveEventsCount + " active events for "+countryName)
      var countryCompletionPercentage = countryInfo.childEventsCompletedCount / countryInfo.childActiveEventsCount
      var countryCompletionFractionString = countryInfo.childEventsCompletedCount +"/"+ countryInfo.childActiveEventsCount

      var row = $("<tr/>")
      var regionnaire_country_class = "regionnaire-country-"+countryId
      var regionnaire_parent_region_class_country = "regionnaire-parent-region-id-"+countryId

      // We fade out the regionnaire flag if it hasn't been visited, with
      // get_regionnaire_flag's second argumemt being a true/false value of whether
      // you have been. By stating whether the completion percentage is above zero
      // we can calculate this on the fly
      row.append($("<td/>").append(get_regionnaire_flag(countryName, countryCompletionPercentage > 0)).append($("<a/>").attr("name", countryName)))
      row.append($("<td/>").append($("<b/>").text(countryName)))
      row.append($("<td/>"))
      row.append($("<td/>").text(countryCompletionFractionString))
      table.append(row)

    }

  })

}

function generate_standard_table_entry(challenge, table, data) {

    var challenge_tbody_header = get_tbody_header(challenge)
    var challenge_tbody_detail = get_tbody_content(challenge)

    // Create the header row and add it to the tbody that exists to hold
    // the title row
    var main_row = get_challenge_header_row(challenge, data)
    challenge_tbody_header.append(main_row)

    // Create a row to hold a map, and hide it
    if (challenge.has_map === true) {
      var map_row = $("<tr/>").append($('<td colspan="4"><div id="challenge_map_'+challenge.shortname+'" style="height:400; width:400"></div></td>'))
      challenge_tbody_detail.append(map_row)
    }

    // Print the subparts
    challenge.subparts_detail.forEach(function (subpart_detail) {
        var subpart_row = $('<tr></tr>')
        if (subpart_detail["badge"] !== undefined) {
          console.log("Adding a badge to the table - "+subpart_detail["badge"])
          subpart_row.append($('<td></td>').append(get_challenge_icon(subpart_detail["badge"], 24, 24)))
        } else {
          subpart_row.append($('<td></td>').text("-"))
        }
        
        if (subpart_detail != null) {

            subpart_row.append($('<td></td>').text(subpart_detail.subpart))
            subpart_row.append($('<td></td>').html(subpart_detail.name))
            subpart_row.append($('<td></td>').html(subpart_detail.info))

            challenge_tbody_detail.append(subpart_row)
        } else {
             subpart_row.append($('<td></td>').text('Missing'))
             challenge_tbody_detail.append(subpart_row)
        }

    });

    table.append(challenge_tbody_header)
    table.append(challenge_tbody_detail)

}

function add_stats_table(div, data) {

  if (data.info.has_stats) {
    var table = $('<table/>')
    // Use the 'results' id so that we pick up the standard styling, yuk
    table.attr("id", "results")
    // Optionally add a class with .addClass(this.tableClass)
    table.append($('<caption/>').text('Additional Athlete Stats'))
    // Add header row
    var header_row = $('<tr/>').html('<th>Stat</th><th>Value</th>')
    table.append(header_row)

    $.each(data.stats, function(stat_shortname, stat_info) {
      var row = $('<tr/>')
      var display_name = stat_info.display_name
      var stat_value = stat_info.value
      if (stat_info.help) {
        display_name = '<span style="cursor: default" title="'+stat_info.help+'">'+display_name+'</span>'
        stat_value = '<span style="cursor: default" title="'+stat_info.help+'">'+stat_value+'</span>'
      }
      row.append($('<td/>').html(display_name))
      if (stat_info.url !== undefined) {
        row.append($('<td/>').append($('<a/>', {href: stat_info.url, text: stat_info.value, target: "_blank", title: stat_info.help })))
      } else {
        row.append($('<td/>').html(stat_value))
      }
      table.append(row)
    })

    div.append(table)
  }

  // Append a message noting that some information may be missing
  // if there is no athlete_id or home parkrun set
  if (data.info.has_athlete_id == false || data.info.has_home_parkrun == false) {
    var options_message_container = $('<div/>')
    options_link = $('<a/>').attr("href", browser.extension.getURL("/html/options.html")).attr("target", '_blank').text('options.')
    options_message_container.append('N.B. More stats and map features are available if you set your home parkrun and athlete id in the ')
    options_message_container.append(options_link)
    div.append($('<br/>'))
    div.append(options_message_container)
  }
  div.append('<br/>Hover over the stats for a more detailed description')

}
