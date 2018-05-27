
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

function generate_flags_element() {
    var flags_div = $('<div></div>').attr("id","flags")
    var flags_p = $('<p></p>')
    flags_div.append(flags_p)
    return flags_div
}

function add_global_tourism_flags(div, data) {

    flags_p = $("p", div)
    flags_p.empty()

    var index_counter = 1
    data.sort(function (o1,o2) {
        // Equal
        if (o1.first_visited === o2.first_visited) {
            return 0
        }
        // If either are null they should go to the back
        if (o1.first_visited === null) {
            return 1
        }
        if (o2.first_visited === null) {
            return -1
        }
        return o1.first_visited - o2.first_visited
    }).forEach(function (country) {
        if (country.visited) {
            // Find out when it was first run and make a nice string
            var first_run = country.first_visited.toISOString().split("T")[0]
            var img = $('<img>');
            img.attr('src', country.icon);
            img.attr('alt',country.name)
            img.attr('title',country.name+": "+first_run)
            img.attr('width',48)
            img.attr('height',48)
            img.attr('style', 'padding-left:6px; padding-right:6px')
            flags_p.append(img)

            if (index_counter > 0 && index_counter % 8 == 0) {
                flags_p.append($('<br/>'))
            }
            index_counter += 1
        }
    })
}

function add_challenge_badges(div, data) {

  console.log('Adding '+JSON.stringify(data)+' to '+ div)

    badge_p = $("p", div)
    badge_p.empty()

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

// Try the promises stuff, vaguely following examples on https://github.com/mozilla/webextension-polyfill

// chrome.storage.sync.get({
//   athlete_number: '',
//   home_parkrun_info: {}
// }

function parse_volunteer_table(result) {

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

             // Try and translate from whatever language it is in
             normalised_volunteer_role = get_normalised_volunteer_role(volunteer_role)

             if (!(normalised_volunteer_role in completed_volunteer_roles)) {
                 completed_volunteer_roles[normalised_volunteer_role] = 0
             }
             completed_volunteer_roles[normalised_volunteer_role] += parseInt(volunteer_role_quantity)
         })
         // console.log(completed_volunteer_roles)
     })

  })
  return completed_volunteer_roles
}

function set_progress_message(progress_message) {
  console.log("Progress: "+progress_message)
  $("div[id=running_challenges_messages_div]").html(progress_message)
}

function parse_results_table() {

  parkruns_completed = []

  get_table("results", get_localised_value('table_all_results')).each(function(results_table) {
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
              parkrun_pb = table_cells[6].innerText.trim()

              // Create a date object, useful for comparing
              parkrun_date_obj = new Date()
              date_parts = parkrun_date.split("/")
              if (date_parts.length == 3) {
                  parkrun_date_obj = new Date(date_parts[2]+"-"+date_parts[1]+"-"+date_parts[0])
              }

              // Store this parkrun instance in our big data structure
              parkrun_stats = {
                  "name": parkrun_name,
                  "date": parkrun_date,
                  "date_obj": parkrun_date_obj,
                  "position": parkrun_position,
                  "time": parkrun_time,
                  "pb": parkrun_pb.length > 0
              }
              parkruns_completed.push(parkrun_stats)

          }
      });
  });

  // Return the results in reverse chronological order, which is the natural
  // way to process it, as the older parkruns will be hit first when iterating
  // over the list
  return parkruns_completed.reverse()
}


