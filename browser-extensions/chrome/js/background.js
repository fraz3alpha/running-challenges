// This captures the click on the icon in the toolbar
chrome.browserAction.onClicked.addListener(function(tab) {
    // We want to check if an Athlete Number has been provided,
    // if so lets display their results page
    chrome.storage.sync.get({
      athlete_number: ''
    }, function(items) {
      results_url = "http://www.parkrun.org.uk/results/athleteeventresultshistory/?athleteNumber="+items.athlete_number+"&eventNumber=0"
      chrome.tabs.create({ url: results_url });
    });

    get_geo_data()

});

// The geo data will be updated when there is no data, or it is over 24 hours old
var cached_geo = {
    'data': null,
    'updated': null,
    'updating': false
}
// 24 Hours
var cached_geo_expiry_ms = 24 * 60 * 60 * 1000
// 5 Minutes
// var cached_geo_expiry_ms = 5 * 1000

function get_geo_data(notify_func) {
    now = Date()

    if (cached_geo.updated == null || ((now - cached_geo.updated) > cached_geo_expiry_ms)) {
        cached_geo.updating = true
        $.ajax({
             url: "http://www.parkrun.org.uk/wp-content/themes/parkrun/xml/geo.xml",
             success: function (result) {
                 console.log(result)

                 var geo_data = {
                     'regions': [],
                     'events': {}
                 }

                 // Find all the regions
                 $(result).find('r').each(function(region_index) {
                     geo_data['regions'][$(this).attr('id')] = {
                         "id": $(this).attr('id'),
                         "name": $(this).attr('n'),
                         "lat": $(this).attr('la'),
                         "lon": $(this).attr('lo'),
                         "zoom": $(this).attr('z'),
                         "parent_id": $(this).attr('pid'),
                         "url": $(this).attr('u')
                     }
                 })

                 // Find all the events
                 $(result).find('e').each(function(region_index) {
                     geo_data['events'][$(this).attr('m')] = {
                         "shortname": $(this).attr('n'),
                         "name": $(this).attr('m'),
                         "country_id": $(this).attr('c'),
                         "region_id": $(this).attr('r'),
                         "id": $(this).attr('id'),
                         "lat": $(this).attr('la'),
                         "lon": $(this).attr('lo')
                     }
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
                     notify_func({'farewell': geo_data})
                 }

             },
             dataType: 'xml'
         });

     } else {
         console.log('Returning cached geo data, last updated at ' + cached_geo.updated)

         // Send the response back via a message to whoever asked for it
         if (notify_func !== undefined) {
             console.log('Notifying caller with cached data')
             notify_func({'farewell': cached_geo.data})
         }

         return cached_geo.data
     }

}

// // Listen for messages
// chrome.runtime.onMessage.addListener(
//   function(request, sender, sendResponse) {
//     console.log(sender.tab ?
//                 "from a content script:" + sender.tab.url :
//                 "from the extension");
//     // If they have requested some cached data, look to see what type, and return it
//     if (request.cached_data == "geo") {
//         console.log("Returning the cache value")
//         cached_data = {"cached_data": get_geo_data()}
//         console.log(cached_data)
//       sendResponse(cached_data);
//     }
//   });

  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      console.log(sender.tab ?
                  "from a content script:" + sender.tab.url :
                  "from the extension");
      if (request.data == "geo") {
          // sendResponse({farewell: 'argh'});
        get_geo_data(function(geo_data) {
            console.log('Sending response back to the page')
            sendResponse({geo: geo_data});
        });

        // Indicate we are going to return a response asynchronously
        // https://developer.chrome.com/extensions/runtime#event-onMessage
        return true
      }
    });
