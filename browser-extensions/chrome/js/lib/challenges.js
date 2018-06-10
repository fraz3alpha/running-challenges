/*
 * These functions provide a way to generate the data relating to challenge
 * based on the results provided to them. This includes if the challenge
 * is complete, how many subparts there are, and how far you have to go etc..
 */

function generate_running_challenge_data(data) {
  challenge_data = []
  if (data.parkrun_results) {
    challenge_data.push(challenge_tourist(data.parkrun_results, {"shortname": "tourist", "name": "Tourist", "data": 20, "help": "Run at 20+ different parkrun locations anywhere in the world."})),
    challenge_data.push(challenge_tourist(data.parkrun_results, {"shortname": "cowell-club", "name": "Cowell Club", "data": 100, "help": "Run at 100+ different parkrun locations anywhere in the world. Named after the first parkrunners to complete it. A quarter cowell is available at 25, half at 50, and three-quarter at 75."})),
    challenge_data.push(challenge_start_letters(data.parkrun_results, {"shortname": "alphabeteer", "name": "Alphabeteer", "data": "abcdefghijklmnopqrstuvwyz", "help": "Run at parkrun locations starting with each letter of the English alphabet (except X)."})),
    challenge_data.push(challenge_single_parkrun_count(data.parkrun_results, {"shortname": "single-ton", "name": "Single-Ton", "data": 100, "help": "Run 100+ parkruns at the same location."})),
    challenge_data.push(challenge_single_parkrun_count(data.parkrun_results, {"shortname": "double-ton", "name": "Double-Ton", "data": 200, "help": "Run 200+ parkruns at the same location."})),
    challenge_data.push(challenge_stopwatch_bingo(data.parkrun_results, {"shortname": "stopwatch-bingo", "name": "Stopwatch Bingo", "help": " Collect all the seconds from 00 to 59 in your finishing times."})),
    challenge_data.push(challenge_start_letters(data.parkrun_results, {"shortname": "pirates", "name": "Pirates!", "data": "cccccccr", "help": "Run seven Cs and an R (say it out loud)."})),
    challenge_data.push(challenge_start_letters(data.parkrun_results, {"shortname": "stayin-alive", "name": "Stayin' Alive", "data": "bgbgbg", "help": "Run three Bees and three Gees."})),
    challenge_data.push(challenge_words(data.parkrun_results, {"shortname": "compass-club", "name": "Compass Club", "data": ["north","south","east","west"], "help": " Run at a parkrun named after each of the four compass points."})),
    challenge_data.push(challenge_parkruns(data.parkrun_results, {"shortname": "full-ponty", "name": "The Full Ponty", "data": ["Pontefract","Pontypool","Pontypridd"], "help": "Run at all the parkruns named ponty... or ponte..."})),
    challenge_data.push(challenge_parkruns(data.parkrun_results, {"shortname": "pilgrimage", "name": "Bushy Pilgrimage", "data": ["Bushy Park"], "help": "Run at Bushy parkrun, where it all began."})),
    challenge_data.push(challenge_nyd_double(data.parkrun_results, {"shortname": "nyd-double", "name":  "NYD Double", "help": "Run two parkruns on one New Year's Day."})),
    challenge_data.push(challenge_groundhog_day(data.parkrun_results, {"shortname": "groundhog-day", "name": "Groundhog Day", "help": "Finish with the same time at the same parkrun location on two consecutive parkruns."}))
  }

  if (data.parkrun_results && data.geo_data) {
    challenge_data.push(challenge_by_region(data.parkrun_results, data.geo_data, {"shortname": "regionnaire", "name": "Regionnaire", "help": "Run all the parkrun locations in a geographical region."}))
  }

  return challenge_data
}

function generate_volunteer_challenge_data(data) {

  var volunteer_challenge_data = []

  if (data.volunteer_data) {
    volunteer_data = data.volunteer_data
    var volunteer_roles = [
        {"shortname": "equipment-storage", "name": "Equipment Storage and Delivery"},
        {"shortname": "comms-person", "name": "Communications Person"},
        {"shortname": "volunteer-coordinator", "name": "Volunteer Co-ordinator"},
        {"shortname": "setup", "name": "Pre-event Setup"},
        {"shortname": "first-timers-briefing", "name": "First Timers Briefing"},
        {"shortname": "sign-language", "name": "Sign Language Support"},
        {"shortname": "marshal", "name": "Marshal"},
        {"shortname": "tail-walker", "name": "Tail Walker"},
        {"shortname": "run-director", "name": "Run Director"},
        {"shortname": "lead-bike", "name": "Lead Bike"},
        {"shortname": "pacer", "name": "Pacer", "matching-roles": ["Pacer (5k only)"]},
        {"shortname": "vi-guide", "name": "Guide Runner", "matching-roles": ["VI Guide"]},
        {"shortname": "photographer", "name": "Photographer"},
        {"shortname": "timer", "name": "Timer", "matching-roles": ["Timekeeper", "Backup Timer"]},
        {"shortname": "funnel-manager", "name": "Funnel Manager"},
        {"shortname": "finish-tokens", "name": "Finish Tokens & Support", "matching-roles": ["Finish Tokens", "Finish Token Support"]},
        {"shortname": "barcode-scanning", "name": "Barcode Scanning"},
        {"shortname": "manual-entry", "name": "Number Checker"},
        {"shortname": "close-down", "name": "Post-event Close Down"},
        {"shortname": "results-processing", "name": "Results Processor"},
        {"shortname": "token-sorting", "name": "Token Sorting"},
        {"shortname": "run-report-writer", "name": "Run Report Writer"},
        {"shortname": "other", "name": "Other"},
        {"shortname": "warm-up-leader", "name": "Warm Up Leader", "matching-roles": ["Warm Up Leader (junior events only)"]},
    ]

    // Populate the results with the above
    volunteer_roles.forEach(function (role) {
        var this_role_data = create_data_object(role, "volunteer")
        this_role_data.summary_text = ""
        this_role_data.subparts_completed_count = 0
        if (role["matching-roles"] !== undefined){
            for (var i=0; i<role["matching-roles"].length; i++) {
                if (role["matching-roles"][i] in volunteer_data) {
                    this_role_data.subparts_completed_count += volunteer_data[role["matching-roles"][i]]
                }
            }
        }
        if (role.name in volunteer_data) {
            // console.log("Completed "+role.name+" "+volunteer_data[role.name]+" times")
            this_role_data.subparts_completed_count = volunteer_data[role.name]
        }
        if (this_role_data.subparts_completed_count > 0) {
            this_role_data.summary_text = "x"+this_role_data.subparts_completed_count
            this_role_data.complete = true
        } else {
            this_role_data.summary_text = '-'
        }

        update_data_object(this_role_data)
        volunteer_challenge_data.push(this_role_data)
    })
  }

  return volunteer_challenge_data
}

