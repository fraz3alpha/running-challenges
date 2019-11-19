var geo_data = null
var saved_options = {}

function initial_page_setup() {

    // Attach the save function to the 'Save' button
    $('#save').click(function() {
        save_user_configuration()
    })
    // Watch for changes to the athlete id textbox
    $('#athlete_number').bind('keyup change', function() {
        on_change_athlete_number()
    })
    // Attach the clear-cache function to the 'Update Cache' button
    $('#update_cache').click(function() {
        update_cache(true)
    })
    // Attach the handler to update the parkrun home country when the select
    // dropdown is changed
    $('#athlete_home_parkrun').change(function() {
        update_home_parkrun_country()
    })
    // Attach handler to catch when the beta checkbox is enabled, which
    // will allow us to set the extra information text
    // $('#enable_beta_features').change(function() {
    //     on_change_enable_beta_features()
    // })
    $('#enable_beta_features').hide()
    $('#enable_beta_features_label').hide()
    $('#enable_beta_features_extra_comment').hide()

    // Hide the debug elements by default, only showing them if you set the
    // athlete number to 'testing'
    show_debug_elements(false)

    // Load the user configuration so that we can display it
    load_user_configuration()

    // Fetch all the parkrun statistics so that we populate things like the
    // home parkrun dropdown, and the cache information
    update_cache()

}

function on_change_athlete_number() {
    var athlete_number = $('#athlete_number').val();
    // Special case if the contents is now 'testing', we show the hidden debug info
    if (athlete_number == 'testing') {
        show_debug_elements(true)
    } else {
        show_debug_elements(false)
    }
}

// function on_change_enable_beta_features() {
//   console.log("on_change_enable_beta_features()")
//   if ($('#enable_beta_features').prop('checked')) {
//     $('#enable_beta_features_extra_comment').show()
//   } else {
//     $('#enable_beta_features_extra_comment').hide()
//   }
// }

function show_debug_elements(visible=false) {
    // A set of element IDs that will be shown/hidden depending on whether
    // we are in a debug mode, as determined by the parameter to this function
    var debug_elements = [
        "debug_parkrun_info",
        "debug_home_parkrun_info"
    ]
    $.each(debug_elements, function(index, id) {
        // Find the element IDs and show or hide them as appropriate
        if (visible) {
            $('#'+id).show()
        } else {
            $('#'+id).hide()
        }
    })
}

function get_home_parkrun_info(parkrun_event_name) {
    // Look up extra pieces of information for this parkrun, if available
    console.log('looking up info for home parkrun '+parkrun_event_name)
    if (geo_data != null && geo_data.data != null) {
        if (parkrun_event_name in geo_data.data.events) {
            home_event_info = geo_data.data.events[parkrun_event_name]
            console.log('Found info for '+parkrun_event_name+': '+JSON.stringify(home_event_info))
            return home_event_info
        }
    }
    // Have a last check to see if we know about this from a previous lookup
    // which we loaded from disk
    if ('home_parkrun_info' in saved_options && saved_options.home_parkrun_info.name == parkrun_event_name) {
        return saved_options.home_parkrun_info
    }

    // Else return no interesting information
    return {}
}

function save_user_configuration() {
    console.log('save_user_configuration()')

    var athlete_number = $('#athlete_number').val();
    var athlete_home_parkrun = $('#athlete_home_parkrun').val();
    // var enable_beta_features_checked = $('#enable_beta_features').prop('checked');

    // Build up our information that we want to save.
    // Fetch the home parkrun info
    var saved_data = {
        athlete_number: athlete_number,
        home_parkrun_info: get_home_parkrun_info(athlete_home_parkrun),
        // enable_beta_features: enable_beta_features_checked
    }

    // Store it on the page for future use
    saved_options = saved_data
    update_home_parkrun_country()

    console.log('Saving: '+JSON.stringify(saved_data))

    browser.storage.local.set(saved_data).then(function() {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '';
        }, 750);
    });
}

function load_user_configuration() {
    console.log('load_user_configuration()')
    var restored_options = null
    browser.storage.local.get({
        athlete_number: '',
        home_parkrun_info: {},
        // enable_beta_features: false
    }).then(function(items) {
        // Store it on the page for future use
        saved_options = items
        console.log('Loaded: '+JSON.stringify(items))
        $('#athlete_number').val(items.athlete_number);
        // Update the home parkrun dropdown with the loaded value, if present
        update_home_parkrun_dropdown()
        // update_enable_beta_features_checkbox(items.enable_beta_features)

    });
}