function create_skeleton_elements(id_map) {

  top_of_the_page_anchor = $("div[id=content]").find("p:first")

  // Add a message div, with some initial contents
  var running_challenges_messages_div = $('<div/>').attr("id", id_map["messages"])
  top_of_the_page_anchor.after(running_challenges_messages_div)
  // Use the progress message function to se interval
  set_progress_message("Loading...")

  // Create badges element
  var running_challenges_badges_div = $('<div/>').attr("id", id_map["badges"])
  running_challenges_messages_div.after(running_challenges_badges_div)

  // Create flags element
  var running_challenges_flags_div = $('<div/>').attr("id", id_map["flags"])
  running_challenges_badges_div.after(running_challenges_flags_div)

  // Create main table element
  var running_challenges_main_table_div = $('<div/>').attr("id", id_map["main"])
  get_table('results', get_localised_value('table_all_results')).before(running_challenges_main_table_div)

  // Create stats element
  var running_challenges_stats_div = $('<div/>').attr("id", id_map["stats"])
  running_challenges_main_table_div.after(running_challenges_stats_div)
}

function add_stats(div_id, data) {
  set_progress_message("Adding stats")
  stats_data = generate_stats(data)
  console.log(stats_data)
  var stats_div = $("div[id="+div_id+"]")
  add_stats_table(stats_div, stats_data)
  set_progress_message("Added stats")
}

function add_badges(div_id, data) {
  set_progress_message("Adding badges")
  // Find out which challenges we have been provided, and determine if they are
  // complete, and if so, award the badge
  var badges = []
  if (data.challenge_results) {
    // Running badges
    if (data.challenge_results.running_results) {
      data.challenge_results.running_results.forEach(function(result) {
        var badge = get_running_badge(result)
        if (badge) {
          badges.push(badge)
        }
      })
    }
    // Volunteer badges
    if (data.challenge_results.volunteer_results) {
      data.challenge_results.volunteer_results.forEach(function(result) {
        var badge = get_volunteer_badge(result)
        if (badge) {
          badges.push(badge)
        }
      })
    }
  }

  // Now insert all the badges into the page
  badge_div = $("div[id="+div_id+"]")

  var index_counter = 1
  badges.forEach(function (badge) {
      var badge_link = $('<a></a>')
      badge_link.attr('href', badge.link)

      var img = $('<img>')
      img.attr('src', badge.icon)
      img.attr('alt',badge.name)
      img.attr('title',badge.name)
      img.attr('width',64)
      img.attr('height',64)

      badge_link.append(img)
      badge_div.append(badge_link)

      if (index_counter > 0 && index_counter % 8 == 0) {
          badge_div.append($('<br/>'))
      }
      index_counter += 1
  })

  // All done!
  set_progress_message("Added badges")
}

// Format the badge information specific to the running challenge data
function get_running_badge(result) {
  var badge_info = undefined
  console.log(result)
  if (result.complete == true) {
    badge_info = {
        "name": result.name,
        "icon": chrome.extension.getURL("/images/badges/"+result.badge_icon+".png"),
        "link": "#"+result.shortname
    }
  }
  return badge_info
}

// Format the badge information specific to the volunteer challenge data -
// in particular, we award the stars based on how many times each has been done
function get_volunteer_badge(result) {
  var badge_info = undefined
  console.log(result)
  if (result.complete == true) {
      badge_info = {
          "name": result.name,
          "icon": chrome.extension.getURL("/images/badges/"+result.badge_icon+".png"),
          "link": "#"+result.shortname
      }
      if (result.subparts_completed_count >= 25){
          badge_info.icon = chrome.extension.getURL("/images/badges/"+result.badge_icon+"-3-stars.png")
          badge_info.name += " (25+ times)"
      } else if (result.subparts_completed_count >= 10){
          badge_info.icon = chrome.extension.getURL("/images/badges/"+result.badge_icon+"-2-stars.png")
          badge_info.name += " (10+ times)"
      } else if (result.subparts_completed_count >= 5){
          badge_info.icon = chrome.extension.getURL("/images/badges/"+result.badge_icon+"-1-star.png")
          badge_info.name += " (5+ times)"
      }
  }
  return badge_info
}

