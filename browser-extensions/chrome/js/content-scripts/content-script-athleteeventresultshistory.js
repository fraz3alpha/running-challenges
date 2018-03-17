
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

function generate_challenge_badges_element() {
    var badge_div = $('<div></div>').attr("id","badges")
    var badge_p = $('<p></p>')
    badge_div.append(badge_p)
    return badge_div
}

function add_challenge_badges(div, data) {

    badge_p = $("p", div)
    badge_p.empty()
    console.log(badge_p)

    var index_counter = 1
    data.forEach(function (challenge) {
        var challenge_link = $('<a></a>')
        challenge_link.attr('href', challenge.link)

        var img = $('<img>'); //Equivalent: $(document.createElement('img'))
        img.attr('src', challenge.icon);
        img.attr('alt',challenge.name)
        img.attr('title',challenge.name)
        img.attr('width',64)
        img.attr('height',64)

        challenge_link.append(img)

        badge_p.append(challenge_link)

        if (index_counter > 0 && index_counter % 8 == 0) {
            badge_p.append($('<br/>'))
        }
        index_counter += 1
    })

    // badge_div.append(badge_p)
    //
    // get_badge_location().after(challenge_badges)
}

function get_badge_location() {
    return $("div[id=content]").find("p:first")
}

// Checks the table fetching function
// console.log(get_table())
// console.log(get_table('results'))
// console.log(get_table('results', 'All Results'))

// Generate the table structure, and add it to the page
var challenges_table = generate_challenge_table()
get_table('results', 'All Results').before(challenges_table)

var badges_div = generate_challenge_badges_element()
get_badge_location().after(badges_div)

// Of the format {"name": something, "link": something, "icon": something}
var badges = []

parkruns_completed = []

get_table("results", "All Results").each(function(results_table) {
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

function get_athlete_id() {
    // Find the Athlete ID by looking on the page for the link which contains the
    // text "View stats for all parkruns by this athlete" to get '<a href="/athleteresultshistory?athleteNumber=1386351"></a>
    var athlete_id = null
    $("a:contains('View stats for all parkruns by this athlete')").each(function (i) {
        athlete_id = $(this).attr('href').split("=")[1]
    })

    return athlete_id

}

function get_volunteer_data() {

    var athlete_id = get_athlete_id()
    console.log('Athlete ID is '+athlete_id)

    if (athlete_id != null) {
        console.log("Fetching volunteer data")
        $.ajax({
             url: "https://www.parkrun.org.uk/results/athleteresultshistory/?athleteNumber="+athlete_id,
             dataType: 'html',
             success: function (result) {
                console.log("Received volunteer info")

                 // Find all the results tables in this page
                 var completed_volunteer_roles = {}
                 $("table[id=results]",result).each(function (results_table_index) {
                     // Try and find the table that also has a <h1> containing
                     // "Volunteer Summary"
                     var results_table = $(this)
                     parent = $(this).parent()
                     $("h1:contains('Volunteer Summary')", parent).each(function (index) {
                         completed_volunteer_roles = {}
                         $("tbody>tr", results_table).each(function (role_index) {
                             table_cells = $("td", this)
                             volunteer_role = table_cells[1].innerText
                             volunteer_role_quantity = table_cells[2].innerText

                             if (!(volunteer_role in completed_volunteer_roles)) {
                                 completed_volunteer_roles[volunteer_role] = 0
                             }
                             completed_volunteer_roles[volunteer_role] += parseInt(volunteer_role_quantity)
                         })
                         console.log(completed_volunteer_roles)
                     })

                 })

                 console.log("Generating volunteer challenge data")
                 var volunteer_data = generate_volunteer_challenge_data(completed_volunteer_roles)
                 console.log(volunteer_data)
                 console.log("Adding volunteer challenge data to table")
                 add_table_break_row(challenges_table, "Volunteer Challenges", "Get a purple badge when you've done a role once, get a star for doing the role 5+ times, two stars for 10+ times, three stars for 25+ times.")
                 add_challenges_to_table(challenges_table, volunteer_data)
                 console.log("Volunteer data added")

                 // Add the badges to the list
                 Object.keys(volunteer_data).forEach(function (challenge) {
                     if (volunteer_data[challenge].complete == true) {
                         var badge_info = {
                             "name": volunteer_data[challenge].name,
                             "icon": chrome.extension.getURL("/images/badges/256x256/"+volunteer_data[challenge].badge_icon+".png"),
                             "link": "#"+challenge
                         }
                         if (volunteer_data[challenge].subparts_completed_count >= 25){
                             badge_info.icon = chrome.extension.getURL("/images/badges/256x256/"+volunteer_data[challenge].badge_icon+"-3-stars.png")
                             badge_info.name += " (25+ times)"
                         } else if (volunteer_data[challenge].subparts_completed_count >= 10){
                             badge_info.icon = chrome.extension.getURL("/images/badges/256x256/"+volunteer_data[challenge].badge_icon+"-2-stars.png")
                             badge_info.name += " (10+ times)"
                         } else if (volunteer_data[challenge].subparts_completed_count >= 5){
                             badge_info.icon = chrome.extension.getURL("/images/badges/256x256/"+volunteer_data[challenge].badge_icon+"-1-star.png")
                             badge_info.name += " (5+ times)"
                         }
                         badges.push(badge_info)
                     }
                 })
                 add_challenge_badges(badges_div, badges)

             },
         });
     }
}

function display_data(challenge_settings) {

    console.log(challenge_settings)

    get_volunteer_data()

    // Construct all the challenges
    challenge_data = challenge_generate_data(challenge_settings)

    console.log(challenge_data)
    add_challenges_to_table(challenges_table, challenge_data)

    // Add the badges to the list
    challenge_data.forEach(function (challenge) {
        if (challenge.complete == true) {
            badges.push({
                "name": challenge.name,
                "icon": chrome.extension.getURL("/images/badges/256x256/"+challenge.badge_icon+".png"),
                "link": "#"+challenge.shortname
            })
        } else if (challenge.partial_completion == true) {
            badges.push({
                "name": challenge.partial_completion_name,
                "icon": chrome.extension.getURL("/images/badges/256x256/"+challenge.partial_completion_badge_icon+".png"),
                "link": "#"+challenge.shortname
            })
        }
    })
    add_challenge_badges(badges_div, badges)

    // var challenge_badges = generate_challenge_badges(challenge_data)
    // get_badge_location().after(challenge_badges)

    console.log(badges)
}
