/*
 * These functions provide a way to generate the data relating to challenge
 * based on the results provided to them. This includes if the challenge
 * is complete, how many subparts there are, and how far you have to go etc..
 */

function challenge_generate_data(results) {
    return {
        "tourist": challenge_tourist(results),
        "alphabeteer": challenge_alphabeteer(results),
        "fiver": challenge_single_parkrun_count(results, "fiver", "Fiver", 5),
        "tenner": challenge_single_parkrun_count(results, "tenner", "Tenner", 10),
        "single-ton": challenge_single_parkrun_count(results, "single_ton", "Single-Ton", 100),
        "double-ton": challenge_single_parkrun_count(results, "double_ton", "Double-Ton", 200),
        "stopwatch-bingo": challenge_stopwatch_bingo(results)
        // "pirates": challenge_pirates(results)
    }
}

// Complete 20 different parkruns
function challenge_tourist(results) {
    shortname = "tourist"
    longname = "Tourist"
    complete = false
    completed_on = null
    subparts = []
    subparts_completed_count = 0
    subparts_detail = []
    include_missing = false

    distinct_parkruns_completed = {}

    // Add all the subparts to the list
    for (i=0; i<20; i++) {
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

function challenge_alphabeteer(results) {
    shortname = "alphabeteer"
    longname = "Alphabeteer"
    complete = false
    completed_on = null
    subparts = []
    subparts_completed_count = 0
    subparts_detail = []
    include_missing = true

    // Add all the subparts to the list
    for (i=0; i<26; i++) {
        letter = "abcdefghijklmnopqrstuvwxyz"[i]
        subparts.push(letter)
        subparts_detail[letter] = null
    }

    results.parkruns_completed.forEach(function (parkrun_event) {
        // Find the first letter of the parkrun for the alphabet challenge
        first_letter = parkrun_event.name[0].toLowerCase()
        subparts_detail_index = "abcdefghijklmnopqrstuvwxyz".indexOf(first_letter)
        if (subparts_detail_index != -1) {
            if (subparts_detail[subparts_detail_index] == null) {
                subparts_detail[subparts_detail_index] = Object.create(parkrun_event)
                subparts_detail[subparts_detail_index].subpart = first_letter
                subparts_detail[subparts_detail_index].info = parkrun_event.date
                subparts_completed_count += 1
                // Work out if this challenge has been completed by comparing the number
                // of subparts defined to the number of subparts complete
                if (subparts.length == subparts_completed_count) {
                    complete = true
                    completed_on = parkrun_event.date
                }
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
        console.log(seconds)
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
    subparts = ['1']
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

    console.log(parkruns_completed)

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

function challenge_pirates(results) {
    shortname = "pirates"
    longname = "Pirates!"
    complete = false

    return {
        "shortname": shortname,
        "name": longname,
        "complete": complete
    }
}