// Function adapted from https://www.movable-type.co.uk/scripts/latlong.html
function calculate_great_circle_distance(point1, point2) {
  var R = 6371; // km
  var φ1 = point1.lat * Math.PI / 180;
  var φ2 = point2.lat * Math.PI / 180;
  var Δφ = (point2.lat-point1.lat) * Math.PI / 180;
  var Δλ = (point2.lon-point1.lon) * Math.PI / 180;

  var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ/2) * Math.sin(Δλ/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  var d = R * c;

  return d
}

// These stat generation functions are all separate for each of maintenance
// They would be quicker if they were all in one loop, but it makes testing
// and extending them harder

// How many runs in total
function generate_stat_total_runs(parkrun_results) {
  var total_runs = 0
  parkrun_results.forEach(function (parkrun_event) {
    // Count the total runs
    total_runs += 1
  })
  return {
    "display_name": "Total runs",
    "value": total_runs
  }
}

// How many PBs in total
function generate_stat_total_pbs(parkrun_results) {
  var total_pbs = 0
  parkrun_results.forEach(function (parkrun_event) {
    // Count the number of PBs
    if (parkrun_event.pb) {
      total_pbs += 1
    }
  })
  return {
    "display_name": "Total PBs",
    "value": total_pbs
  }
}

// Maximum number of consecutive PBs in the results table
function generate_stat_longest_pb_streak(parkrun_results) {
  var longest_pb_streak = 0
  var this_pb_streak = 0
  parkrun_results.forEach(function (parkrun_event) {
    // Count the number of consecutive PBs
    if (parkrun_event.pb) {
      // Increment this PB streak, and if it exceeds the max, make it that too
      this_pb_streak += 1
      if (this_pb_streak > longest_pb_streak) {
        longest_pb_streak = this_pb_streak
      }
    } else {
      // Reset the PB streak
      this_pb_streak = 0
    }
  })
  return {
    "display_name": "Longest PB streak",
    "value": longest_pb_streak + " runs"
  }
}

// Sum of all parkrun distances ran, +5km for regular, +2km if there is 'junior'
// in the name of the event
function generate_stat_total_distance_ran(parkrun_results) {
  var total_distance_ran = 0
  parkrun_results.forEach(function (parkrun_event) {
    // Find the distance this athlete has run (juniors is 2k, else 5k)
    if (parkrun_event.name.toLowerCase().includes('juniors')) {
      total_distance_ran += 2
    } else {
      total_distance_ran += 5
    }
  })
  return {
    "display_name": "Total distance run",
    "value": total_distance_ran+"km"
  }
}

// Maximum number of runs in a calendar year, as determined from the date
// run in the results table
function generate_stat_most_runs_in_a_year(parkrun_results) {
  var runs_per_year = {}
  var value = "None"
  // Group results by year
  parkrun_results.forEach(function (parkrun_event) {
    if (!(parkrun_event.date_obj.getFullYear() in runs_per_year)) {
      runs_per_year[parkrun_event.date_obj.getFullYear()] = 0
    }
    runs_per_year[parkrun_event.date_obj.getFullYear()] += 1
  })
  // Sort years by number of runs descending
  var best_year_sorted = Object.keys(runs_per_year).sort(function(a, b) {
      return runs_per_year[b] - runs_per_year[a]
  })
  // Find all the years with the maximum value
  var best_years = []
  if (best_year_sorted.length > 0) {
    best_year_sorted.forEach(function (year){
      if (runs_per_year[year] == runs_per_year[best_year_sorted[0]]) {
        best_years.push(year)
      }
    })
    value = runs_per_year[best_year_sorted[0]] + " in " + best_years.join(",")
  }

  return {
    "display_name": "Most runs in a year",
    "value": value
  }
}

// The number of parkruns that satisfy the equation 'p parkruns run at least p times'
// E.g. you have run 4 different parkruns at least 4 times.
function generate_stat_p_index(parkrun_results) {
  var p_index = 0
  var event_attendance_tally = {}

  parkrun_results.forEach(function (parkrun_event) {
    if (!(parkrun_event.name in event_attendance_tally)) {
      event_attendance_tally[parkrun_event.name] = 0
    }
    event_attendance_tally[parkrun_event.name] += 1
  })
  // Sort events by number of runs descending
  var event_attendance_sorted = Object.keys(event_attendance_tally).sort(function(a, b) {
      return event_attendance_tally[b] - event_attendance_tally[a]
  })
  // Iterate through the events, and as long as the numbers of times we have
  // run at the even is greater than the index value, increment the p-index
  event_attendance_sorted.forEach(function(event_name, index) {
    if (event_attendance_tally[event_name] > index) {
      p_index += 1
    }
  })
  return {
    "display_name": "p-index",
    "value": p_index
  }
}

