// This captures the click on the icon in the toolbar
browser.browserAction.onClicked.addListener(function(tab) {
    // We want to check if an Athlete Number has been provided,
    // if so lets display their results page
    browser.storage.local.get({
      athlete_number: '',
      home_parkrun_info: {}
    }).then((items) => {
        // console.log('Icon clicked, loading based on '+JSON.stringify(items))
        // If no athlete number has been set, load the options page
        if (items.athlete_number == '') {
            browser.runtime.openOptionsPage();
        } else {
            var results_url = "http://www.parkrun.org.uk/results/athleteeventresultshistory/?athleteNumber="+items.athlete_number+"&eventNumber=0"
            // Don't redirect Malaysian users as their website doesn't work
            if ("local_url" in items.home_parkrun_info && items.home_parkrun_info.local_url.indexOf('parkrun.my') === -1) {
              var local_url = items.home_parkrun_info.local_url
              results_url = local_url+"/"+get_localised_value("url_athleteeventresultshistory", local_url)+"?athleteNumber="+items.athlete_number+"&eventNumber=0"
            }
            browser.tabs.create({ url: results_url });
        }

    });

});

// The data will be updated when there is no data, or it is over the
// configured age

var cache = {
    // The new data source, live since ~ July 2019
    'events': {
        'raw_data': undefined,
        'updated_at': undefined,
        'last_update_attempt': undefined,
        'updating': false,
        'max_age': 3 * 24 * 60 * 60 * 1000,
        'url': "https://images.parkrun.com/events.json",
        'datatype': 'json',
        'enabled': true,
        'timeout': 5000
    },
    'technical_event_information': {
        'raw_data': undefined,
        'updated_at': undefined,
        'last_update_attempt': undefined,
        'updating': false,
        'max_age': 3 * 24 * 60 * 60 * 1000,
        'url': "https://wiki.parkrun.com/index.php/Technical_Event_Information",
        'datatype': 'html',
        'enabled': true,
        'timeout': 5000
    },
    'data': undefined,
    'updated_at': undefined
}

