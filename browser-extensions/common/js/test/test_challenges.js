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

const $ = global.jQuery = require('../../../../js/lib/third-party/jquery/jquery-3.3.1.js');

var rewire = require('rewire')
var challenges = rewire('../lib/challenges.js')

var assert = require('assert');

// challenges.generate_stat_events_run()

// Functions to add events

function getGeoData() {

    var data = {
        "regions": {},
        "events": {
            "Bushy Park": {
                shortname: "bushy",
                name: "Bushy Park",
                country_id: 97,
                country_name: "UK",
                id: 1,
                lat: 51.410992,
                lon: -0.335791,
                status: "Live"
            },
            "Winchester": {
                shortname: "winchester",
                name: "Winchester",
                country_id: 97,
                country_name: "UK",
                id: 280,
                lat: 51.069286,
                lon: -1.310849,
                status: "Live"
            },
            "Fell Foot": {
                shortname: "fellfoot",
                name: "Fell Foot",
                country_id: 97,
                country_name: "UK",
                id: 1017,
                lat: 54.274736,
                lon: -2.952259,
                status: "Live"
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


describe("challenges", function() {
    describe("generate_stat_furthest_travelled", function() {

        // Use the special '__get__' accessor to get your private function.
        var generate_stat_furthest_travelled = challenges.__get__('generate_stat_furthest_travelled');

        var geoData = getGeoData()

        it('should return "None" if no events have been run', function() {
            var parkrunResults = []
            var homeParkrun = getParkrunEventInfo("Winchester")
            var r = generate_stat_furthest_travelled(parkrunResults, geoData, homeParkrun)
            assert.equal(r.value, "None")
        })

        it('should return the only parkrun done if they have only done one, and it is their home run', function() {
            var parkrunResults = [
                createParkrunResult({name: "Winchester"})
            ]
            var homeParkrun = getParkrunEventInfo("Winchester")
            var r = generate_stat_furthest_travelled(parkrunResults, geoData, homeParkrun)
            assert.equal(r.value, "Winchester, UK")
        })

        it('should return the only parkrun done if they have only done one, and it is not their home run', function() {
            var parkrunResults = [
                createParkrunResult({name: "Bushy Park"})
            ]
            var homeParkrun = getParkrunEventInfo("Winchester")
            var r = generate_stat_furthest_travelled(parkrunResults, geoData, homeParkrun)
            assert.equal(r.value, "Bushy Park, UK")
        })

        it('should return "Unknown" if none of the parkruns they have done have a known location', function() {
            var parkrunResults = [
                createParkrunResult({name: "A Closed Parkrun"})
            ]
            var homeParkrun = getParkrunEventInfo("Winchester")
            var r = generate_stat_furthest_travelled(parkrunResults, geoData, homeParkrun)
            assert.equal(r.value, "Unknown")
        })

        it('should return the only parkrun event done if they have only been to one place, but been there multiple times', function() {
            var parkrunResults = [
                createParkrunResult({name: "Winchester"}),
                createParkrunResult({name: "Winchester"})
            ]
            var homeParkrun = getParkrunEventInfo("Bushy Park")
            var r = generate_stat_furthest_travelled(parkrunResults, geoData, homeParkrun)
            assert.equal(r.value, "Winchester, UK")
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
        })
    })

})