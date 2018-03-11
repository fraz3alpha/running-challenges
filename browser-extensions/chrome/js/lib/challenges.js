/*
 * These functions provide a way to generate the data relating to challenge
 * based on the results provided to them. This includes if the challenge
 * is complete, how many subparts there are, and how far you have to go etc..
 */

function challenge_generate_data(results) {
    return {
        "tourist": challenge_tourist(results, "tourist", "Tourist", 20),
        "cowell-club": challenge_tourist(results, "cowell-club", "Cowell Club", 100),
        "alphabeteer": challenge_start_letters(results, "alphabeteer", "Alphabeteer", "abcdefghijklmnopqrstuvwyz"),
        // "fiver": challenge_single_parkrun_count(results, "fiver", "Fiver", 5),
        // "tenner": challenge_single_parkrun_count(results, "tenner", "Tenner", 10),
        "single-ton": challenge_single_parkrun_count(results, "single-ton", "Single-Ton", 100),
        "double-ton": challenge_single_parkrun_count(results, "double-ton", "Double-Ton", 200),
        "stopwatch-bingo": challenge_stopwatch_bingo(results),
        "pirates": challenge_start_letters(results, "pirates", "Pirates!", "cccccccr"),
        "stayin-alive": challenge_start_letters(results, "stayin-alive", "Stayin' Alive", "bbbggg"),
        // "quick-brown-fox": challenge_start_letters(results, "quick-brown-fox", "The Quick Brown Fox", "thequickbrownfoxjumpsoverthelazydog"),
        "compass-club": challenge_words(results, "compass-club", "Compass Club", ["north","south","east","west"]),
        "full-ponty": challenge_parkruns(results, "full-ponty", "The Full Ponty", ["Pontefract","Pontypool","Pontypridd"]),
        "pilgrimage": challenge_parkruns(results, "pilgrimage", "Bushy Pilgrimage", ["Bushy Park"]),
        "nyd-double": challenge_nyd_double(results),
        "groundhog-day": challenge_groundhog_day(results),
        "regionnaire": challenge_by_region(results),
        "obsessive-bronze": challenge_in_a_year(results, "obsessive-bronze", "Bronze Level Obsessive", 30),
        "obsessive-silver": challenge_in_a_year(results, "obsessive-silver", "Silver Level Obsessive", 40),
        "obsessive-gold": challenge_in_a_year(results, "obsessive-gold", "Gold Level Obsessive", 50),

    }
}

function generate_volunteer_challenge_data(volunteer_data) {

    var volunteer_roles = [
        {"shortname": "barcode-scanning", "name": "Barcode Scanning"},
        {"shortname": "close-down", "name": "Post-event Close Down"},
        {"shortname": "funnel-manager", "name": "Funnel Manager"},
        {"shortname": "manual-entry", "name": "Number Checker"},
        {"shortname": "photographer", "name": "Photographer"},
        {"shortname": "results-processing", "name": "Results Processor"},
        {"shortname": "run-director", "name": "Run Director"},
        {"shortname": "run-report-writer", "name": "Run Report Writer"},
        {"shortname": "setup", "name": "Pre-event Setup"},
        {"shortname": "finish-tokens", "name": "Finish Tokens"},
        {"shortname": "marshal", "name": "Marshal"},
        {"shortname": "token-sorting", "name": "Token Sorting"},
        {"shortname": "timer", "name": "Timekeeper", "matching-roles": ["Timekeeper", "Backup Timer"]},
        {"shortname": "tail-walker", "name": "Tail Walker"},
        {"shortname": "pacer", "name": "Pacer (5k only)"}
    ]

    var data = {}

    // Populate the results with the above
    volunteer_roles.forEach(function (role) {
        data[role.shortname] = create_data_object(role.shortname, role.name, "volunteer")
        data[role.shortname].summary_text = ""
        if (role.name in volunteer_data) {
            console.log("Completed "+role.name+" "+volunteer_data[role.name]+" times")
            data[role.shortname].subparts_completed_count = volunteer_data[role.name]
            data[role.shortname].summary_text = "x"+volunteer_data[role.name]
            data[role.shortname].complete = true
        }
        update_data_object(data[role.shortname])
    })

    return data
}


function create_data_object(shortname, longname, category) {
    var o = {
        "shortname": shortname,
        "name": longname,
        "start_time": new Date(),
        "complete": false,
        "completed_on": null,
        "subparts": [],
        "subparts_completed_count": 0,
        "subparts_detail": [],
        "badge_icon": category+"-"+shortname
    }
    return o
}

function update_data_object(o) {
    o['stop_time'] = new Date()
    o['duration'] = o.stop_time - o.start_time
    o['subparts_count'] = o.subparts.length
    console.log("Completed data for " + o.shortname + " in " + o['duration'] + "ms")
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


function challenge_start_letters(results, shortname, longname, letters) {

    var o = create_data_object(shortname, longname, "runner")

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

function challenge_words(results, shortname, longname, word_array) {

    var o = create_data_object(shortname, longname, "runner")

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

function challenge_parkruns(results, shortname, longname, parkrun_array) {

    var o = create_data_object(shortname, longname, "runner")

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
function challenge_tourist(results, shortname, longname, count) {

    var o = create_data_object(shortname, longname, "runner")

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

    // Return an object representing this challenge
    return update_data_object(o)
}

function challenge_stopwatch_bingo(results) {

    var o = create_data_object("stopwatch-bingo", "Stopwatch Bingo", "runner")

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
function challenge_single_parkrun_count(results, shortname, longname, count) {

    var o = create_data_object(shortname, longname, "runner")
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
        // If it isn't complete, give the biggest one so far as detail info
        max_parkrun.info = max_parkrun.count
        o.subparts_detail.push(max_parkrun)
    }


    // Return an object representing this challenge
    return update_data_object(o)
}

function challenge_nyd_double(results) {

    var o = create_data_object("nyd-double", "NYD Double", "runner")
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

function challenge_groundhog_day(results) {

    var o = create_data_object("groundhog-day", "Groundhog Day", "runner")
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

function challenge_in_a_year(results, shortname, longname, count) {

    var o = create_data_object(shortname, longname, "runner")
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
        "child_events_completed_count": 0
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

function challenge_by_region(results) {
    var o = create_data_object("regionnaire", "Regionnaire", "runner")
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
