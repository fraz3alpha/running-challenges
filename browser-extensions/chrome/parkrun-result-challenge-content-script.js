
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

// Checks the table fetching function
console.log(get_table())
console.log(get_table('results'))
console.log(get_table('results', 'All Results'))

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

// Construct all the challenges
challenge_data = challenge_generate_data({
    "parkruns_completed": parkruns_completed,
    "geo_data": null,
    "geo_local_region": null,
    "home_parkrun": null
})

console.log(challenge_data)

var challenge_table = generate_challenge_table(challenge_data)
get_table('results', 'All Results').before(challenge_table)
