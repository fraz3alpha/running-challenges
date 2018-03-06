
function get_table(id, caption) {

    query_string = "table"
    if (id !== undefined) {
        query_string += "[id="+id+"]"
    }


    return $(query_string).filter(function(index) {

        // If no caption is specified, return every result
        if (caption === undefined) {
            return true
        }

        // Else, get the captions for these tables
        table_captions = $("caption", this)
        // Skip anything without exactly one caption
        if (table_captions.length !== 1) {
            return false
        }
        // Only include this table if the caption is correct
        return table_captions[0].innerText == caption
    })
}

function generate_challenge_badges(data) {
    var badge_div = $('<div></div>')
    var badge_p = $('<p></p>')

    Object.keys(data).forEach(function (challenge) {
        if (data[challenge].complete == true) {
            var challenge_link = $('<a></a>')
            challenge_link.attr('href', '#'+challenge)

            var img = $('<img>'); //Equivalent: $(document.createElement('img'))
            img.attr('src', chrome.extension.getURL("/images/badges/256x256/"+data[challenge].badge_icon+".png"));
            img.attr('alt',data[challenge].name)
            img.attr('title',data[challenge].name)
            img.attr('width',64)
            img.attr('height',64)

            challenge_link.append(img)

            badge_p.append(challenge_link)
        }
    })

    badge_div.append(badge_p)

    return badge_div
}

function get_badge_location() {
    return $("div[id=content]").find("p:first")
}

// Checks the table fetching function
// console.log(get_table())
// console.log(get_table('results'))
// console.log(get_table('results', 'All Results'))

parkruns_completed = []

// Find all the tables with an id of 'results'
$("table[id=results]").filter(function(index) {
    // Get the captions for these tables
    table_captions = $("caption", this)
    // Skip anything without exactly one caption
    if (table_captions.length !== 1) {
        return false
    }
    // Only include this table if the caption is for the All Results table
    return table_captions[0].innerText == "All Results"
}).each(function(results_table) {
    // Gather the data for this table

    // Find all the table body rows
    completed_parkrun_events = $("tbody>tr", this)

    completed_parkrun_events.each(function(index) {
        // Only parse table rows with at least one cell, and look at the first one
        table_cells = $("td", this)
        if (table_cells.length > 0) {
            // Find the name and other interesting bits of data for this parkrun
            parkrun_name = table_cells[0].innerText
            parkrun_date = table_cells[1].innerText
            parkrun_position = table_cells[3].innerText
            parkrun_time = table_cells[4].innerText

            // Store this parkrun instance in our big data structure
            parkrun_stats = {
                "name": parkrun_name,
                "date": parkrun_date,
                "position": parkrun_position,
                "time": parkrun_time
            }
            parkruns_completed.push(parkrun_stats)

        }
    });
});

// Process parkruns oldest first
parkruns_completed.reverse()

challenge_settings = {
    "parkruns_completed": parkruns_completed,
    "geo_data": null,
    "geo_local_region": null,
    "home_parkrun": null
}

chrome.storage.sync.get({
  home_parkrun: ''
}, function(items) {
  challenge_settings.home_parkrun = items.home_parkrun;
})

var timeout_for_geo_data_ms = 5000

// Timeout suggestion taken from
// https://stackoverflow.com/questions/8377777/implementing-timeouts-for-node-js-callbacks
// Setup the timeout handler
var timeoutProtect = setTimeout(function() {
  // Clear the local timer variable, indicating the timeout has been triggered.
  timeoutProtect = null;
  console.log("timer timed out")
  // Display the data without geo data
  display_data(challenge_settings)

}, timeout_for_geo_data_ms);

chrome.runtime.sendMessage({data: "geo"}, function(response) {
    // Proceed only if the timeout handler has not yet fired.
    if (timeoutProtect) {
      console.log("timer still running when geo data came back")
      // Clear the scheduled timeout handler
      clearTimeout(timeoutProtect);
      // Display the data with real geo data
      challenge_settings.geo_data = response.geo
      display_data(challenge_settings)
  } else {
      console.log("geo data came after timer timed out")
  }

});

function display_data(challenge_settings) {

    console.log(challenge_settings)

    // Construct all the challenges
    challenge_data = challenge_generate_data(challenge_settings)

    console.log(challenge_data)

    var challenge_table = generate_challenge_table(challenge_data)
    get_table('results', 'All Results').before(challenge_table)

    var challenge_badges = generate_challenge_badges(challenge_data)
    get_badge_location().after(challenge_badges)

    console.log(challenge_badges)
}