function add_flags(div_id, data) {
  set_progress_message("Adding flags")
  console.log(data)

  if (data.parkrun_results && data.geo_data) {
    global_tourism_info = generate_global_tourism_data(data.parkrun_results, data.geo_data)
    console.log(global_tourism_info)

    flags_div = $("div[id="+div_id+"]")

    var index_counter = 1
    global_tourism_info.sort(function (o1,o2) {
        // Equal
        if (o1.first_visited === o2.first_visited) {
            return 0
        }
        // If either are null they should go to the back
        if (o1.first_visited === null) {
            return 1
        }
        if (o2.first_visited === null) {
            return -1
        }
        return o1.first_visited - o2.first_visited
    }).forEach(function (country) {
        if (country.visited) {
            // Find out when it was first run and make a nice string
            var first_run = country.first_visited.toISOString().split("T")[0]
            var img = $('<img>');
            img.attr('src', country.icon);
            img.attr('alt',country.name)
            img.attr('title',country.name+": "+first_run)
            img.attr('width',48)
            img.attr('height',48)
            img.attr('style', 'padding-left:6px; padding-right:6px')
            flags_div.append(img)

            if (index_counter > 0 && index_counter % 8 == 0) {
                flags_div.append($('<br/>'))
            }
            index_counter += 1
        }
    })
  }

  set_progress_message("Added flags")
}

function add_challenge_results(div_id, data) {
  set_progress_message("Adding challenge results")
  console.log(data)
  results_div = $("div[id="+div_id+"]")
  results_table = generate_challenge_table()
  results_div.append(results_table)
  // Add the results if we have them
  if (data.challenge_results) {
    if (data.challenge_results.running_results) {
      add_challenges_to_table(results_table, data.challenge_results.running_results)
    }
    if (data.challenge_results.volunteer_results) {
      add_table_break_row(results_table, "Volunteer Challenges", "Get a purple badge when you've done a role once, get a star for doing the role 5+ times, two stars for 10+ times, three stars for 25+ times.")
      add_challenges_to_table(results_table,  data.challenge_results.volunteer_results)
    }
  }
  set_progress_message("Added challenge results")
}

// What all our container divs are called
var id_map = {
  "messages": "running_challenges_messages_div",
  "badges": "running_challenges_badges_div",
  "flags": "running_challenges_flags_div",
  "main": "running_challenges_main_div",
  "stats": "running_challenges_stats_div"
}

create_skeleton_elements(id_map)

var loaded_user_data = undefined
var loaded_geo_data = undefined
var parsed_volunteer_data = undefined
var parsed_results_data = undefined

set_progress_message("Parsing Results")
parsed_results_data = parse_results_table()
set_progress_message("Parsed Results")

set_progress_message("Loading saved data")
browser.storage.sync.get(["home_parkrun_info", "athlete_number"]).then((items) => {
  set_progress_message("Loaded saved data")
  loaded_user_data = items
  console.log("Here is the stored items, fetched with a promise:")
  console.log(items)

  // Now lets fetch the geo data
  set_progress_message("Loading geo data")
  return browser.runtime.sendMessage({data: "geo"});
}).then((results) => {
  set_progress_message("Loaded geo data")
  loaded_geo_data = results.geo
  console.log("Here is the geo data, fetched with a promise:")
  console.log(results)

  set_progress_message("Loading volunteer data")
  // Now lets fetch the volunteer information
  return $.ajax({
    // If we translate this URL into the local one, not only do we have to
    // parse the page separately (no big deal), but we need to add every
    // domain into our CSP, which is a bit annoying, but would maybe
    // turn out to be more efficient for the user in a country far away
    // from the UK (depending on where parkrun host these servers)
    url: "https://www.parkrun.org.uk/results/athleteresultshistory/?athleteNumber="+get_athlete_id(),
    dataType: 'html'})
}).then((results) => {
  set_progress_message("Loaded volunteer data")
  console.log("Here is the volunteer data, fetched with a promise:")
  console.log(results)
  set_progress_message("Parsing volunteer data")
  parsed_volunteer_data = parse_volunteer_table(results)
  set_progress_message("All done")

  // console.log(loaded_user_data)
  // console.log(loaded_geo_data)
  // console.log(loaded_volunteer_data)
  // console.log(parsed_volunteer_data)

  var challenge_results = {
    "running_results": generate_running_challenge_data({
      'parkrun_results': parsed_results_data,
      'geo_data': loaded_geo_data}),
    "volunteer_results": generate_volunteer_challenge_data({
      'volunteer_data': parsed_volunteer_data})
  }

  console.log(challenge_results)

  add_badges(id_map["badges"],{
    'challenge_results': challenge_results
  })

  add_flags(id_map["flags"],{
    'parkrun_results': parsed_results_data,
    'geo_data': loaded_geo_data
  })

  add_challenge_results(id_map["main"], {
    'challenge_results': challenge_results
  })

  add_stats(id_map["stats"], {
    'parkrun_results': parsed_results_data,
    'volunteer_data': parsed_volunteer_data,
    'geo_data': loaded_geo_data,
    'athlete_id': get_athlete_id(),
    'user_data': loaded_user_data,
    'challenge_results': challenge_results
  })

}).catch(error => {
  console.error(`An error occurred: ${error}`);
});


