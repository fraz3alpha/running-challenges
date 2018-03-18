// This captures the click on the icon in the toolbar
chrome.browserAction.onClicked.addListener(function(tab) {
    // We want to check if an Athlete Number has been provided,
    // if so lets display their results page
    chrome.storage.sync.get({
      athlete_number: '',
      home_parkrun_info: {}
    }, function(items) {
        console.log('Icon clicked, loading based on '+JSON.stringify(items))
        // If no athlete number has been set, load the options page
        if (items.athlete_number == '') {
            chrome.runtime.openOptionsPage();
        } else {
            var results_url = "http://www.parkrun.org.uk/results/athleteeventresultshistory/?athleteNumber="+items.athlete_number+"&eventNumber=0"
            if ("local_url" in items.home_parkrun_info) {
                results_url = items.home_parkrun_info.local_url+"/results/athleteeventresultshistory/?athleteNumber="+items.athlete_number+"&eventNumber=0"
            }
            chrome.tabs.create({ url: results_url });
        }

    });

});

// The geo data will be updated when there is no data, or it is over 24 hours old
var cached_geo = {
    'data': null,
    'updated': null,
    'updating': false
}
// 3 Days
// A good balance between not every day, but not as long as a week - when new
// events may have been added
var cached_geo_expiry_ms = 3 * 24 * 60 * 60 * 1000

function traverse_geo_data(geo_data, region_name, depth=0) {
    var regions = geo_data.regions
    var events = geo_data.events

    console.log(region_name)
    $.each(regions[region_name].child_region_names, function(index, child_region_name) {
        traverse_geo_data(geo_data, child_region_name)
    })

    // REGIONS
    // Add all of our child region names and ids to the recursive list first
    $.each(regions[region_name].child_region_names, function(index, child_region_name) {
        regions[region_name].child_region_recursive_names.push(child_region_name)
        regions[region_name].child_region_recursive_ids.push(regions[child_region_name].id)
    })
    // Now add all the ones from each of our children
    $.each(regions[region_name].child_region_names, function(index, child_region_name) {
        $.each(regions[child_region_name].child_region_recursive_names, function(index, rec_child_region_name) {
            regions[region_name].child_region_recursive_names.push(rec_child_region_name)
            regions[region_name].child_region_recursive_ids.push(regions[rec_child_region_name].id)
        })
    })

    // EVENTS
    // Add all of our child event names and ids to the recursive list first
    $.each(regions[region_name].child_event_names, function(index, child_event_name) {
        regions[region_name].child_event_recursive_names.push(child_event_name)
        regions[region_name].child_event_recursive_ids.push(events[child_event_name].id)
    })
    // Now add all the ones from each of our children
    $.each(regions[region_name].child_region_names, function(index, child_region_name) {
        $.each(regions[child_region_name].child_event_recursive_names, function(index, rec_child_event_name) {
            regions[region_name].child_event_recursive_names.push(rec_child_event_name)
            regions[region_name].child_event_recursive_ids.push(events[rec_child_event_name].id)
        })
    })

}

