/*
 * These functions provide a way to generate the data relating to challenge
 * based on the results provided to them. This includes if the challenge
 * is complete, how many subparts there are, and how far you have to go etc..
 */

function challenge_generate_data(results) {
    return [
        challenge_tourist(results, {"shortname": "tourist", "name": "Tourist", "data": 20, "help": "Run at 20+ different parkrun locations anywhere in the world."}),
        challenge_tourist(results, {"shortname": "cowell-club", "name": "Cowell Club", "data": 100, "help": "Run at 100+ different parkrun locations anywhere in the world. Named after the first parkrunners to complete it. A quarter cowell is available at 25, half at 50, and three-quarter at 75."}),
        challenge_start_letters(results, {"shortname": "alphabeteer", "name": "Alphabeteer", "data": "abcdefghijklmnopqrstuvwyz", "help": "Run at parkrun locations starting with each letter of the English alphabet (except X)."}),
        challenge_single_parkrun_count(results, {"shortname": "single-ton", "name": "Single-Ton", "data": 100, "help": "Run 100+ parkruns at the same location."}),
        challenge_single_parkrun_count(results, {"shortname": "double-ton", "name": "Double-Ton", "data": 200, "help": "Run 200+ parkruns at the same location."}),
        challenge_stopwatch_bingo(results, {"shortname": "stopwatch-bingo", "name": "Stopwatch Bingo", "help": " Collect all the seconds from 00 to 59 in your finishing times."}), //{}, ,
        challenge_start_letters(results, {"shortname": "pirates", "name": "Pirates!", "data": "cccccccr", "help": "Run seven Cs and an R (say it out loud)."}),
        challenge_start_letters(results, {"shortname": "stayin-alive", "name": "Stayin' Alive", "data": "bbbggg", "help": "Run three Bees and three Gees."}),
        challenge_words(results, {"shortname": "compass-club", "name": "Compass Club", "data": ["north","south","east","west"], "help": " Run at a parkrun named after each of the four compass points."}),
        challenge_parkruns(results, {"shortname": "full-ponty", "name": "The Full Ponty", "data": ["Pontefract","Pontypool","Pontypridd"], "help": "Run at all the parkruns named ponty... or ponte..."}),
        challenge_parkruns(results, {"shortname": "pilgrimage", "name": "Bushy Pilgrimage", "data": ["Bushy Park"], "help": "Run at Bushy parkrun, where it all began."}),
        challenge_nyd_double(results, {"shortname": "nyd-double", "name":  "NYD Double", "help": "Run two parkruns on one New Year's Day."}), // ,
        challenge_groundhog_day(results, {"shortname": "groundhog-day", "name": "Groundhog Day", "help": "Finish with the same time at the same parkrun location on two consecutive parkruns."}), // ",
        challenge_by_region(results, {"shortname": "regionnaire", "name": "Regionnaire", "help": "Run all the parkrun locations in a geographical region."}), //,
        challenge_in_a_year(results, {"shortname": "obsessive-bronze", "name": "Bronze Level Obsessive", "data": 30, "help": " Run 30+ parkruns in one calendar year."}),
        challenge_in_a_year(results, {"shortname": "obsessive-silver", "name": "Silver Level Obsessive", "data": 40, "help": " Run 40+ parkruns in one calendar year."}),
        challenge_in_a_year(results, {"shortname": "obsessive-gold", "name": "Gold Level Obsessive", "data": 50, "help": " Run 50+ parkruns in one calendar year."})
    ]
}

function generate_volunteer_challenge_data(volunteer_data) {

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
        {"shortname": "run-report-writer", "name": "Run Report Writer"}
    ]

    var data = []

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
        data.push(this_role_data)
    })

    return data
}

