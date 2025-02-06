// Global variable for the main map
var mymap

var special_event_layers = {}

function parseParkrunEventsJson(eventsDataJson) {

  console.log("parseParkrunEventsJson")
  console.log(eventsDataJson)

  var parsedEvents = {}

  $.each(eventsDataJson['events']['features'], function(event_feature_index, event_info) {
    // Only process the 5k events
    if (event_info['properties']['seriesid'] == 1){
      event_id = event_info['id']
      event_name = event_info['properties']['EventShortName']
      // country_id = event_info['properties']['countrycode']
      // event_country_name = country_id_name_map[country_id]

      parsedEvents[event_name] = {
        // All the standard attributes that come from the parkrun data
        "shortname": event_info['properties']['eventname'],
        "name": event_info['properties']['EventShortName'],
        // "country_id": country_id,
        // "country_name": event_country_name,
        "id": event_info['id'],
        "lat": event_info['geometry']['coordinates'][1],
        "lon": event_info['geometry']['coordinates'][0],
      }
    }
  })

  return parsedEvents
}

function createVoronoiMapPrototype() {

  console.log("Creating Voronoi Map Prototype")

  // http://usabilityetc.com/2016/06/how-to-create-leaflet-plugins/ has proved useful
  L.VoronoiLayer = L.Layer.extend({

    initialize: function(data, cellRenderer) {
      console.log('Voronoi Layer - initialize()')
      this._data = data
      // We may have been passed a custom cell renderer
      console.log(cellRenderer)
      this._cellRenderer = cellRenderer
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

      var filtered_points = this._cellRenderer(vmap, this._data)

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
        item_path.setAttribute("fill-opacity", filtered_points[index].opacity)

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

  L.voronoiLayer = function(data, cellRenderer) {
    return new L.VoronoiLayer(data, cellRenderer)
  }

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


function addVoronoiLayerToMap(map, eventsData) {

  var regionnaireCellRenderer = function(vmap, eventsData) {

    var completed_events = {}

    // $.each(data.parkrun_results, function(index, parkrun_event) {
    //   completed_events[parkrun_event.name] = true
    // })

    var filtered_points = []
    $.each(eventsData, function(event_name, event_info) {
      if (event_has_valid_location(event_info)) {
        lat_lon = [+event_info.lat, +event_info.lon]
        // Add the point to the array
        var point = vmap.latLngToLayerPoint(lat_lon);
        event_info.x = point.x
        event_info.y = point.y
        event_info.fill = "none"
        event_info.opacity = 0.5
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
    return filtered_points
  }

  console.log("Creating voronoi map with cell renderer = "+regionnaireCellRenderer)
  var voronoi_layer = L.voronoiLayer(eventsData, regionnaireCellRenderer)
  voronoi_layer.addTo(map)

}
function draw_map(map_id) {

  // Creating the Voronoi Map prototype on the L. object.
  createVoronoiMapPrototype();

  // Create the map centred on Bushy
  var bushy = [51.410992, -0.335791]
  mymap = L.map(map_id).setView(bushy, 13);

  // Define, and use, the openstreetmap tiles
  var tilelayer_openstreetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })
  tilelayer_openstreetmap.addTo(mymap)

  // Allow the user to make the map go fullscreen
  mymap.addControl(new L.Control.Fullscreen())

  console.log("Basic map created")

  // parkrun Events data
  var parkrun_events_data = {
    'raw_data': undefined,
    'updated_at': undefined,
    'last_update_attempt': undefined,
    'updating': false,
    'max_age': 3 * 24 * 60 * 60 * 1000,
    'url': "https://images.parkrun.com/events.json",
    'datatype': 'json',
    'enabled': true,
    'timeout': 5000,
    'last_status': {}
  }

  // Perform an Asynchronous request to get the events data
  console.log("Performing Asynchronous request for "+parkrun_events_data.url)
  $.ajax({
    url: parkrun_events_data.url,
    dataType: parkrun_events_data.datatype,
    timeout: parkrun_events_data.timeout,
    success: function (result) {
        console.log('Fresh fetch of '+parkrun_events_data.url)
        parkrun_events_data.raw_data = result
        parkrun_events_data.updated_at = new Date()
        parkrun_events_data.last_status = {
         "success": true
        }

        console.log(parkrun_events_data.raw_data)
        // defer.resolve(result)

        parsed_events_data = parseParkrunEventsJson(parkrun_events_data.raw_data)

        addVoronoiLayerToMap(mymap, parsed_events_data)

    },
    error: function (xhr, status, error) {
        console.log("Error fetching "+parkrun_events_data.url+": "+error+" - "+status)
        parkrun_events_data.last_status = {
         "success": false,
         "returnStatus": status,
         "error": error,
         "message": JSON.stringify(arguments) + "" + xhr.responseText
        }
        // defer.resolve(undefined)
    }
  })

}