// Generate the table structure, and add it to the page
// var challenges_table = generate_challenge_table()
// get_table('results', get_localised_value('table_all_results')).before(challenges_table)
//
// var badges_div = generate_challenge_badges_element()
// get_badge_location().after(badges_div)
//
// var flags_div = generate_flags_element()
// badges_div.after(flags_div)

// Of the format {"name": something, "link": something, "icon": something}
// var badges = []
//
//
// // Process parkruns oldest first
// parkruns_completed.reverse()
//
// challenge_settings = {
//     "parkruns_completed": parkruns_completed,
//     "geo_data": null,
//     "geo_local_region": null,
//     "home_parkrun": null
// }
//
// chrome.storage.sync.get({
//   home_parkrun: ''
// }, function(items) {
//   challenge_settings.home_parkrun = items.home_parkrun;
// })
//
// var timeout_for_geo_data_ms = 5000
//
// // Timeout suggestion taken from
// // https://stackoverflow.com/questions/8377777/implementing-timeouts-for-node-js-callbacks
// // Setup the timeout handler
// var timeoutProtect = setTimeout(function() {
//   // Clear the local timer variable, indicating the timeout has been triggered.
//   timeoutProtect = null;
//   console.log("Timed out receiving geo data")
//   // Display the data without geo data
//   display_data(challenge_settings)
//
// }, timeout_for_geo_data_ms);
//
// chrome.runtime.sendMessage({data: "geo"}, function(response) {
//     // Proceed only if the timeout handler has not yet fired.
//     if (timeoutProtect) {
//       // console.log("timer still running when geo data came back")
//       // Clear the scheduled timeout handler
//       clearTimeout(timeoutProtect);
//       // Display the data with real geo data
//       challenge_settings.geo_data = response.geo
//       display_data(challenge_settings)
//   } else {
//       // console.log("geo data came after timer timed out")
//   }
//
// });

function get_athlete_id() {
    // Very basic method to get only the parameter we care about
    var page_parameters = window.location.search
    var athlete_id = null
    if (page_parameters.includes('athleteNumber=')) {
        athlete_id = page_parameters.split('athleteNumber=')[1].split('&')[0]
    }
    console.log('Athlete ID: '+athlete_id)
    return athlete_id
}