// The maximum continguous series of parkrun event numbers you have attended
// (at any event), starting at 1.
function generate_stat_wilson_index(parkrun_results) {
  var wilson_index = 0
  var event_numbers_visited = {}

  parkrun_results.forEach(function (parkrun_event) {
    event_numbers_visited[parkrun_event.event_number] = true
  })
  // Iterate through the maximum set of event numbers they could have, and check
  // if each is in the object, we stop when we can't find one
  var index
  for (index=1; index<Object.keys(event_numbers_visited).length; index++) {
    if (index in event_numbers_visited) {
      wilson_index += 1
    } else {
      break
    }
  }
  return {
    "display_name": "wilson-index",
    "value": wilson_index
  }
}

// What date was this athlete's first run
function generate_stat_parkrun_birthday(parkrun_results) {
  var birthday = "Never run"
  if (parkrun_results.length > 0) {
    birthday_date = parkrun_results[0].date_obj
    birthday =  birthday_date
  }
  return {
    "display_name": "parkrun birthday",
    "value": birthday
  }
}

// Total number of years parkrunning, if today if your anniversary it will go up
function generate_stat_years_parkrunning(parkrun_results) {
  var years = 0
  if (parkrun_results.length > 0) {
    var birthday_date = parkrun_results[0].date_obj
    var now = new Date()
    if (now.getMonth() > birthday_date.getMonth() || (now.getMonth() == birthday_date.getMonth() && now.getDay() >= birthday_date.getDay())) {
      years = now.getFullYear() - birthday_date.getFullYear()
    } else {
      years = now.getFullYear() - birthday_date.getFullYear() - 1
    }
  }
  return {
    "display_name": "Years parkrunning",
    "value": years
  }
}

function generate_stat_events_run(parkrun_results) {
  // Find those parkrun events that have been completed
  var events_run = {}

  parkrun_results.forEach(function (parkrun_event) {
    if (!(parkrun_event.name in events_run)) {
      events_run[parkrun_event.name] = true
    }
  })

  return {
    "display_name": "Events run",
    "value": Object.keys(events_run).length
  }
}

function generate_stat_events_run_this_year(parkrun_results) {
  // Find those parkrun events that have been completed
  var events_run = {}

  parkrun_results.forEach(function (parkrun_event) {
    if (!(parkrun_event.name in events_run)) {
      events_run[parkrun_event.name] = true
    }
  })

  return {
    "display_name": "Events run this year",
    "value": "Not Implemented"
  }
}

// Total distance between parkruns that you have run - a measure of how much
// you have travelled to go to parkrun!
function generate_stat_total_distance_travelled(parkrun_results, geo_data) {
  var total_distance_travelled = 0
  var previous_event_location = undefined
  parkrun_results.forEach(function (parkrun_event) {

    // Work out how far the parkrunner has travelled (between consecutive events)
    if (geo_data.data.events[parkrun_event.name] !== undefined) {
      var event_location_info = geo_data.data.events[parkrun_event.name]
      // We need to know the previous event location to work out the distance
      // so we keep track of this separately to the previous event - in case we
      // don't know where someone inbetween is
      if (previous_event_location !== undefined) {
        // Compare the names of the parkruns and don't compute the distance if they
        // are the same - it should be fine without this, but we might get odd
        // small numbers being added if there are rounding errors
        if (parkrun_event.name != previous_event_location.name) {
          // Both event_location_info and previous_event_location have properties
          // of .lat and .lon, so we can pass them to this function
          // These distances can clock up fast if you regularly visit friends and
          // family in different parts of the country. A weekend in Manchester
          // from Winchester could easily add on another 250km for two consecutive
          // weeks
          total_distance_travelled += Math.round(calculate_great_circle_distance(event_location_info, previous_event_location))
        }
      }
      // Store where we were this week for next time
      previous_event_location = event_location_info
    }
  })

  return {
    "display_name": "Total distance travelled",
    "value": total_distance_travelled + "km"
  }
}

// Count of the number of distinct countries you have visited
function generate_stat_total_countries_visited(parkrun_results, geo_data) {
  var parkrun_countries_visited = {}
  parkrun_results.forEach(function (parkrun_event) {

    // Work out how many countries have been visited
    if (geo_data.data.events[parkrun_event.name] !== undefined) {
      var event_location_info = geo_data.data.events[parkrun_event.name]
      if (!(event_location_info.country_name in parkrun_countries_visited)) {
        parkrun_countries_visited[event_location_info.country_name] = true
      }
    }
  })

  return {
    "display_name": "Countries visited",
    "value": Object.keys(parkrun_countries_visited).length
  }
}

function generate_stat_average_parkrun_location(parkrun_results, geo_data) {
  var lat_sum = 0
  var lon_sum = 0
  var count = 0

  parkrun_results.forEach(function (parkrun_event) {
    // Work out how far the parkrunner has travelled to this location
    if (parkrun_event.name in geo_data.data.events) {
      var event_location_info = geo_data.data.events[parkrun_event.name]
      if (event_location_info.lat && event_location_info.lon) {
        lat_sum += parseFloat(event_location_info.lat)
        lon_sum += parseFloat(event_location_info.lon)
        count += 1
      }
    }
  })

  var value = "None"
  if (count > 0) {
    value = (lat_sum/count).toFixed(5) + "," + (lon_sum/count).toFixed(5)
  }

  return {
    "display_name": "Average parkrun lat/lon location",
    "value": value
  }
}

