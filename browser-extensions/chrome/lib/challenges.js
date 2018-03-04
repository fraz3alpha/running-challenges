/*
 * These functions provide a way to generate the data relating to challenge
 * based on the results provided to them. This includes if the challenge
 * is complete, how many subparts there are, and how far you have to go etc..
 */

function challenge_generate_data(results) {
    return {
        "tourist": challenge_tourist(results, "tourist", "Tourist", 20),
        "cowell-club": challenge_tourist(results, "cowell-club", "Cowell Club", 100),
        "alphabeteer": challenge_start_letters(results, "alphabeteer", "Alphabeteer", "abcdefghijklmnopqrstuvwxyz"),
        "fiver": challenge_single_parkrun_count(results, "fiver", "Fiver", 5),
        "tenner": challenge_single_parkrun_count(results, "tenner", "Tenner", 10),
        "single-ton": challenge_single_parkrun_count(results, "single_ton", "Single-Ton", 100),
        "double-ton": challenge_single_parkrun_count(results, "double_ton", "Double-Ton", 200),
        "stopwatch-bingo": challenge_stopwatch_bingo(results),
        "pirates": challenge_start_letters(results, "pirates", "Pirates!", "cccccccr"),
        "stayin-alive": challenge_start_letters(results, "stayin-alive", "Stayin' Alive", "bbbggg"),
        "quick-brown-fox": challenge_start_letters(results, "quick-brown-fix", "The Quick Brown Fox", "thequickbrownfoxjumpsoverthelazydog"),
        "compass-club": challenge_words(results, "compass-club", "Compass Club", ["north","south","east","west"]),
        "full-ponty": challenge_parkruns(results, "full-ponty", "The Full Ponty", ["Pontefract","Pontypool","Pontypridd"]),
        "pilgrimage": challenge_parkruns(results, "pilgrimage", "Bushy Pilgrimage", ["Bushy Park"]),
        "nyd-double": challenge_nyd_double(results),
        "double-time": challenge_double_time(results),
        "obsessive-gold": challenge_in_a_year(results, "obsessive-gold", "Gold Level Obsessive", 50),
        "obsessive-silver": challenge_in_a_year(results, "obsessive-silver", "Silver Level Obsessive", 40),
        "obsessive-bronze": challenge_in_a_year(results, "obsessive-bronze", "Bronze Level Obsessive", 30),
    }
}

