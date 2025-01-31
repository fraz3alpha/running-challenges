var geo_data;
var saved_options = {}

function initial_page_setup() {
    // Attach the save function to the 'Save' button
    $('#save').click(function () {
        save_user_configuration()
    })
    // Watch for changes to the athlete id textbox
    $('#athlete_number').bind('keyup change', function () {
        on_change_athlete_number()
    })
    // Attach the clear-cache function to the 'Update Cache' button
    $('#update_cache').click(function () {
        update_cache(true)
    })
    // Attach the handler to update the parkrun home country when the select
    // dropdown is changed
    $('#athlete_home_parkrun').change(function () {
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

    load_user_configuration();
}

function on_change_athlete_number() {
    show_debug_elements($('#athlete_number').val() === 'testing');
}

// function on_change_enable_beta_features() {
//   console.log("on_change_enable_beta_features()")
//   if ($('#enable_beta_features').prop('checked')) {
//     $('#enable_beta_features_extra_comment').show()
//   } else {
//     $('#enable_beta_features_extra_comment').hide()
//   }
// }

function show_debug_elements(visible = false) {
    // Toggle visibility of debug elements based on the parameter
    ["debug_parkrun_info", "debug_home_parkrun_info"].forEach(id => {
        $(`#${id}`).toggle(visible);
    });
}

function get_home_parkrun_info(parkrun_event_name) {
    // Look up extra pieces of information for this parkrun, if available
    console.log('looking up info for home parkrun ' + parkrun_event_name)
    if (geo_data != null && geo_data.data != null) {
        if (parkrun_event_name in geo_data.data.events) {
            home_event_info = geo_data.data.events[parkrun_event_name]
            console.log('Found info for ' + parkrun_event_name + ': ' + JSON.stringify(home_event_info))
            // Attempting to find country website URL
            if ("country_name" in home_event_info) {
                var country_info = geo_data.data.countries[home_event_info["country_name"]]
                if ("url" in country_info) {
                    home_event_info["local_url"] = country_info["url"]
                }
            }
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

    const athlete_number = $('#athlete_number').val();
    const athlete_home_parkrun = $('#athlete_home_parkrun').val();

    const saved_data = {
        athlete_number,
        home_parkrun_info: get_home_parkrun_info(athlete_home_parkrun, null),
    };

    saved_options = saved_data;
    update_home_parkrun_country();

    console.log(`Saving: ${JSON.stringify(saved_data)}`);

    browserAPI.storage.local.set(saved_data).then(() => {
        const status = $('#status');
        status.text('Options saved.');
        setTimeout(() => {
            status.text('');
        }, 750);
    });
}

function load_user_configuration() {
    load_data().then((data) => {
        console.log(`Loaded options: ${JSON.stringify(data, null, 2)}`);
        geo_data = data.loaded_geo_data;
        saved_options = data.loaded_user_data;

        update_geo_data_stats();
        populate_user_configuration();
    });
}

function populate_user_configuration() {
    console.log('populate_user_configuration()')
    $('#athlete_number').val(saved_options.athlete_number);
    update_home_parkrun_dropdown();
}

const NOT_SET = 'Not Set';

const NOT_SET_OPTION = {
    value: NOT_SET,
    text: NOT_SET
};

function createNotSetOption() {
    return $('<option/>', NOT_SET_OPTION);
}

function update_home_parkrun_dropdown() {
    console.log('update_home_parkrun_dropdown()');
    const home_parkrun_select = $("#athlete_home_parkrun");

    // Clear all the existing options and add the 'Not Set' option
    home_parkrun_select.empty().append(createNotSetOption());

    if (geo_data) {
        // Iterate over all the available events that we know about
        Object.keys(geo_data.data.events).sort().forEach(event_name => {
            const event_o = geo_data.data.events[event_name];
            // Create and append an option for this event
            home_parkrun_select.append($('<option/>', {
                value: event_o.name,
                text: event_o.name
            }));
        });

        // Set the home parkrun we know about if we have it in the list, else default to 'Not Set'
        home_parkrun_select.val(saved_options.home_parkrun_info.name || NOT_SET_OPTION.value);
    } else {
        // If the user has set their home parkrun already, then add it into the list anyway and select that
        if (saved_options.home_parkrun_info.name) {
            home_parkrun_select.append($('<option/>', {
                value: saved_options.home_parkrun_info.name,
                text: saved_options.home_parkrun_info.name
            })).val(saved_options.home_parkrun_info.name);
        } else {
            home_parkrun_select.val(NOT_SET_OPTION.value);
        }
    }
    update_home_parkrun_country();
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

function update_cache(force_update = true) {
    console.log('update_cache()')
    load_data(force_update).then((data) => {
        geo_data = data.loaded_geo_data;
        update_geo_data_stats();
        populate_user_configuration();
    });
}

function update_geo_data_stats() {
    console.log('update_geo_data_stats()')
    $('#cached_geo_updated').text(geo_data?.updated_at)
    $('#cached_geo_events').text(Object.keys(geo_data?.data?.events)?.length)
    $('#cached_geo_countries').text(Object.keys(geo_data?.data?.countries)?.length)
    $('#cached_geo_bytes').text(JSON.stringify(geo_data)?.length)
}

function update_home_parkrun_dropdown() {
    console.log('update_home_parkrun_dropdown()');
    const home_parkrun_select = $("#athlete_home_parkrun");

    // Clear all the existing options and add the 'Not Set' option
    home_parkrun_select.empty().append(createNotSetOption());

    if (geo_data) {
        // Iterate over all the available events that we know about
        Object.keys(geo_data.data.events).sort().forEach(event_name => {
            const event_o = geo_data.data.events[event_name];
            // Create and append an option for this event
            home_parkrun_select.append($('<option/>', {
                value: event_o.name,
                text: event_o.name
            }));
        });

        // Set the home parkrun we know about if we have it in the list, else default to 'Not Set'
        home_parkrun_select.val(saved_options?.home_parkrun_info?.name ?? NOT_SET_OPTION.value);
    } else {
        // If the user has set their home parkrun already, then add it into the list anyway and select that
        if (saved_options.home_parkrun_info.name) {
            home_parkrun_select.append($('<option/>', {
                value: saved_options.home_parkrun_info.name,
                text: saved_options.home_parkrun_info.name
            })).val(saved_options.home_parkrun_info.name);
        } else {
            home_parkrun_select.val(NOT_SET_OPTION.value);
        }
    }
    update_home_parkrun_country();
}

function update_home_parkrun_country() {
    console.log('update_home_parkrun_country()');
    const h_parkrun = $("#athlete_home_parkrun").val();
    const h_parkrun_div = $("#athlete_home_country_div");

    const p_info = get_home_parkrun_info(h_parkrun);
    console.log(p_info);
    h_parkrun_div.text(p_info.country_name || NOT_SET);

    $("#home_parkrun_info").text(JSON.stringify(p_info, null, 2));
}

// Code to run when the document's DOM is ready
$(document).ready(function () {
    initial_page_setup();
});
