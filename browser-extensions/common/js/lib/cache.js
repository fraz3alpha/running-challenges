// The data will be updated when there is no data, or it is over the
// configured age
var cache = {
  'events': {
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
  },
  'data': undefined,
  'updated_at': undefined
};



function getCountryNameFromId(id) {
  // Countries that no longer exists in the data are 
  // prefixed "0_" and arbitrarily assigned numbers
  // Sub-countries are assigned a number with a prefix of their main country site code.
  const countryMap = {
    "3": "Australia",
    "4": "Austria",
    "14": "Canada",
    "23": "Denmark",
    "30": "Finland",
    "31": "France",
    "32": "Germany",
    "0_2": "Iceland",
    "42": "Ireland",
    "44": "Italy",
    "46": "Japan",
    "54": "Lithuania",
    "57": "Malaysia",
    "64": "Netherlands",
    "65": "New Zealand",
    "85_2": "Namibia",
    "67": "Norway",
    "74": "Poland",
    "79": "Russia",
    "82": "Singapore",
    "85": "South Africa",
    "85_1": "Swaziland",
    "88": "Sweden",
    "97": "UK",
    "98": "USA",
    "0_1": "Zimbabwe",
  }

  var countryName = "unknown"
  if (id in countryMap) {
    countryName = countryMap[id]
  }
  // console.log("Returning: "+countryName+" for id="+id)
  return countryName
}

function get_cache_summary() {
  return {
    'events': Object.keys(cache?.data?.events)?.length ?? '<missing>',
    'countries': Object.keys(cache?.data?.countries)?.length ?? '<missing>',
    'data': {
      'events': {
        'updated_at': cache?.events?.updated_at ?? '<no data>'
      }
    }
  }
}

function clear_cache() {
  clear_cache_by_name("events")
}

function clear_cache_by_name(name) {
  if (name in cache) {
    cache[name].raw_data = undefined
    cache[name].updated_at = undefined
    cache[name].last_update_attempt = undefined
    regenerate_cache_data()
  }
}

function parse_events(data, events_data) {
  console.log(`parse_events: ${JSON.stringify(events_data, null, 2)}`)

  if (data === undefined) {
    return
  }
  if (events_data === undefined) {
    return
  }

  // We don't have the names of countries any more, they are just IDs, and URLs
  // We'll probably need to make a mapping that we can use everywhere

  // We will create a name > info map as we go, but the events are referenced by ID, 
  // so populate an ID > name map too.

  country_id_name_map = {}

  $.each(events_data['countries'], function (country_id, country_info) {
    country_name = getCountryNameFromId(country_id)
    country_id_name_map[country_id] = country_name

    // The country centre point is no longer provided, instead it provides the bounds.
    // This is potentially useful, but for migration we'll compute the centre point.
    country_centre_lat = (country_info['bounds'][1] + country_info['bounds'][3]) / 2
    country_centre_lon = (country_info['bounds'][0] + country_info['bounds'][2]) / 2
    // The zoom, therefore, doesn't make any sense either, so lets arbitrarily set it to 8.
    country_zoom = 8

    data.countries[country_name] = {
      // All the standard attributes that come from the parkrun data
      "id": country_id,
      "name": country_name,
      "lat": country_centre_lat,
      "lon": country_centre_lon,
      "bounds": country_info['bounds'],
      "url": country_info['url'],

      // Extra attributes that we are going to fill in
      "child_event_ids": [],
      "child_event_names": []
    }
  })

  // The events.json file is designed to be read straight into the map rendering library,
  // so the points on the map are in an array under events/features
  $.each(events_data['events']['features'], function (event_feature_index, event_info) {
    // Only process the 5k events
    if (event_info['properties']['seriesid'] == 1) {

      // Example
      // {
      //   "id": 280,
      //   "type": "Feature",
      //   "geometry": {
      //     "type": "Point",
      //     "coordinates": [
      //       -1.310849,
      //       51.069286
      //     ]
      //   },
      //   "properties": {
      //     "eventname": "winchester",
      //     "EventLongName": "Winchester parkrun",
      //     "EventShortName": "Winchester",
      //     "LocalisedEventLongName": null,
      //     "countrycode": 97,
      //     "seriesid": 1,
      //     "EventLocation": "North Walls Recreation Ground"
      //   }
      // }

      event_id = event_info['id']
      event_name = event_info['properties']['EventShortName']
      country_id = event_info['properties']['countrycode']
      event_country_name = country_id_name_map[country_id]

      data.events[event_name] = {
        // All the standard attributes that come from the parkrun data
        "shortname": event_info['properties']['eventname'],
        "name": event_info['properties']['EventShortName'],
        "country_id": country_id,
        "country_name": event_country_name,
        "id": event_info['id'],
        "lat": event_info['geometry']['coordinates'][1],
        "lon": event_info['geometry']['coordinates'][0],
      }

      // Add this event to the appropriate country object
      addEventToCountryData(data, event_country_name, event_id, event_name)
    }
  })

}