function challenge_start_letters(results, shortname, longname, letters) {
    complete = false
    completed_on = null
    subparts = []
    subparts_completed_count = 0
    subparts_detail = []

    // Add all the subparts to the list
    for (i=0; i<letters.length; i++) {
        // Store each one as the parts we need to do
        subparts.push(letters[i])
        // Create placeholders for each contributing result
        subparts_detail.push(null)
    }

    checked_parkruns = []

    results.parkruns_completed.forEach(function (parkrun_event) {

        if (!(checked_parkruns.includes(parkrun_event.name))) {
            initial_letter = parkrun_event.name[0].toLowerCase()
            // Skips those parkruns that aren't going to match at all
            if (subparts.includes(initial_letter)) {
                // Loop through all the letters we are looking for
                for (i=0; i<subparts.length; i++) {
                    // Find a matching subpart that hasn't yet been filled in
                    if (subparts_detail[i] == null && subparts[i] == initial_letter) {
                        // Add the event
                        p = Object.create(parkrun_event)
                        p.subpart = initial_letter
                        p.info = p.date
                        subparts_detail[i] = p
                        subparts_completed_count += 1

                        if (subparts.length == subparts_completed_count) {
                            complete = true
                            completed_on = p.date
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
    for (i=0; i< subparts.length; i++) {
        if (subparts_detail[i] == null) {
            subparts_detail[i] = {
                "subpart": subparts[i],
                "info": "-"
            }
        }
    }

    // Return an object representing this challenge
    return {
        "shortname": shortname,
        "name": longname,
        "complete": complete,
        "completed_on": completed_on,
        "subparts": subparts,
        "subparts_count": subparts.length,
        "subparts_detail": subparts_detail,
        "subparts_completed_count": subparts_completed_count
    }
}

function challenge_words(results, shortname, longname, word_array) {
    complete = false
    completed_on = null
    subparts = []
    subparts_completed_count = 0
    subparts_detail = []

    // Add all the subparts to the list
    word_array.forEach(function (word) {
        // Store each one as the parts we need to do
        subparts.push(word.toLowerCase())
        // Create placeholders for each contributing result
        subparts_detail.push(null)
    })

    checked_parkruns = []

    results.parkruns_completed.forEach(function (parkrun_event) {

        if (!(checked_parkruns.includes(parkrun_event.name))) {
            // Loop through all the words we are looking for
            for (i=0; i<subparts.length; i++) {
                // Find a matching subpart that hasn't yet been filled in
                if (subparts_detail[i] == null && parkrun_event.name.toLowerCase().indexOf(subparts[i]) != -1) {
                    // Add the event
                    p = Object.create(parkrun_event)
                    p.subpart = subparts[i]
                    p.info = p.date
                    subparts_detail[i] = p
                    subparts_completed_count += 1

                    if (subparts.length == subparts_completed_count) {
                        complete = true
                        completed_on = p.date
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
    for (i=0; i< subparts.length; i++) {
        if (subparts_detail[i] == null) {
            subparts_detail[i] = {
                "subpart": subparts[i],
                "info": "-"
            }
        }
    }

    // Return an object representing this challenge
    return {
        "shortname": shortname,
        "name": longname,
        "complete": complete,
        "completed_on": completed_on,
        "subparts": subparts,
        "subparts_count": subparts.length,
        "subparts_detail": subparts_detail,
        "subparts_completed_count": subparts_completed_count
    }
}

function challenge_parkruns(results, shortname, longname, parkrun_array) {
    complete = false
    completed_on = null
    subparts = []
    subparts_completed_count = 0
    subparts_detail = []

    // Add all the subparts to the list
    parkrun_array.forEach(function (parkrun_name) {
        // Store each one as the parts we need to do
        subparts.push(parkrun_name.toLowerCase())
        // Create placeholders for each contributing result
        subparts_detail.push(null)
    })

    events = group_results_by_event(results)

    Object.keys(events).forEach(function (parkrun_name) {

        if (subparts.includes(parkrun_name.toLowerCase())) {
            subparts_index = subparts.indexOf(parkrun_name.toLowerCase())

            p = Object.create(events[parkrun_name][0])
            p.subpart = subparts[subparts_index]
            p.info = p.date
            subparts_detail[subparts_index] = p
            subparts_completed_count += 1

            if (subparts.length == subparts_completed_count) {
                complete = true
                completed_on = p.date
            }
        }
    })

    // Add in all the missing ones
    for (i=0; i< subparts.length; i++) {
        if (subparts_detail[i] == null) {
            subparts_detail[i] = {
                "subpart": subparts[i],
                "info": "-"
            }
        }
    }

    // Return an object representing this challenge
    return {
        "shortname": shortname,
        "name": longname,
        "complete": complete,
        "completed_on": completed_on,
        "subparts": subparts,
        "subparts_count": subparts.length,
        "subparts_detail": subparts_detail,
        "subparts_completed_count": subparts_completed_count
    }
}

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

// Complete x different parkruns (20 and 100 are standard)
function challenge_tourist(results, shortname, longname, count) {
    complete = false
    completed_on = null
    subparts = []
    subparts_completed_count = 0
    subparts_detail = []
    include_missing = false

    distinct_parkruns_completed = {}

    // Add all the subparts to the list
    for (i=0; i<count; i++) {
        subparts.push("parkrun_"+i)
    }

    results.parkruns_completed.forEach(function (parkrun_event) {
        var completed_so_far = Object.keys(distinct_parkruns_completed).length
        // Ony do the first 20
        if (completed_so_far < subparts.length) {
            if (!(parkrun_event.name in distinct_parkruns_completed)) {
                subparts_completed_count += 1
                // Add it in for the next complete subpart
                p = Object.create(parkrun_event)
                p.subpart = subparts_completed_count
                p.info = parkrun_event.date
                subparts_detail.push(p)

                distinct_parkruns_completed[parkrun_event.name] = true
            }
            if (subparts_completed_count == subparts.length) {
                complete = true
                completed_on = parkrun_event.date
            }
        }

    });

    // Return an object representing this challenge
    return {
        "shortname": shortname,
        "name": longname,
        "complete": complete,
        "completed_on": completed_on,
        "subparts": subparts,
        "subparts_count": subparts.length,
        "subparts_detail": subparts_detail,
        "subparts_completed_count": subparts_completed_count,
    }
}

function challenge_stopwatch_bingo(results) {
    shortname = "stopwatch-bingo"
    longname = "Stopwatch Bingo"
    complete = false
    completed_on = null
    subparts = []
    subparts_completed_count = 0
    subparts_detail = []
    include_missing = true

    // Add all the subparts to the list
    for (i=0; i<60; i++) {
        number_string = i.toString()
        if (i < 10) {
            number_string = "0"+number_string
        }
        subparts.push(number_string)
        subparts_detail[number_string] = null
    }

    results.parkruns_completed.forEach(function (parkrun_event) {
        // Take the last 2 characters of the time
        seconds = parkrun_event.time.substr(parkrun_event.time.length - 2)
        // Convert them to a number to get the index in our array
        subparts_detail_index = parseInt(seconds)
        if (subparts_detail[subparts_detail_index] == null) {
            subparts_detail[subparts_detail_index] = Object.create(parkrun_event)
            subparts_detail[subparts_detail_index].subpart = seconds
            subparts_detail[subparts_detail_index].info = parkrun_event.time
            subparts_completed_count += 1
            if (subparts.length == subparts_completed_count) {
                complete = true
                completed_on = parkrun_event.date
            }
        }

    });

    // Add in all the missing ones
    for (i=0; i< subparts_detail.length; i++) {
        if (subparts_detail[i] == null) {
            subparts_detail[i] = {
                "subpart": subparts[i],
                "info": "-"
            }
        }
    }

    // Return an object representing this challenge
    return {
        "shortname": shortname,
        "name": longname,
        "complete": complete,
        "completed_on": completed_on,
        "subparts": subparts,
        "subparts_count": subparts.length,
        "subparts_detail": subparts_detail,
        "subparts_completed_count": subparts_completed_count
    }
}

// Complete 100 parkruns at the same venue
function challenge_single_parkrun_count(results, shortname, longname, count) {
    complete = false
    completed_on = null
    subparts = ["1"]
    subparts_completed_count = 0
    subparts_detail = []

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
            complete = true
            subparts_completed_count += 1
            parkruns_completed[parkrun_event.name].completed = true
            parkruns_completed[parkrun_event.name].completed_at = parkrun_event.date
            if (completed_on == null) {
                completed_on = parkrun_event.date
            }
        }
    });

    if (complete) {
        // Return all parkrun events where the limit has been reached
        Object.keys(parkruns_completed).forEach(function (parkrun) {
            if (parkruns_completed[parkrun].completed) {
                p = parkruns_completed[parkrun]
                p.info = p.count
                subparts_detail.push(p)
            }
        })
    } else {
        // If it isn't complete, give the biggest one so far as detail info
        max_parkrun.info = max_parkrun.count
        subparts_detail.push(max_parkrun)
    }


    // Return an object representing this challenge
    return {
        "shortname": shortname,
        "name": longname,
        "complete": complete,
        "completed_on": completed_on,
        "subparts": subparts,
        "subparts_count": subparts.length,
        "subparts_completed_count": subparts_completed_count,
        "subparts_detail": subparts_detail,
    }
}

function challenge_nyd_double(results) {
    shortname = "nyd_double"
    longname = "NYD Double"
    complete = false
    completed_on = null
    subparts = ["1"]
    subparts_completed_count = 0
    subparts_detail = []

    var previous_parkrun = null

    results.parkruns_completed.forEach(function (parkrun_event) {
        // Take the first 6 characters of the date to get the '01/01/' part
        day_month = parkrun_event.date.substr(0, 6)

        if (previous_parkrun != null && day_month == "01/01/" && parkrun_event.date == previous_parkrun.date) {

            subparts_detail.push({
                "name": parkrun_event.name+" and "+previous_parkrun.name,
                "date": parkrun_event.date,
                "info": parkrun_event.date,
                "subpart": subparts_detail.length + 1
            })
            subparts_completed_count += 1
            // Mark it complete the first time it occurs
            if (!complete) {
                complete = true
                completed_on = parkrun_event.date
            }

        }

        previous_parkrun = parkrun_event

    });

    if (subparts_detail.length == 0) {
        subparts_detail.push({
            "subpart": subparts_detail.length + 1,
            "info": "-"
        })
    }

    // Return an object representing this challenge
    return {
        "shortname": shortname,
        "name": longname,
        "complete": complete,
        "completed_on": completed_on,
        "subparts": subparts,
        "subparts_count": subparts.length,
        "subparts_detail": subparts_detail,
        "subparts_completed_count": subparts_completed_count
    }
}

function challenge_double_time(results) {
    shortname = "double_time"
    longname = "Double Time"
    var complete = false
    var completed_on = null
    subparts = ["1"]
    subparts_completed_count = 0
    subparts_detail = []

    var previous_parkrun = null

    results.parkruns_completed.forEach(function (parkrun_event) {

        if (previous_parkrun != null && parkrun_event.time == previous_parkrun.time && parkrun_event.name == previous_parkrun.name) {

            subparts_detail.push({
                "name": parkrun_event.name,
                "date": previous_parkrun.date+" and "+parkrun_event.date,
                "info": parkrun_event.time+" on "+previous_parkrun.date+" and "+parkrun_event.date,
                "subpart": subparts_detail.length + 1
            })
            subparts_completed_count += 1
            // Mark it complete the first time it occurs
            if (!complete) {
                complete = true
                completed_on = parkrun_event.date
            }

        }

        previous_parkrun = parkrun_event

    });

    if (subparts_detail.length == 0) {
        subparts_detail.push({
            "subpart": subparts_detail.length + 1,
            "info": "-"
        })
    }

    // Return an object representing this challenge
    return {
        "shortname": shortname,
        "name": longname,
        "complete": complete,
        "completed_on": completed_on,
        "subparts": subparts,
        "subparts_count": subparts.length,
        "subparts_detail": subparts_detail,
        "subparts_completed_count": subparts_completed_count
    }
}

function challenge_in_a_year(results, shortname, longname, count) {
    complete = false
    completed_on = null
    subparts = ["1"]
    subparts_completed_count = 0
    subparts_detail = []

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
            subparts_detail.push({
                "name": year,
                "date": year,
                "info": by_year[year].length,
                "subpart": count+"+"
            })
            subparts_completed_count += 1
            if (!complete) {
                complete = true
                completed_on = year
            }
        }
    })

    if (subparts_detail.length == 0) {
        subparts_detail.push({
            "subpart": count+"+",
            "info": "-"
        })
    }

    // Return an object representing this challenge
    return {
        "shortname": shortname,
        "name": longname,
        "complete": complete,
        "completed_on": completed_on,
        "subparts": subparts,
        "subparts_count": subparts.length,
        "subparts_detail": subparts_detail,
        "subparts_completed_count": subparts_completed_count
    }
}