function get_volunteer_data() {

    var athlete_id = get_athlete_id()
    // console.log('Athlete ID is '+athlete_id)

    if (athlete_id != null) {
        // console.log("Fetching volunteer data")
        $.ajax({
             // If we translate this URL into the local one, not only do we have to
             // parse the page separately (no big deal), but we need to add every
             // domain into our CSP, which is a bit annoying, but would maybe
             // turn out to be more efficient for the user in a country far away
             // from the UK (depending on where parkrun host these servers)
             url: "https://www.parkrun.org.uk/results/athleteresultshistory/?athleteNumber="+athlete_id,
             dataType: 'html',
             success: function (result) {
                // console.log("Received volunteer info")

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

                             // Try and translate from whatever language it is in
                             normalised_volunteer_role = get_normalised_volunteer_role(volunteer_role)

                             if (!(normalised_volunteer_role in completed_volunteer_roles)) {
                                 completed_volunteer_roles[normalised_volunteer_role] = 0
                             }
                             completed_volunteer_roles[normalised_volunteer_role] += parseInt(volunteer_role_quantity)
                         })
                         // console.log(completed_volunteer_roles)
                     })

                 })

                 // console.log("Generating volunteer challenge data")
                 var volunteer_data = generate_volunteer_challenge_data(completed_volunteer_roles)
                 // console.log(volunteer_data)
                 // console.log("Adding volunteer challenge data to table")
                 add_table_break_row(challenges_table, "Volunteer Challenges", "Get a purple badge when you've done a role once, get a star for doing the role 5+ times, two stars for 10+ times, three stars for 25+ times.")
                 add_challenges_to_table(challenges_table, volunteer_data)
                 // console.log("Volunteer data added")

                 // Add the badges to the list
                 Object.keys(volunteer_data).forEach(function (challenge) {
                     if (volunteer_data[challenge].complete == true) {
                         var badge_info = {
                             "name": volunteer_data[challenge].name,
                             "icon": chrome.extension.getURL("/images/badges/"+volunteer_data[challenge].badge_icon+".png"),
                             "link": "#"+volunteer_data[challenge].shortname
                         }
                         if (volunteer_data[challenge].subparts_completed_count >= 25){
                             badge_info.icon = chrome.extension.getURL("/images/badges/"+volunteer_data[challenge].badge_icon+"-3-stars.png")
                             badge_info.name += " (25+ times)"
                         } else if (volunteer_data[challenge].subparts_completed_count >= 10){
                             badge_info.icon = chrome.extension.getURL("/images/badges/"+volunteer_data[challenge].badge_icon+"-2-stars.png")
                             badge_info.name += " (10+ times)"
                         } else if (volunteer_data[challenge].subparts_completed_count >= 5){
                             badge_info.icon = chrome.extension.getURL("/images/badges/"+volunteer_data[challenge].badge_icon+"-1-star.png")
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

// function display_data(challenge_settings) {
//
//     // console.log(challenge_settings)
//
//     // Asynchronous call, it handles adding everything to the page separately
//     get_volunteer_data()
//
//     // Find the global tourism info (flags)
//     global_tourism_info = generate_global_tourism_data(challenge_settings)
//     // console.log(global_tourism_info)
//     add_global_tourism_flags(flags_div, global_tourism_info)
//
//     // Construct all the challenges
//     challenge_data = challenge_generate_data(challenge_settings)
//     // console.log(challenge_data)
//     add_challenges_to_table(challenges_table, challenge_data)
//     // Generate stats
//     generate_stats_from_results(challenge_settings)
//
//     // Add the badges to the list
//     challenge_data.forEach(function (challenge) {
//         if (challenge.complete == true) {
//             badges.push({
//                 "name": challenge.name,
//                 "icon": chrome.extension.getURL("/images/badges/"+challenge.badge_icon+".png"),
//                 "link": "#"+challenge.shortname
//             })
//         } else if (challenge.partial_completion == true) {
//             badges.push({
//                 "name": challenge.partial_completion_name,
//                 "icon": chrome.extension.getURL("/images/badges/"+challenge.partial_completion_badge_icon+".png"),
//                 "link": "#"+challenge.shortname
//             })
//         }
//     })
//     add_challenge_badges(badges_div, badges)
//
//     // var challenge_badges = generate_challenge_badges(challenge_data)
//     // get_badge_location().after(challenge_badges)
//
//     // console.log(badges)
// }