function addEventToCountryData(data, country_name, event_id, event_name) {
  // console.log("Adding "+event_name+":"+event_id+" to "+country_name)
  // console.log("Current info for "+country_name+": event_ids="+data.countries[country_name]["child_event_ids"].length+" event_names="+data.countries[country_name]["child_event_names"].length)
  data.countries[country_name]["child_event_ids"].push(event_id)
  data.countries[country_name]["child_event_names"].push(event_name)
}

function get_geo_data(notify_func, freshen = false) {
  console.log('Wednesday, 2024-10-23 paj ' + JSON.stringify(localStorage, null, 2));

  const now = new Date()

  // Work out if any of the files in 'cache' need updating
  // and construct a parallel ajax call to fetch whichever ones we need
  // this allows for easy extension in the future by adding data sources
  // with not a lot of code changes
  var data_sources = ['events']
  var ajax_calls = []
  // Make a note if any deferred ajax calls are created
  var update_needed = false
  $.each(data_sources, function (_index, page) {
    // console.log('.ajax - '+page+' - freshen='+freshen)
    // Check if see if the data is:
    // not yet available (1), or never updated (2), or expired (3), or we want a fresh copy (4)
    if (cache[page].enabled && (
      cache[page].raw_data === undefined || // 1
      cache[page].updated_at === undefined || // 2
      cache[page].updated_at < (now - cache[page].max_age) || // 3
      freshen // 4
    )
    ) {
      update_needed = true
      // console.log('.ajax - '+page+' update needed')
      // Add the call to the list with the configured parameters
      // This will return the entire page
      ajax_calls.push($.Deferred(function (defer) {
        $.ajax({
          url: cache[page].url,
          dataType: cache[page].datatype,
          timeout: cache[page].timeout,
          success: function (result) {
            // console.log('Fresh fetch of '+cache[page].url)
            cache[page].raw_data = result
            cache[page].updated_at = new Date()
            cache[page].last_status = {
              "success": true
            }
            defer.resolve(result)
          },
          error: function (xhr, status, error) {
            // console.log("Error fetching "+cache[page].url+": "+error+" - "+status)
            cache[page].last_status = {
              "success": false,
              "returnStatus": status,
              "error": error,
              "message": JSON.stringify(arguments) + "" + xhr.responseText
            }
            defer.resolve(undefined)
          }
        })
      }))
    } else {
      // Add a call that only returns the previously returned data
      // This means we can do the same things in the when function
      // console.log('.ajax - '+page+' posting cached request response, expires in '+
      //     Math.round((cache[page].max_age - (now - cache[page].updated_at))/1000)+'s')
      ajax_calls.push($.Deferred(function (defer) {
        defer.resolve(cache[page].raw_data)
      }))
    }
  })

  if (update_needed) {
    // console.log('Updated required, executing deferred AJAX requests')
    // We always have two calls, but often the calls contain the cached data, rather than freshly
    // retrieved data.
    $.when(ajax_calls[0], ajax_calls[1]).done(
      // 20191117 - data_geo replaced with data_events 
      function (data_events) {

        // We absolutely need the events data, without which we can't do
        // anything.
        if (data_events === undefined) {
          // See if we have a previous one to fall back on
          if (cache.events.raw_data === undefined) {
            // If not, send something back
            console.log('No data to go on, sending back some debug information!')
            // notify_geo_data(notify_func)
            // return
          } else {
            // Else make the best use of what we had previously
            console.log('Using previously obtained raw data')
            data_events = cache.events.raw_data
          }
        } else {
          console.log('Fresh data available')
        }

        update_cache_data(data_events)

        notify_geo_data(notify_func)
      }
    )
  } else {
    // Just return the cached data
    console.log('Returning cached data for Geo Data')
    notify_geo_data(notify_func)
  }

}

function regenerate_cache_data() {
  update_cache_data(cache.events.raw_data)
}

function update_cache_data(data_events) {
  if (data_events === undefined) {
    cache.data = {
      'valid': false,
      'data_fetch_status': {
        'events': cache.events.last_status
      }
    }
    cache.updated_at = undefined
    return cache.data
  }

  // Build up our new data
  var data = {
    'valid': false,
    'events': {},
    'countries': {},
    'data_fetch_status': {
      'events': cache.events.last_status
    }
  }

  parse_events(data, data_events)

  // Update the global cache
  cache.data = data
  cache.updated_at = new Date()
  data.valid = true

  return data
}

function notify_geo_data(f) {
  if (f !== undefined) {
    if (cache.data !== undefined) {
      // console.log('Notifying caller with cached data ('+JSON.stringify(cache.data).length+' bytes), last updated at ' + cache.updated_at)
      f({
        'data': cache.data,
        'updated': cache.updated_at !== undefined ? cache.updated_at.toString() : undefined
      })
    } else {
      f({
        'data': null,
        'updated': 'never'
      })
    }
  }
}