function generate_global_tourism_data(results) {
    // Generate essentially the same results as the regionnaire challenge all over again
    // console.log("generate_global_tourism_data()")
    var global_tourism = []

    // Mapping countries to flag image files
    var flag_map = {
        "New Zealand": "flag-nz",
        "Australia": "flag-au",
        "Denmark": "flag-dk",
        "Finland": "flag-fi",
        "France": "flag-fra",
        "Germany": "flag-de",
        // "Iceland"--
        "Ireland": "flag-ie",
        "Italy": "flag-ita",
        // "Malaysia"--
        "Canada": "flag-ca",
        "Norway": "flag-no",
        "Poland": "flag-pl",
        "Russia": "flag-ru",
        "Singapore": "flag-sg",
        "South Africa": "flag-sa",
        "Sweden": "flag-se",
        "UK": "flag-uk",
        "USA": "flag-usa"
        // "Zimbabwe"--
    }

    // Do we have geo data available?
    geo_data = results.geo_data
    if (geo_data == null) {
        return null
    }

    regions = geo_data.data.regions
    events_completed_map = group_results_by_event(results)
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
            "icon": chrome.extension.getURL("/images/flags/png/flag-unknown.png")
        }
        // Update the icon if it exists
        if (top_level_country.name in flag_map) {
            country_info.icon = chrome.extension.getURL("/images/flags/png/"+flag_map[top_level_country.name]+".png")
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
function group_results_by_event(results) {

    events = {}
    results.parkruns_completed.forEach(function (parkrun_event) {
        // Create an empty list if we haven"t seen this parkrun before
        if (!(parkrun_event.name in events)) {
            events[parkrun_event.name] = []
        }
        // Append this instance to the appropriate event list
        events[parkrun_event.name].push(parkrun_event)
    });

    return events
}


function challenge_start_letters(results, params) {

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

    results.parkruns_completed.forEach(function (parkrun_event) {

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

function challenge_words(results, params) {

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

    results.parkruns_completed.forEach(function (parkrun_event) {

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

function challenge_parkruns(results, params) {

    var parkrun_array = params.data

    var o = create_data_object(params, "runner")

    // Add all the subparts to the list
    parkrun_array.forEach(function (parkrun_name) {
        // Store each one as the parts we need to do
        o.subparts.push(parkrun_name.toLowerCase())
        // Create placeholders for each contributing result
        o.subparts_detail.push(null)
    })

    events = group_results_by_event(results)

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
function challenge_tourist(results, params) {

    var count = params.data

    var o = create_data_object(params, "runner")

    distinct_parkruns_completed = {}

    // Add all the subparts to the list
    for (i=0; i<count; i++) {
        o.subparts.push("parkrun_"+i)
    }

    results.parkruns_completed.forEach(function (parkrun_event) {
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

function challenge_stopwatch_bingo(results, params) {

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

    results.parkruns_completed.forEach(function (parkrun_event) {
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
function challenge_single_parkrun_count(results, params) {

    var count = params.data

    var o = create_data_object(params, "runner")
    o.subparts = ["1"]

    parkruns_completed = {}
    max_count = 0
    max_parkrun = null

    results.parkruns_completed.forEach(function (parkrun_event) {
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

function challenge_nyd_double(results, params) {

    var o = create_data_object(params, "runner")
    o.subparts = ["1"]
    o.summary_text = "0"

    var previous_parkrun = null

    results.parkruns_completed.forEach(function (parkrun_event) {
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

function challenge_groundhog_day(results, params) {

    var o = create_data_object(params, "runner")
    o.subparts = ["1"]
    o.summary_text = "0"

    var previous_parkrun = null

    results.parkruns_completed.forEach(function (parkrun_event) {

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

function challenge_in_a_year(results, params) {

    var count = params.data

    var o = create_data_object(params, "runner")
    o.subparts = ["1"]
    o.summary_text = "0"

    by_year = {}

    results.parkruns_completed.forEach(function (parkrun_event) {
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

function challenge_by_region(results, params) {
    var o = create_data_object(params, "runner")
    o.summary_text = ""

    // Do we have geo data available?
    geo_data = results.geo_data
    if (geo_data == null) {
        return null
    }

    // console.log(geo_data)
    // console.log(geo_data.data)
    // console.log(geo_data.data.regions)

    regions = geo_data.data.regions
    // Sort all of the completed parkruns by event so that we can pick out which
    // has been run, and when that was
    events_completed_map = group_results_by_event(results)
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