function getCountryNameFromId(id) {
  // Countries that no longer exists in the data are 
  // prefixed "0_" and arbitrarily assigned numbers
  // Sub-countries are assigned a number with a prefix of their main country site code.
  var countryMap = {
    "3": "Australia",
    "14": "Canada",
    "23": "Denmark",
    "30": "Finland",
    "31": "France",
    "32": "Germany",
    "0_2": "Iceland",
    "42": "Ireland",
    "44": "Italy",
    "46": "Japan",
    "57": "Malaysia",
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

  console.log("Returning: "+countryName+" for id="+id)

  return countryName

}

function get_cache_summary() {

  var summary = {
    'regions': '<missing>',
    'events': '<missing>',
    'countries': '<missing>',
    'event_status': '<missing>',
    'data': {
      'events': {
        'updated_at': cache.events.updated_at
      },
      'technical_event_information': {
        'updated_at': cache.technical_event_information.updated_at
      }
    }
  }

  if (cache.data !== undefined) {

    if ('regions' in cache.data) {
      summary.regions = Object.keys(cache.data.regions).length
    }
    if ('events' in cache.data) {
      summary.events = Object.keys(cache.data.events).length
    }
    if ('countries' in cache.data) {
      summary.countries = Object.keys(cache.data.countries).length
    }
    if ('event_status' in cache.data) {
      if (cache.data.event_status !== undefined) {
        summary.event_status = Object.keys(cache.data.event_status).length
      }
    }

  }

  return summary

}

function clear_cache() {
  clear_cache_by_name("events")
  clear_cache_by_name("technical_event_information")
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
  console.log('parse_events()')
  console.log(events_data)

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

  $.each(events_data['countries'], function(country_id, country_info) {
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
  $.each(events_data['events']['features'], function(event_feature_index, event_info) {
    // Only process the 5k events
    if (event_info['properties']['seriesid'] == 1){
      event_id = event_info['id']
      event_name = event_info['properties']['EventShortName']
      country_id = event_info['properties']['countrycode']
      event_country_name = country_id_name_map[country_id]

      data.events[event_name] = {
        // All the standard attributes that come from the parkrun data
        "shortname": event_info['properties']['EventShortName'],
        "name": event_info['properties']['eventname'],
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
  console.log("Adding "+event_name+":"+event_id+" to "+country_name)
  console.log("Current info for "+country_name+": event_ids="+data.countries[country_name]["child_event_ids"].length+" event_names="+data.countries[country_name]["child_event_names"].length)
  data.countries[country_name]["child_event_ids"].push(event_id)
  data.countries[country_name]["child_event_names"].push(event_name)
}

function parse_tee_data_event_status(data, result) {

  if (result === undefined) {
    return
  }

  // Reset the event status data to a blank map
  data.event_status = {}

  var ownerDocument = document.implementation.createHTMLDocument('virtual');
  // Load the results into a virtual document, so that it doesn't attempt to load
  // inline scripts etc...
  // Solution taken from https://stackoverflow.com/questions/15113910/jquery-parse-html-without-loading-images
  // referencing https://api.jquery.com/jQuery/ & https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation/createHTMLDocument
  $(result, ownerDocument).find('div[id=mw-content-text]>table:first').each(function(table_index) {
     var content_table = $(this)

     content_table.find('tbody>tr').each(function(row_index) {
         var content_table_row_cell = $('td', this)
         if (content_table_row_cell[0] !== undefined) {
             var parkrun_info = {
                 parkrun_name: content_table_row_cell[0].innerText.trim(),
                 parkrun_event_director: content_table_row_cell[1].innerText.trim(),
                 parkrun_event_number: content_table_row_cell[2].innerText.trim(),
                 parkrun_status: content_table_row_cell[3].innerText.trim(),
                 parkrun_country: content_table_row_cell[4].innerText.trim(),
                 parkrun_portal_number: content_table_row_cell[5].innerText.trim()
             }
             data.event_status[parkrun_info.parkrun_event_number] = parkrun_info
             // console.log(parkrun_info)
         }
     })
  })

 return

}

function compute_event_status(data) {

  if (data === undefined) {
    return
  }

  // Loop through the existing geo_data, and supplement it with the
  // extra event data we have found if there is a match
  $.each(data.events, function(event_name, event_info) {
     if (data.event_status !== undefined && event_info.id in data.event_status) {
         // console.log('Found state '+live_parkrun_event_data[event_info.id].parkrun_status+" for "+event_name)
         data.events[event_name].status = data.event_status[event_info.id].parkrun_status
     } else {
         data.events[event_name].status = 'unknown'
     }
  })

  return

}

function get_geo_data(notify_func, freshen=false) {
    var now = new Date()

    // Work out if any of the files in 'cache' need updating
    // and construct a parallel ajax call to fetch whichever ones we need
    // this allows for easy extension in the future by adding data sources
    // with not a lot of code changes
    var data_sources = ['events', 'technical_event_information']
    var ajax_calls = []
    // Make a not if any deferred ajax calls are created
    var update_needed = false
    $.each(data_sources, function (index, page) {
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
                         defer.resolve(result)
                     },
                     error: function (xhr, status, error) {
                         // console.log("Error fetching "+cache[page].url+": "+error+" - "+status)
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
        $.when( ajax_calls[0], ajax_calls[1] ).done(
            // 20191117 - data_geo replaced with data_events 
            function ( data_events, data_tee ) {

                // We absolutely need the events data, without which we can't do
                // anything.
                if (data_events === undefined) {
                    // See if we have a previous one to fall back on
                    if (cache.data_events.raw_data === undefined) {
                        // If not, send something back
                        console.log('No data to go on!')
                        notify_geo_data(notify_func)
                        return
                    } else {
                        // Else make the best use of what we had previously
                        console.log('Using previously obtained raw data')
                        data_events = cache['events'].raw_data
                    }
                } else {
                  console.log('Fresh data available')
                }

                // Check if we have technical event information and fall back if not
                if (data_tee === undefined) {
                    data_tee = cache.technical_event_information.raw_data
                }

                update_cache_data(data_events, data_tee)

                notify_geo_data(notify_func)
                return
            }
        )
    } else {
        // Just return the cached data
        console.log('Returning cached data for TEE & Geo Data')
        notify_geo_data(notify_func)
    }

}

function regenerate_cache_data() {
  update_cache_data(cache.events.raw_data, cache.technical_event_information.raw_data)
}

function update_cache_data(data_events, data_tee) {

  if (data_events === undefined) {
    cache.data = undefined
    cache.updated_at = undefined
    return cache.data
  }

  // Build up our new data
  var data = {
    'regions': {},
    'events': {},
    'countries': {},
    'event_status': undefined
  }

  // Replace the complicated events/regions parsing with a single call
  parse_events(data, data_events)

  // If the technical event information has been obtained, then
  // lets parse that.
  // if (data_tee !== null) {
  parse_tee_data_event_status(data, data_tee)
  // }

  // This could potentially do nothing if no event info is available
  compute_event_status(data)
  // console.log(data)
  // Create the heirachy of events by region
  // compute_geo_data_heirachy(data)

  // Update the global cache
  cache.data = data
  cache.updated_at = new Date()

  return data

}

function notify_geo_data(f) {
    if (f !== undefined) {
        if (cache.data !== undefined) {
            // console.log('Notifying caller with cached data ('+JSON.stringify(cache.data).length+' bytes), last updated at ' + cache.updated_at)
            f({
                'data': cache.data,
                'updated': cache.updated_at.toString()
            })
        } else {
            f({
                'data': null,
                'updated': 'never'
            })
        }
    }
}

  browser.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      // console.log(sender.tab ?
      //             "from a content script:" + sender.tab.url :
      //             "from the extension");
      if (request.data == "geo") {
          // sendResponse({farewell: 'argh'});
          var freshen = false
          if ('freshen' in request) {
              if (request.freshen === true) {
                  freshen = true
              }
          }
          // console.log('freshen='+freshen)
        get_geo_data(function(geo_data) {
            // console.log('Sending response back to the page')
            returned_data = {"geo": geo_data}
            // console.log(returned_data)
            sendResponse(returned_data);
        }, freshen);

        // Indicate we are going to return a response asynchronously
        // https://developer.chrome.com/extensions/runtime#event-onMessage
        return true
      }
      if (request.action) {
        var done = false
        var msg = request.action + ": OK"
        switch(request.action) {
          case "cache-all-clear":
            clear_cache()
            done = true
            break
          case "cache-geo-clear":
            clear_cache_by_name("events")
            done = true
            break
          case "cache-tei-clear":
            clear_cache_by_name("technical_event_information")
            done = true
            break
          case "cache-get":
            if (cache.data) {
              msg = JSON.stringify(cache.data,null,2)
            } else {
              msg = "<no cached data>"
            }
            done = true
            break
          case "cache-get-summary":
            var cache_summary = get_cache_summary()
            msg = JSON.stringify(cache_summary,null,2)
            done = true
            break
          case "enable-geo":
            cache.events.enabled = true
            done = true
            break
          case "disable-geo":
            cache.events.enabled = false
            done = true
            break
          case "enable-tei":
            cache.technical_event_information.enabled = true
            done = true
            break
          case "disable-tei":
            cache.technical_event_information.enabled = false
            done = true
            break
        }
        if (done) {
          sendResponse({
            "action": request.action,
            "msg": msg
          });
        } else {
          sendResponse({
            "action": request.action,
            "msg": request.action + ": Unsupported action"
          });
        }
      }
    });