function get_geo_data(notify_func) {
    now = Date()

    if (cached_geo.updated == null || ((now - cached_geo.updated) > cached_geo_expiry_ms)) {
        cached_geo.updating = true
        $.ajax({
             url: "https://www.parkrun.org.uk/wp-content/themes/parkrun/xml/geo.xml",
             success: function (result) {
                 console.log(result)

                 var geo_data = {
                     'regions': {},
                     'events': {},
                     'countries': {}
                 }

                 // First of all lets go and parse all the regions and all of
                 // the events in the XML file and put them in out data structure.
                 // Any additional parsing or additions to this data will be
                 // done afterwards

                 // Find all the regions
                 $(result).find('r').each(function(region_index) {
                     this_region = $(this)
                     geo_data.regions[this_region.attr('n')] = {
                         // All the standard attributes that come from the parkrun data
                         "id": this_region.attr('id'),
                         "name": this_region.attr('n'),
                         "lat": this_region.attr('la'),
                         "lon": this_region.attr('lo'),
                         "zoom": this_region.attr('z'),
                         "parent_id": this_region.attr('pid'),
                         "url": this_region.attr('u'),

                         // Extra attributes that we are going to fill in
                         // Direct children regions and events
                         "child_region_ids": [],
                         "child_region_names": [],
                         "child_event_ids": [],
                         "child_event_names": [],
                         // Children of children etc...
                         "child_region_recursive_ids": [],
                         "child_region_recursive_names": [],
                         "child_event_recursive_ids": [],
                         "child_event_recursive_names": []
                     }
                 })

                 // We may wish to move some countries to a top level
                 // If so, we can do that here
                 // var moved_top_level_regions = ['Namibia', 'Swaziland']
                 // $.each(moved_top_level_regions, function(index, region) {
                 //     if (region in geo_data.regions) {
                 //         if (geo_data.regions[region].parent_id != "1") {
                 //             geo_data.regions[region].parent_id = "1"
                 //         }
                 //     }
                 // })

                 // Create maps between ids and names
                 region_id_to_name_map = {}
                 region_name_to_id_map = {}
                 $.each(geo_data.regions, function(region_name, region_info) {
                     region_id_to_name_map[region_info.id] = region_name
                     region_name_to_id_map[region_name] = region_info.id
                 })

                 // Add region as a child to its parent
                 $.each(geo_data.regions, function(region_name, region_info) {
                     if (region_info.parent_id !== null && region_info.parent_id != "") {
                         if (region_info.parent_id in region_id_to_name_map) {
                             parent_region_name = region_id_to_name_map[region_info.parent_id]
                             geo_data.regions[parent_region_name].child_region_ids.push(region_info.id)
                             geo_data.regions[parent_region_name].child_region_names.push(region_info.name)
                         }
                     }
                 })

                 // Find all the events
                 $(result).find('e').each(function(region_index) {
                     this_event = $(this)
                     geo_data.events[this_event.attr('m')] = {
                         // All the standard attributes that come from the parkrun data
                         "shortname": this_event.attr('n'),
                         "name": this_event.attr('m'),
                         "region_id": this_event.attr('r'),
                         "country_id": this_event.attr('c'),
                         "id": this_event.attr('id'),
                         "lat": this_event.attr('la'),
                         "lon": this_event.attr('lo'),
                         // Extra attributes that we are going to fill in
                         "region_name": "unknown",
                         "country_name": "unknown"
                     }
                 })

                 // Find all the countries in the regions we have parsed
                 $.each(geo_data.regions, function(region_name, region_info) {
                     // If the country's parent id is 1, that means it is directly
                     // listed under "World"
                     if (region_info.parent_id == "1") {
                         geo_data.countries[region_name] = {
                             "name": region_name,
                             "region_name": region_name,
                             "region_id": region_info.id
                         }
                     }
                 })

                 // Add each event to a region
                 $.each(geo_data.events, function(event_name, event_info) {
                     if (event_info.region_id in region_id_to_name_map) {
                         // Add the event under the region to which it belongs
                         var event_region_name = region_id_to_name_map[event_info.region_id]
                         event_info.region_name = event_region_name
                         geo_data.regions[event_region_name].child_event_ids.push(event_info.id)
                         geo_data.regions[event_region_name].child_event_names.push(event_info.name)
                     } else {
                         console.log("Unknown region '"+event_info.region_id+"' for "+event_info.name)
                     }
                 })

                 // Traverse the tree of regions from World down, and sum up all
                 // the events and ids
                 traverse_geo_data(geo_data, "World")

                 // Iterate though each country and set an event's country
                 $.each(geo_data.countries, function(index, country_info) {
                     $.each(geo_data.regions[country_info.name].child_event_recursive_names, function(index, event_name) {
                         geo_data.events[event_name].country_name = country_info.name
                         console.log(geo_data.regions[country_info.name].url)
                         geo_data.events[event_name].local_url = geo_data.regions[country_info.name].url
                     })
                 })

                 console.log(geo_data)

                 // Update the cached data with what we have just fetched
                 cached_geo = {
                     'data': geo_data,
                     'updated': now,
                     'updating': false
                 }

                 // Send the response back via a message to whoever asked for it
                 if (notify_func !== undefined) {
                     console.log('Notifying caller with live data')
                     notify_func(cached_geo)
                 }

             },
             dataType: 'xml'
         });

     } else {
         console.log('Returning cached geo data, last updated at ' + cached_geo.updated)

         // Send the response back via a message to whoever asked for it
         if (notify_func !== undefined) {
             console.log('Notifying caller with cached data')
             notify_func(cached_geo)
         }

         return cached_geo
     }

}

  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      console.log(sender.tab ?
                  "from a content script:" + sender.tab.url :
                  "from the extension");
      if (request.data == "geo") {
          // sendResponse({farewell: 'argh'});
        get_geo_data(function(geo_data) {
            console.log('Sending response back to the page')
            returned_data = {"geo": geo_data}
            console.log(returned_data)
            sendResponse(returned_data);
        });

        // Indicate we are going to return a response asynchronously
        // https://developer.chrome.com/extensions/runtime#event-onMessage
        return true
      }
    });