// Furthest parkrun you have run away from your home parkrun
function generate_stat_furthest_travelled(parkrun_results, geo_data, home_parkrun) {
  furthest_travelled = {
    'parkrun_event': undefined,
    'distance': 0,
    'display_name': ''
  }
  parkrun_results.forEach(function (parkrun_event) {
    // Work out how far the parkrunner has travelled to this location
    var event_location_info = geo_data.data.events[parkrun_event.name]
    if (event_location_info !== undefined) {
      if (parkrun_event.name != home_parkrun.name) {
        var distance = Math.round(calculate_great_circle_distance(event_location_info, home_parkrun))
        if (distance > furthest_travelled.distance) {
          furthest_travelled.distance = distance
          furthest_travelled.parkrun_event = event_location_info
        }
      }
    }
  })

  if (furthest_travelled.parkrun_event !== undefined) {
    furthest_travelled.display_name = furthest_travelled.parkrun_event.name + ", " + furthest_travelled.parkrun_event.country_name
  }

  return {
    "display_name": "Furthest travelled",
    "value": furthest_travelled.display_name + ", "+ furthest_travelled.distance + "km"
  }
}

// Which is the closest parkrun you haven't done yet
function generate_stat_nearest_event_not_done_yet(parkrun_results, geo_data, home_parkrun_info) {
  // Find those parkrun events that have been completed
  var events_run = {}

  parkrun_results.forEach(function (parkrun_event) {
    if (!(parkrun_event.name in events_run)) {
      events_run[parkrun_event.name] = true
    }
  })
  var event_distances = {}

  $.each(geo_data.data.events, function (event_name, event_info) {
    if (!(event_name in events_run)) {
      if (event_info.status == 'Live' && event_info.lat && event_info.lon) {
        event_distances[event_name] = calculate_great_circle_distance(event_info, home_parkrun_info)
      }
    }
  })

  // Sort the list of events not done by distance
  var sorted_events = Object.keys(event_distances).sort(function(a, b) {
      return event_distances[a] - event_distances[b]
  })

  var value = "All parkruns completed!"

  if (sorted_events.length > 0) {
    var nendy_name = sorted_events[0]
    var nendy = geo_data.data.events[nendy_name]
    value = nendy.name + ", " + nendy.country_name+ " - " + Math.round(event_distances[nendy_name]) + "km away"
  }

  return {
    "display_name": "Nearest event not done yet",
    "value": value
  }
}

// How many times has your name appeared on the volunteer roster (note, not the
// same as volunteer club progress, as this takes into account multiple roles
// per week)
function generate_stat_total_volunteer_roles(volunteer_data) {
  var total_volunteer_roles = 0
  $.each(volunteer_data, function (role, count) {
    total_volunteer_roles += count
  })
  return {
    "display_name": "Total volunteer roles",
    "value": total_volunteer_roles
  }
}

// How many of the different volunteer roles have you done
function generate_stat_total_distinct_volunteer_roles(volunteer_data) {
  return {
    "display_name": "Total distinct volunteer roles",
    "value": Object.keys(volunteer_data).length
  }
}


function generate_stats(data) {

  // Stats need certain data to work, and as we might be presented with less
  // than a full set (for various reasons), we work out what we should, and
  // should not, calculate based on the information in hand
  var has_parkrun_results = false
  var has_volunteer_data = false
  var has_geo_data = false
  var has_user_data = false
  var has_user_data_athlete_id = false
  var has_user_data_home_parkrun = false
  var has_athlete_id = false
  var is_this_user = false
  var has_challenge_data = false
  var has_challenge_running_data = false
  var has_challenge_volunteer_data = false

  if (data["parkrun_results"] !== undefined) {
    has_parkrun_results = true
  }

  if (data["volunteer_data"] !== undefined) {
    has_volunteer_data = true
  }

  if (data["user_data"] !== undefined) {
    has_user_data = true
    if (data.user_data["athlete_number"] !== undefined) {
      has_user_data_athlete_id = true
    }
    if (data.user_data["home_parkrun_info"] !== undefined) {
      has_user_data_home_parkrun = true
    }
  }

  if (data["geo_data"] !== undefined) {
    has_geo_data = true
  }

  if (data["athlete_id"] !== undefined) {
    has_athlete_id = true
  }

  if (has_athlete_id && has_user_data_athlete_id) {
    if (data.user_data.athlete_number == data.athlete_id) {
      is_this_user = true
    }
  }

  if (data.challenge_data) {
    has_challenge_data = true
    if (data.challenge_data.running_results) {
      has_challenge_running_data = true
    }
    if (data.challenge_data.volunteer_results) {
      has_challenge_volunteer_data = true
    }
  }

  // console.log('Stats: '+ JSON.stringify({
  //   has_parkrun_results: has_parkrun_results,
  //   has_geo_data: has_geo_data,
  //   has_user_data: has_user_data,
  //   has_user_data_athlete_id: has_user_data_athlete_id,
  //   has_user_data_home_parkrun: has_user_data_home_parkrun,
  //   is_this_user: is_this_user
  // }))
  // console.log(data["user_data"])

  stats = {}

  // Stats that only need the list of parkruns
  if (has_parkrun_results) {
    stats['total_runs'] = generate_stat_total_runs(data.parkrun_results)
    stats['total_pbs'] = generate_stat_total_pbs(data.parkrun_results)
    stats['longest_pb_streak'] = generate_stat_longest_pb_streak(data.parkrun_results)
    stats['total_distance_ran'] = generate_stat_total_distance_ran(data.parkrun_results)
    stats['most_runs_in_a_year'] = generate_stat_most_runs_in_a_year(data.parkrun_results)
    stats['p_index'] = generate_stat_p_index(data.parkrun_results)
    stats['wilson_index'] = generate_stat_wilson_index(data.parkrun_results)
    stats['parkrun_birthday'] = generate_stat_parkrun_birthday(data.parkrun_results)
    stats['years_parkrunning'] = generate_stat_years_parkrunning(data.parkrun_results)
    stats['events_run'] = generate_stat_events_run(data.parkrun_results)
    stats['events_run_this_year'] = generate_stat_events_run_this_year(data.parkrun_results)

  }

  // Stats that need a list of parkruns, and additional geo data to determine where they are
  if (has_parkrun_results && has_geo_data) {
    stats['total_distance_travelled'] = generate_stat_total_distance_travelled(data.parkrun_results, data.geo_data)
    stats['total_countries_visited'] = generate_stat_total_countries_visited(data.parkrun_results, data.geo_data)
    stats['average_parkrun_location'] = generate_stat_average_parkrun_location(data.parkrun_results, data.geo_data)
  }

  // Stats that need the user data available, and we are on their page (i.e. has
  // to be the person who has installed the plugin)
  if (has_parkrun_results && has_geo_data && is_this_user && has_user_data_home_parkrun) {
    stats['furthest_travelled'] = generate_stat_furthest_travelled(data.parkrun_results, data.geo_data, data.user_data.home_parkrun_info)
    stats['nearest_event_not_done_yet'] = generate_stat_nearest_event_not_done_yet(data.parkrun_results, data.geo_data, data.user_data.home_parkrun_info)
  }

  // Stats based off the volunteer data
  if (has_volunteer_data) {
    stats['total_volunteer_roles'] = generate_stat_total_volunteer_roles(data.volunteer_data)
    stats['total_distinct_volunteer_roles'] = generate_stat_total_distinct_volunteer_roles(data.volunteer_data)
  }

  return stats
}