// function update_enable_beta_features_checkbox(enabled) {
//   if (enabled) {
//     $('#enable_beta_features').prop('checked', true);
//   } else {
//     $('#enable_beta_features').prop('checked', false);
//   }
//   // Set additional display stuff as appropriate
//   on_change_enable_beta_features()
// }

function update_cache(force_update=false) {
    console.log('update_cache()')
    // Send a message to the background page to request the geo data
    browser.runtime.sendMessage({data: "geo", freshen: force_update}).then(function (response) {
        if (response !== null && 'geo' in response) {
            // Save the data on the page for future use
            geo_data = response.geo
            // Update the parts of the UI that show information relating to,
            // or based on, the geo data
            update_geo_data_stats()
            update_home_parkrun_dropdown()
        }
    });
}

function update_geo_data_stats() {
    console.log('update_geo_data_stats()')
    var s_last_update = "-"
    var s_known_regions = "0"
    var s_known_countries = "0"
    var s_known_events = "0"
    var s_geo_data_bytes = "0"

    if (geo_data !== null) {
        s_last_update = geo_data.updated;
        s_known_countries = Object.keys(geo_data.data.countries).length;
        s_known_regions = Object.keys(geo_data.data.regions).length;

        known_events_states = {}

        $.each(geo_data.data.events, function (event_name, event_info) {
            if (!(event_info.status in known_events_states)) {
                known_events_states[event_info.status] = 0
            }
            known_events_states[event_info.status] += 1
        })

        s_known_events = JSON.stringify(known_events_states);
        s_geo_data_bytes =  JSON.stringify(geo_data).length;
    }

    $('#cached_geo_updated').text(s_last_update)
    $('#cached_geo_regions').text(s_known_regions)
    $('#cached_geo_countries').text(s_known_countries)
    $('#cached_geo_events').text(s_known_events)
    $('#cached_geo_bytes').text(s_geo_data_bytes)

}

function update_home_parkrun_dropdown() {
    console.log('update_home_parkrun_dropdown()')

    var home_parkrun_select = $("#athlete_home_parkrun")

    var not_set_option = $('<option/>',
    {
        value: 'Not Set',
        text: "Not Set"
    })

    // Clear all the existing keys
    home_parkrun_select.empty()
    home_parkrun_select.append(not_set_option)

    if (geo_data !== null) {

        // Iterate over all the available events that we know about
        Object.keys(geo_data.data.events).sort().forEach(function (event_name) {
            event_o = geo_data.data.events[event_name]
            // Create a suitable option for this event
            var select_option = $('<option/>', {
                value: event_o.name
            })
            // Add a suffix to indicate if this is a new parkrun
            if (event_o.status === 'Live') {
                select_option.text(event_o.name)
            } else {
                select_option.text(event_o.name + " ("+event_o.status+")")
            }
            // Add it to the options dropdown list
            home_parkrun_select.append(select_option)
        })

        // Set the home parkrun we know about if we have it in the list, else
        // default to Not Set
        if ("name" in saved_options.home_parkrun_info) {
            home_parkrun_select.val(saved_options.home_parkrun_info.name)
        } else {
            home_parkrun_select.val('Not Set')
        }

    } else {

        // If the user has set their home parkrun already, then add it into the
        // list anyway and select that
        if ("name" in saved_options.home_parkrun_info) {
            var existing_home_parkrun_option = $('<option/>',
            {
                value: saved_options.home_parkrun_info.name,
                text: saved_options.home_parkrun_info.name
            })
            home_parkrun_select.append(existing_home_parkrun_option)
            home_parkrun_select.val(saved_options.home_parkrun_info.name)
        } else {
            home_parkrun_select.val('Not Set')
        }

    }
    update_home_parkrun_country()
}

function update_home_parkrun_country() {
    console.log('update_home_parkrun_country()')
    var h_parkrun = $("#athlete_home_parkrun").val()
    var h_parkrun_div = $("#athlete_home_country_div")

    var p_info = get_home_parkrun_info(h_parkrun)
    console.log(p_info)
    if ('country_name' in p_info) {
        h_parkrun_div.text(p_info.country_name)
    } else {
        h_parkrun_div.text("Unknown")
    }

    $("#home_parkrun_info").text(JSON.stringify(p_info, null, 4))

}

// Code to run when the document's DOM is ready
$( document ).ready(function() {
    initial_page_setup()
});
