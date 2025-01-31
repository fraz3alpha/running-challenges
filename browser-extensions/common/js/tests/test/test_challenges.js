// If we just imported the challenges library, it would be assumed to be a normal nodejs library, 
// and have some functions exposed via exports. ... , however, we don't have any of this.
// If we did want to add it, we'd have to do something along the lines of:
//
// https://stackoverflow.com/questions/10204021/how-do-i-test-normal-non-node-specific-javascript-functions-with-mocha
// Export this as a library we're running under Node, 
// if (typeof exports !== 'undefined') {
//   exports.generate_stat_events_run = generate_stat_events_run;
//   ...
// }
//
// ... for every function.
// 
// However, there is a library called rewire that you could use to expose additional internal Javascript 
// functions so that they can be tested, as described in :
// https://stackoverflow.com/questions/22097603/unit-testing-of-private-functions-with-mocha-and-node-js
// We can additionally use this to test all functions - and skip the hoop-jumping of exporting a function
// just for this testing framework.
//
// For this to work, we need to find each function we want to test, but that is just a one-liner in each
// section

// Try and get jquery imported, as per https://gist.github.com/robballou/9ee108758dc5e0e2d028
const { JSDOM } = require('jsdom');
const jsdom = new JSDOM('<html/>');

const { window } = jsdom;
const { document } = window;
global.window = window;
global.document = document;

const $ = global.jQuery = require('../../../../../js/lib/third-party/jquery/jquery-3.6.0.js');
// It needs to be set globally, as per this solution: https://stackoverflow.com/a/57292683
global.$ = $

var rewire = require('rewire')
var challenges = rewire('../../lib/challenges.js')

var assert = require('assert');

// challenges.generate_stat_events_run()

// Functions to add events

function getGeoData() {
    const data = {
        "events": {
            "Bushy Park": {
                shortname: "bushy",
                name: "Bushy Park",
                country_id: 97,
                country_name: "UK",
                id: 1,
                lat: 51.410992,
                lon: -0.335791
            },
            "Winchester": {
                shortname: "winchester",
                name: "Winchester",
                country_id: 97,
                country_name: "UK",
                id: 280,
                lat: 51.069286,
                lon: -1.310849
            },
            "Fell Foot": {
                shortname: "fellfoot",
                name: "Fell Foot",
                country_id: 97,
                country_name: "UK",
                id: 1017,
                lat: 54.274736,
                lon: -2.952259
            }
        },
        "countries": {
            "UK": {
                id: "97",
                name: "UK",
                lat: 54.672276,
                lon: -2.9478825,
                bounds: [-7.643103, 49.186471, 1.747338, 60.158081],
                url: "www.parkrun.org.uk",
                child_event_ids: [1, 280, 1017],
                child_event_names: ["Bushy Park", "Winchester", "Fell Foot"]
            }
        },
        "event_status": {}
    }

    return {
        "data": data
    }
}

function filterGeoData(geoData, filters) {
    // Possible Filters are:
    // "countries": [] (list of countries to leave in)
    // "events": [] (list of event names to leave in)

    // Create a deep copy of the input data
    newGeoData = JSON.parse(JSON.stringify(geoData))

    if (filters.countries !== undefined) {
        // Remove countries that are not in the list provided
        Object.keys(newGeoData.data.countries).forEach(function(countryName){
            if (!(filters.countries.includes(countryName))) {
                delete newGeoData.data.countries[countryName]
            }
        })
    } 
    if (filters.events !== undefined) {
        // Remove events that are not in the list provided
        Object.keys(newGeoData.data.events).forEach(function(eventName){
            if (!(filters.events.includes(eventName))) {
                delete newGeoData.data.events[eventName]
            }
        })
    }

    return newGeoData
}

function getParkrunEventInfo(parkrunName) {
    parkrunEventInfo = getGeoData().data.events[parkrunName]
    return parkrunEventInfo
}

// Functions to create dummy parkrun event results

var lastDateUsed = undefined
function getNextParkrunDate() {

}