function generate_global_tourism_data(parkrun_results, geo_data) {
    // Generate essentially the same results as the regionnaire challenge all over again
    // console.log("generate_global_tourism_data()")
    var global_tourism = []

    // Mapping countries to flag image files
    var flag_map = {
        "New Zealand": "nz",
        "Australia": "au",
        "Denmark": "dk",
        "Finland": "fi",
        "France": "fr",
        "Germany": "de",
        // "Iceland"--
        "Ireland": "ie",
        "Italy": "it",
        "Malaysia": "my",
        "Canada": "ca",
        "Norway": "no",
        "Poland": "pl",
        "Russia": "ru",
        "Singapore": "sg",
        "South Africa": "za",
        "Sweden": "se",
        "UK": "gb",
        "USA": "us"
        // "Zimbabwe"--
    }

    regions = geo_data.data.regions
    events_completed_map = group_results_by_event(parkrun_results)
    sorted_region_heirachy = calculate_child_regions(regions, events_completed_map, "World")

    sorted_region_heirachy.child_regions.sort().forEach(function(top_level_country) {
        // Skip the world
        if (top_level_country.name == "World") {
            return
        }

        var country_info = {
            "name": top_level_country.name,
            "visited": false,
            "first_visited": top_level_country.first_ran_on,
            "icon": chrome.extension.getURL("/images/flags/flag-unknown.png")
        }
        // Update the icon if it exists
        if (top_level_country.name in flag_map) {
            country_info.icon = chrome.extension.getURL("/images/flags/"+flag_map[top_level_country.name]+".png")
        }

        var child_events = find_region_child_events(top_level_country)

        if (top_level_country.child_events_completed_count > 0) {
            country_info["visited"] = true
        }
        global_tourism.push(country_info)
    })
    return global_tourism
}

function find_region_child_events(region, events=[]) {
    // Add the direct child events of this region
    region.child_events.forEach(function (region_event) {
        events.push(region_event)
    })
    // Further query all the child regions of this region
    region.child_regions.forEach(function (child_region) {
        find_region_child_events(child_region, events)
    })
    return events
}

function create_data_object(params, category) {
    var o = {
        "shortname": params.shortname,
        "name": params.name,
        "help": params.help,
        "start_time": new Date(),
        "complete": false,
        "completed_on": null,
        "subparts": [],
        "subparts_completed_count": 0,
        "subparts_detail": [],
        "badge_icon": category+"-"+params.shortname
    }
    return o
}

function update_data_object(o) {
    o['stop_time'] = new Date()
    o['duration'] = o.stop_time - o.start_time
    o['subparts_count'] = o.subparts.length
    // console.log("Completed data for " + o.shortname + " in " + o['duration'] + "ms")
    return o
}

// Group all parkruns completed by event
function group_results_by_event(parkrun_results) {

    events = {}
    parkrun_results.forEach(function (parkrun_event) {
        // Create an empty list if we haven"t seen this parkrun before
        if (!(parkrun_event.name in events)) {
            events[parkrun_event.name] = []
        }
        // Append this instance to the appropriate event list
        events[parkrun_event.name].push(parkrun_event)
    });

    return events
}


function challenge_start_letters(parkrun_results, params) {

    var letters = params.data

    var o = create_data_object(params, "runner")

    // Add all the subparts to the list
    for (i=0; i<letters.length; i++) {
        // Store each one as the parts we need to do
        o.subparts.push(letters[i])
        // Create placeholders for each contributing result
        o.subparts_detail.push(null)
    }

    checked_parkruns = []

    parkrun_results.forEach(function (parkrun_event) {

        if (!(checked_parkruns.includes(parkrun_event.name))) {
            initial_letter = parkrun_event.name[0].toLowerCase()
            // Skips those parkruns that aren't going to match at all
            if (o.subparts.includes(initial_letter)) {
                // Loop through all the letters we are looking for
                for (i=0; i<o.subparts.length; i++) {
                    // Find a matching subpart that hasn't yet been filled in
                    if (o.subparts_detail[i] == null && o.subparts[i] == initial_letter) {
                        // Add the event
                        p = Object.create(parkrun_event)
                        p.subpart = initial_letter
                        p.info = p.date
                        o.subparts_detail[i] = p
                        o.subparts_completed_count += 1

                        if (o.subparts.length == o.subparts_completed_count) {
                            o.complete = true
                            o.completed_on = p.date
                        }
                        // Get out of the for loop
                        break
                    }
                }
            }

            // Lets not process this parkrun again, even if we have run it more than once
            checked_parkruns.push(parkrun_event.name)
        }
    })

    // Add in all the missing ones
    for (i=0; i< o.subparts.length; i++) {
        if (o.subparts_detail[i] == null) {
            o.subparts_detail[i] = {
                "subpart": o.subparts[i],
                "info": "-"
            }
        }
    }

    // Return an object representing this challenge
    return update_data_object(o)
}

function challenge_words(parkrun_results, params) {

    var word_array = params.data

    var o = create_data_object(params, "runner")

    // Add all the subparts to the list
    word_array.forEach(function (word) {
        // Store each one as the parts we need to do
        o.subparts.push(word.toLowerCase())
        // Create placeholders for each contributing result
        o.subparts_detail.push(null)
    })

    checked_parkruns = []

    parkrun_results.forEach(function (parkrun_event) {

        if (!(checked_parkruns.includes(parkrun_event.name))) {
            // Loop through all the words we are looking for
            for (i=0; i<o.subparts.length; i++) {
                // Find a matching subpart that hasn't yet been filled in
                if (o.subparts_detail[i] == null && parkrun_event.name.toLowerCase().indexOf(o.subparts[i]) != -1) {
                    // Add the event
                    p = Object.create(parkrun_event)
                    p.subpart = o.subparts[i]
                    p.info = p.date
                    o.subparts_detail[i] = p
                    o.subparts_completed_count += 1

                    if (o.subparts.length == o.subparts_completed_count) {
                        o.complete = true
                        o.completed_on = p.date
                    }
                    // Get out of the for loop
                    break
                }
            }


            // Lets not process this parkrun again, even if we have run it more than once
            checked_parkruns.push(parkrun_event.name)
        }
    })

    // Add in all the missing ones
    for (i=0; i< o.subparts.length; i++) {
        if (o.subparts_detail[i] == null) {
            o.subparts_detail[i] = {
                "subpart": o.subparts[i],
                "info": "-"
            }
        }
    }

    // Return an object representing this challenge
    return update_data_object(o)
}

function challenge_parkruns(parkrun_results, params) {

    var parkrun_array = params.data

    var o = create_data_object(params, "runner")

    // Add all the subparts to the list
    parkrun_array.forEach(function (parkrun_name) {
        // Store each one as the parts we need to do
        o.subparts.push(parkrun_name.toLowerCase())
        // Create placeholders for each contributing result
        o.subparts_detail.push(null)
    })

    events = group_results_by_event(parkrun_results)

    Object.keys(events).forEach(function (parkrun_name) {

        if (o.subparts.includes(parkrun_name.toLowerCase())) {
            subparts_index = o.subparts.indexOf(parkrun_name.toLowerCase())

            p = Object.create(events[parkrun_name][0])
            p.subpart = o.subparts[subparts_index]
            p.info = p.date
            o.subparts_detail[subparts_index] = p
            o.subparts_completed_count += 1

            if (o.subparts.length == o.subparts_completed_count) {
                o.complete = true
                o.completed_on = p.date
            }
        }
    })

    // Add in all the missing ones
    for (i=0; i< o.subparts.length; i++) {
        if (o.subparts_detail[i] == null) {
            o.subparts_detail[i] = {
                "subpart": o.subparts[i],
                "info": "-"
            }
        }
    }

    // Return an object representing this challenge
    return update_data_object(o)
}

// Complete x different parkruns (20 and 100 are standard)
function challenge_tourist(parkrun_results, params) {

    var count = params.data

    var o = create_data_object(params, "runner")

    distinct_parkruns_completed = {}

    // Add all the subparts to the list
    for (i=0; i<count; i++) {
        o.subparts.push("parkrun_"+i)
    }

    parkrun_results.forEach(function (parkrun_event) {
        var completed_so_far = Object.keys(distinct_parkruns_completed).length
        // Ony do the first 20
        if (completed_so_far < o.subparts.length) {
            if (!(parkrun_event.name in distinct_parkruns_completed)) {
                o.subparts_completed_count += 1
                // Add it in for the next complete subpart
                p = Object.create(parkrun_event)
                p.subpart = o.subparts_completed_count
                p.info = parkrun_event.date
                o.subparts_detail.push(p)

                distinct_parkruns_completed[parkrun_event.name] = true
            }
            if (o.subparts_completed_count == o.subparts.length) {
                o.complete = true
                o.completed_on = parkrun_event.date
            }
        }

    });

    // Work out if it is possible to have a partial completion
    if (params.shortname == "cowell-club" && o.complete == false) {
        if (o.subparts_completed_count >= 75) {
            o.partial_completion = true
            o.partial_completion_name = "Three-Quarter Cowell"
            o.partial_completion_badge_icon = "runner-three-quarter-cowell-club"
        } else if (o.subparts_completed_count >= 50) {
            o.partial_completion = true
            o.partial_completion_name = "Half Cowell"
            o.partial_completion_badge_icon = "runner-half-cowell-club"
        } else if (o.subparts_completed_count >= 25) {
            o.partial_completion = true
            o.partial_completion_name = "Quarter Cowell"
            o.partial_completion_badge_icon = "runner-quarter-cowell-club"
        }
    }

    // Return an object representing this challenge
    return update_data_object(o)
}