function createParkrunResult(specificData) {
    parkrunResult = {
        name: "Fell Foot",
        eventlink: "<a href\"https://www.parkrun.org.uk/fellfoot/results\">Fell Foot</a>",
        date: "22/11/2014",
        datelink: "<a href=\"http://www.parkrun.org.uk/fellfoot/results/weeklyresults?runSeqNumber=6\">22/11/2014</a>",
        date_obj: new Date("Sat Nov 22 2014 00:00:00 GMT+0000"),
        event_number: "6",
        position: "44",
        time: "26:19",
        pb: false
    }
    // If we have been given a name, find it in the geodata
    if (specificData.name !== undefined) {
        parkrunResult.name = specificData.name
    }
    return parkrunResult
}

var geoData = getGeoData()

describe("challenges.js", function() {

    describe("stats", function() {

        describe("generate_stat_furthest_travelled", function() {

            // Use the special '__get__' accessor to get your private function.
            var generate_stat_furthest_travelled = challenges.__get__('generate_stat_furthest_travelled');

            it('should return "None" if no events have been run', function() {
                var parkrunResults = []
                var homeParkrun = getParkrunEventInfo("Winchester")
                var r = generate_stat_furthest_travelled(parkrunResults, geoData, homeParkrun)
                assert.equal(r.value, "None")
                assert.equal(r.url, undefined)
            })

            it('should return the only parkrun done if they have only done one, and it is their home run', function() {
                var parkrunResults = [
                    createParkrunResult({name: "Winchester"})
                ]
                var homeParkrun = getParkrunEventInfo("Winchester")
                var r = generate_stat_furthest_travelled(parkrunResults, geoData, homeParkrun)
                assert.equal(r.value, "Winchester, UK")
                assert.equal(r.url, "https://www.parkrun.org.uk/winchester")
            })

            it('should return the only parkrun done if they have only done one, and it is not their home run', function() {
                var parkrunResults = [
                    createParkrunResult({name: "Bushy Park"})
                ]
                var homeParkrun = getParkrunEventInfo("Winchester")
                var r = generate_stat_furthest_travelled(parkrunResults, geoData, homeParkrun)
                assert.equal(r.value, "Bushy Park, UK")
                assert.equal(r.url, "https://www.parkrun.org.uk/bushy")
            })

            it('should return "Unknown" if none of the parkruns they have done have a known location', function() {
                var parkrunResults = [
                    createParkrunResult({name: "A Closed Parkrun"})
                ]
                var homeParkrun = getParkrunEventInfo("Winchester")
                var r = generate_stat_furthest_travelled(parkrunResults, geoData, homeParkrun)
                assert.equal(r.value, "Unknown")
                assert.equal(r.url, undefined)
            })

            it('should return the only parkrun event done if they have only been to one place, but been there multiple times', function() {
                var parkrunResults = [
                    createParkrunResult({name: "Winchester"}),
                    createParkrunResult({name: "Winchester"})
                ]
                var homeParkrun = getParkrunEventInfo("Bushy Park")
                var r = generate_stat_furthest_travelled(parkrunResults, geoData, homeParkrun)
                assert.equal(r.value, "Winchester, UK")
                assert.equal(r.url, "https://www.parkrun.org.uk/winchester")
            })

            it('should return the correct parkrun event in a list of mixed events', function() {
                var parkrunResults = [
                    createParkrunResult({name: "Fell Foot"}),
                    createParkrunResult({name: "Winchester"}),
                    createParkrunResult({name: "Bushy Park"})
                ]
                var homeParkrun = getParkrunEventInfo("Bushy Park")
                var r = generate_stat_furthest_travelled(parkrunResults, geoData, homeParkrun)
                assert.equal(r.value, "Fell Foot, UK")
                assert.equal(r.url, "https://www.parkrun.org.uk/fellfoot")
            })
        })

        describe("generate_stat_nearest_event_not_done_yet", function() {

            // Use the special '__get__' accessor to get your private function.
            var generate_stat_nearest_event_not_done_yet = challenges.__get__('generate_stat_nearest_event_not_done_yet');

            it("should return the home parkrun if you haven't run any events", function() {
                var parkrunResults = []
                var homeParkrun = getParkrunEventInfo("Winchester")
                var r = generate_stat_nearest_event_not_done_yet(parkrunResults, geoData, homeParkrun)
                assert.equal(r.value, "Winchester, UK - 0km away")
                assert.equal(r.url, "https://www.parkrun.org.uk/winchester")
            })

            it("should return Bushy Park if the home run is Winchester, which has been run", function() {
                var parkrunResults = [
                    createParkrunResult({name: "Winchester"})
                ]
                var homeParkrun = getParkrunEventInfo("Winchester")
                var filteredGeoData = filterGeoData(geoData, {"events": ["Bushy Park", "Winchester"]})
                var r = generate_stat_nearest_event_not_done_yet(parkrunResults, filteredGeoData, homeParkrun)
                assert.equal(r.value, "Bushy Park, UK - 78km away")
                assert.equal(r.url, "https://www.parkrun.org.uk/bushy")
            })
            
            it("should say \"No more events available\" if you have done all events", function() {
                var parkrunResults = [
                    createParkrunResult({name: "Winchester"}),
                    createParkrunResult({name: "Bushy Park"})
                ]
                var homeParkrun = getParkrunEventInfo("Winchester")
                var filteredGeoData = filterGeoData(geoData, {"events": ["Bushy Park", "Winchester"]})
                var r = generate_stat_nearest_event_not_done_yet(parkrunResults, filteredGeoData, homeParkrun)
                assert.equal(r.value, "No more events available")
                assert.equal(r.url, undefined)
            })

        })

        describe("generate_stat_average_parkrun_event", function() {

            // Use the special '__get__' accessor to get your private function.
            var generate_stat_average_parkrun_event = challenges.__get__('generate_stat_average_parkrun_event');

            it("should return \"None\" if you haven't run any events", function() {
                var parkrunResults = []
                var r = generate_stat_average_parkrun_event(parkrunResults, geoData)
                assert.equal(r.value, "None")
                assert.equal(r.url, undefined)
            })

            it("should return \"Winchester\" if you have only run at Winchester once", function() {
                var parkrunResults = [
                    createParkrunResult({name: "Winchester"})
                ]
                var r = generate_stat_average_parkrun_event(parkrunResults, geoData)
                assert.equal(r.value, "Winchester")
                assert.equal(r.url, "https://www.parkrun.org.uk/winchester")
            })
            
            it("should return \"Winchester\" if you have only run there Winchester, but been there multiple times", function() {
                var parkrunResults = [
                    createParkrunResult({name: "Winchester"}),
                    createParkrunResult({name: "Winchester"}),
                    createParkrunResult({name: "Winchester"})
                ]
                var r = generate_stat_average_parkrun_event(parkrunResults, geoData)
                assert.equal(r.value, "Winchester")
                assert.equal(r.url, "https://www.parkrun.org.uk/winchester")
            })

            it("should return \"Bushy Park\" if you have run there most often", function() {
                var parkrunResults = [
                    createParkrunResult({name: "Bushy Park"}),
                    createParkrunResult({name: "Bushy Park"}),
                    createParkrunResult({name: "Winchester"})
                ]
                // Filter the events to just Bushy Park and Winchester so that we definitely know which it will pick
                var filteredGeoData = filterGeoData(geoData, {"events": ["Bushy Park", "Winchester"]})
                var r = generate_stat_average_parkrun_event(parkrunResults, filteredGeoData)
                assert.equal(r.value, "Bushy Park")
                assert.equal(r.url, "https://www.parkrun.org.uk/bushy")
            })

        })

    })

    describe("challenges", function() {

        describe("challenge_name_badge", function() {

            // Use the special '__get__' accessor to get your private function.
            var challenge_name_badge = challenges.__get__('challenge_name_badge');

            // A simple testcase we can work with
            var parkrunResults = []

            var data = {
                "parkrun_results": parkrunResults,
                "geo_data": filterGeoData(geoData, {"events": ["Bushy Park", "Winchester"]})
            }

            // Seems a bit odd we have to call it like this, we should probably refactor it to 
            // only take the athlete name data
            var r = challenge_name_badge(data, {
                "shortname": "name-badge",
                "name": "Name Badge",
                "data": {
                    "name": "andrew TAYLOR"
                }
            })

            it("shouldn't give the badge if no events have been run", function() {
                // With the data above, we should not have completed this challenge as we haven't run any events
                assert.equal(r.complete, false)
            })

            it("should set the number of subparts the the number of achieveable letters", function() {
                // For ANDREW TAYLOR we have only got a reference to WINCHESTER that matches
                assert.equal(r.subparts_count, 1)
            })

            it("should give the badge if all letters are available and have been run", function() {
                // Call it again with a name that matches the events we have run
                var r = challenge_name_badge(
                {
                    "parkrun_results": [
                        createParkrunResult({name: "Winchester"}),
                        createParkrunResult({name: "Bushy Park"}),
                    ],
                    "geo_data": filterGeoData(geoData, {"events": ["Bushy Park", "Winchester"]})
                }, {
                    "shortname": "name-badge",
                    "name": "Name Badge",
                    "data": {
                        "name": "b w"
                    }
                })
                assert.equal(r.subparts_count, 2)
                assert.equal(r.subparts_completed_count, 2)
                assert.equal(r.complete, true)

            })
            it("should give the badge if not all letters are available, but those are have been run", function() {
                // Call it again with a name that matches the events we have run
                var r = challenge_name_badge(
                    {
                        "parkrun_results": [
                            createParkrunResult({name: "Winchester"}),
                            createParkrunResult({name: "Bushy Park"}),
                        ],
                        "geo_data": filterGeoData(geoData, {"events": ["Bushy Park", "Winchester"]})
                    }, {
                        "shortname": "name-badge",
                        "name": "Name Badge",
                        "data": {
                            "name": "b w-abcdefgh"
                        }
                    })
                assert.equal(r.subparts_count, 2)
                assert.equal(r.subparts_completed_count, 2)
                assert.equal(r.complete, true)
            })
 
            it("shouldn't give the badge if too few events have been run", function() {
                // Call it again with a name that matches the events we have run
                var r = challenge_name_badge(
                    {
                        "parkrun_results": [
                            createParkrunResult({name: "Winchester"}),
                        ],
                        "geo_data": filterGeoData(geoData, {"events": ["Bushy Park", "Winchester"]})
                    }, {
                        "shortname": "name-badge",
                        "name": "Name Badge",
                        "data": {
                            "name": "b wabcdefgh"
                        }
                    })
                assert.equal(r.subparts_count, 2)
                assert.equal(r.subparts_completed_count, 1)
                assert.equal(r.complete, false)
            })

            it("shouldn't give the badge if no letters in the name match parkrun events", function() {
                // Call it again with a name that matches the events we have run
                var r = challenge_name_badge(
                    {
                        "parkrun_results": [
                            createParkrunResult({name: "Winchester"}),
                        ],
                        "geo_data": filterGeoData(geoData, {"events": ["Bushy Park", "Winchester"]})
                    }, {
                        "shortname": "name-badge",
                        "name": "Name Badge",
                        "data": {
                            "name": "cde fgh"
                        }
                    })
                assert.equal(r.subparts_count, 0)
                assert.equal(r.subparts_completed_count, 0)
                assert.equal(r.complete, false)
            })
            it("should handle being given names with hyphens in", function() {
                // Call it again with a name that matches the events we have run
                var r = challenge_name_badge(
                    {
                        "parkrun_results": [
                            createParkrunResult({name: "Winchester"}),
                            createParkrunResult({name: "Bushy Park"}),
                        ],
                        "geo_data": filterGeoData(geoData, {"events": ["Bushy Park", "Winchester"]})
                    }, {
                        "shortname": "name-badge",
                        "name": "Name Badge",
                        "data": {
                            "name": "b w-h"
                        }
                    })
                assert.equal(r.subparts_count, 2)
                assert.equal(r.subparts_completed_count, 2)
                assert.equal(r.complete, true)
            })
            it("should handle Japanese names being passed in, but won't get the badge", function() {
                var r = challenge_name_badge(
                    {
                        "parkrun_results": [
                            createParkrunResult({name: "Winchester"}),
                            createParkrunResult({name: "Bushy Park"}),
                        ],
                        "geo_data": filterGeoData(geoData, {"events": ["Bushy Park", "Winchester"]})
                    }, {
                        "shortname": "name-badge",
                        "name": "Name Badge",
                        "data": {
                            "name": "和輝 遠藤"
                        }
                    })
                assert.equal(r.subparts_count, 0)
                assert.equal(r.subparts_completed_count, 0)
                assert.equal(r.complete, false)
            })

        })

    })

})