function challenge_stopwatch_bingo(parkrun_results, params) {

    var o = create_data_object(params, "runner")

    // Add all the subparts to the list
    for (i=0; i<60; i++) {
        number_string = i.toString()
        if (i < 10) {
            number_string = "0"+number_string
        }
        o.subparts.push(number_string)
        o.subparts_detail[number_string] = null
    }

    parkrun_results.forEach(function (parkrun_event) {
        // Take the last 2 characters of the time
        seconds = parkrun_event.time.substr(parkrun_event.time.length - 2)
        // Convert them to a number to get the index in our array
        subparts_detail_index = parseInt(seconds)
        if (o.subparts_detail[subparts_detail_index] == null) {
            o.subparts_detail[subparts_detail_index] = Object.create(parkrun_event)
            o.subparts_detail[subparts_detail_index].subpart = seconds
            o.subparts_detail[subparts_detail_index].info = parkrun_event.time
            o.subparts_completed_count += 1
            if (o.subparts.length == o.subparts_completed_count) {
                o.complete = true
                o.completed_on = parkrun_event.date
            }
        }

    });

    // Add in all the missing ones
    for (i=0; i< o.subparts_detail.length; i++) {
        if (o.subparts_detail[i] == null) {
            o.subparts_detail[i] = {
                "subpart": o.subparts[i],
                "info": "-"
            }
        }
    }

    // Return an object representing this challenge
    return update_data_object(o)
}

// Complete 100 parkruns at the same venue
function challenge_single_parkrun_count(parkrun_results, params) {

    var count = params.data

    var o = create_data_object(params, "runner")
    o.subparts = ["1"]

    parkruns_completed = {}
    max_count = 0
    max_parkrun = null

    parkrun_results.forEach(function (parkrun_event) {
        if (!(parkrun_event.name in parkruns_completed)) {
            parkruns_completed[parkrun_event.name] = {
                "name": parkrun_event.name,
                "count": 0,
                "completed": false,
                "completed_at": null,
                "subpart": count+"+"
            }
        }
        parkruns_completed[parkrun_event.name].count += 1
        if (parkruns_completed[parkrun_event.name].count > max_count) {
            max_parkrun = Object.create(parkruns_completed[parkrun_event.name])
            max_count = parkruns_completed[parkrun_event.name].count
        }
        // Mark as complete if we've hit the magic 100 at this parkrun,
        // and store some good bits of data
        if (parkruns_completed[parkrun_event.name].count == count) {
            o.complete = true
            o.subparts_completed_count += 1
            parkruns_completed[parkrun_event.name].completed = true
            parkruns_completed[parkrun_event.name].completed_at = parkrun_event.date
            if (o.completed_on == null) {
                o.completed_on = parkrun_event.date
            }
        }
    });

    if (o.complete) {
        // Return all parkrun events where the limit has been reached
        Object.keys(parkruns_completed).forEach(function (parkrun) {
            if (parkruns_completed[parkrun].completed) {
                p = parkruns_completed[parkrun]
                p.info = p.count
                o.subparts_detail.push(p)
            }
        })
    } else {
        if (max_parkrun !== null) {
            // If it isn't complete, give the biggest one so far as detail info
            max_parkrun.info = max_parkrun.count
            o.subparts_detail.push(max_parkrun)
        }
    }


    // Return an object representing this challenge
    return update_data_object(o)
}

function challenge_nyd_double(parkrun_results, params) {

    var o = create_data_object(params, "runner")
    o.subparts = ["1"]
    o.summary_text = "0"

    var previous_parkrun = null

    parkrun_results.forEach(function (parkrun_event) {
        // Take the first 6 characters of the date to get the '01/01/' part
        day_month = parkrun_event.date.substr(0, 6)

        if (previous_parkrun != null && day_month == "01/01/" && parkrun_event.date == previous_parkrun.date) {

            o.subparts_detail.push({
                "name": parkrun_event.name+" and "+previous_parkrun.name,
                "date": parkrun_event.date,
                "info": parkrun_event.date,
                "subpart": o.subparts_detail.length + 1
            })
            o.subparts_completed_count += 1
            // Mark it complete the first time it occurs
            if (!o.complete) {
                o.complete = true
                o.completed_on = parkrun_event.date
            }

        }

        previous_parkrun = parkrun_event

    });

    if (o.subparts_detail.length == 0) {
        o.subparts_detail.push({
            "subpart": o.subparts_detail.length + 1,
            "info": "-"
        })
    }

    // Change the summary to indicate number of times completed
    if (o.subparts_completed_count > 0) {
        o.summary_text = "x"+o.subparts_completed_count
    }

    // Return an object representing this challenge
    return update_data_object(o)
}

function challenge_groundhog_day(parkrun_results, params) {

    var o = create_data_object(params, "runner")
    o.subparts = ["1"]
    o.summary_text = "0"

    var previous_parkrun = null

    parkrun_results.forEach(function (parkrun_event) {

        if (previous_parkrun != null && parkrun_event.time == previous_parkrun.time && parkrun_event.name == previous_parkrun.name) {

            o.subparts_detail.push({
                "name": parkrun_event.name,
                "date": previous_parkrun.date+" and "+parkrun_event.date,
                "info": parkrun_event.time+" on "+previous_parkrun.date+" and "+parkrun_event.date,
                "subpart": o.subparts_detail.length + 1
            })
            o.subparts_completed_count += 1
            // Mark it complete the first time it occurs
            if (!o.complete) {
                o.complete = true
                o.completed_on = parkrun_event.date
            }

        }

        previous_parkrun = parkrun_event

    });

    if (o.subparts_detail.length == 0) {
        o.subparts_detail.push({
            "subpart": o.subparts_detail.length + 1,
            "info": "-"
        })
    }

    // Change the summary to indicate number of times completed
    if (o.subparts_completed_count > 0) {
        o.summary_text = "x"+o.subparts_completed_count
    }

    // Return an object representing this challenge
    return update_data_object(o)
}

function challenge_in_a_year(parkrun_results, params) {

    var count = params.data

    var o = create_data_object(params, "runner")
    o.subparts = ["1"]
    o.summary_text = "0"

    by_year = {}

    parkrun_results.forEach(function (parkrun_event) {
        // Take the first 6 characters of the date to get the '01/01/' part
        year = parkrun_event.date.substr(6, 4)

        if (!(year in by_year)) {
            by_year[year] = []
        }

        by_year[year].push(parkrun_event)

    })

    Object.keys(by_year).sort().forEach(function (year) {
        if (by_year[year].length >= count) {
            o.subparts_detail.push({
                "name": year,
                "date": year,
                "info": by_year[year].length,
                "subpart": count+"+"
            })
            o.subparts_completed_count += 1
            if (!o.complete) {
                o.complete = true
                o.completed_on = year
            }
        }
    })

    if (o.subparts_detail.length == 0) {
        o.subparts_detail.push({
            "subpart": count+"+",
            "info": "-"
        })
    }

    // Change the summary to indicate number of times completed
    if (o.subparts_completed_count > 0) {
        o.summary_text = "x"+o.subparts_completed_count
    }

    // Return an object representing this challenge
    return update_data_object(o)
}

function calculate_child_regions(regions, events_completed_map, parent_region) {

    var region_info = {
        'name': parent_region,
        "complete": false,
        "completed_on": null,
        "child_regions": [],
        "child_events": [],
        "child_events_total": 0,
        "child_events_completed": {},
        "child_events_completed_count": 0,
        "first_ran_on": null
    }

    // child_region_info = []
    if (regions[parent_region].child_region_names.length == 0) {
        // No sub regions
    } else {
        regions[parent_region].child_region_names.sort().forEach(function (region_name) {
            child_region_parkrun_info = calculate_child_regions(regions, events_completed_map, region_name)
            region_info["child_regions"].push(child_region_parkrun_info)
            region_info["child_events_total"] += child_region_parkrun_info["child_events_total"]
            region_info["child_events_completed_count"] += child_region_parkrun_info["child_events_completed_count"]
            if (region_info.first_ran_on == null ||
                (child_region_parkrun_info.first_ran_on != null &&
                    child_region_parkrun_info.first_ran_on < region_info.first_ran_on)) {
                region_info.first_ran_on = child_region_parkrun_info.first_ran_on
            }
            // child_region_info.push(child_region_parkrun_info)
        })
    }

    region_info["child_events_total"] += regions[parent_region].child_event_names.length
    if (regions[parent_region].child_event_names.length > 0) {
        regions[parent_region].child_event_names.sort().forEach(function (event_name) {
            // Work out if we have completed this parkrun
            // Lets just say yes for now
            region_info["child_events"].push(event_name)
            if (event_name in events_completed_map) {
                region_info["child_events_completed_count"] += 1
                // Add the first completed run at this event to our list
                region_info["child_events_completed"][event_name] = events_completed_map[event_name][0]
                first_run_date = events_completed_map[event_name][0].date_obj
                if (region_info.first_ran_on == null ||
                    first_run_date < region_info.first_ran_on) {
                    region_info.first_ran_on = first_run_date
                }
            }
        })
    }

    // Now that we have processed everything below, see if we have completed
    // this region
    region_info["complete"] = (region_info["child_events_completed_count"] == region_info["child_events_total"])

    return region_info

}

function generate_regionnaire_detail_info(region, depth) {
    var details = []

    prefix = Array(depth).join("- ")

    if (region["child_events_total"] > 0) {
        details.push({
                "subpart": prefix + region["name"],
                "info": region["child_events_completed_count"] + "/" + region["child_events_total"],
                "complete": region["child_events_completed_count"] == region["child_events_total"],
                "completed_on": null
        })
    }

    region["child_regions"].forEach(function(child_region) {
        sub_region_info = generate_regionnaire_detail_info(child_region, depth+1);
        sub_region_info.forEach(function (array_entry) {
            details.push(array_entry)
        })
    })

    return details
}

function challenge_by_region(parkrun_results, geo_data, params) {
    var o = create_data_object(params, "runner")
    o.summary_text = ""

    regions = geo_data.data.regions
    // Sort all of the completed parkruns by event so that we can pick out which
    // has been run, and when that was
    events_completed_map = group_results_by_event(parkrun_results)
    sorted_region_heirachy = calculate_child_regions(regions, events_completed_map, "World")
    // console.log(sorted_region_heirachy)

    o.regions = sorted_region_heirachy
    o.subparts_detail = generate_regionnaire_detail_info(sorted_region_heirachy, 0)

    // Work out of any regions have been completed
    o.subparts_detail.forEach(function (detail) {
        if (detail.complete) {
            o.subparts_completed_count += 1
            o.complete = true
        }
    })

    if (o.subparts_completed_count > 0) {
        o.summary_text = "x"+o.subparts_completed_count
    }

    // Return an object representing this challenge
    return update_data_object(o)
}
