var geo_data = null

// Saves options to chrome.storage
function save_options() {
  var athlete_number = document.getElementById('athlete_number').value;
  var athlete_home_parkrun = document.getElementById('athlete_home_parkrun').value;

  var saved_data = {
    athlete_number: athlete_number,
  }

  // Look up extra pieces of information for this parkrun.
  if (athlete_home_parkrun in geo_data.data.events) {
      home_event_info = geo_data.data.events[athlete_home_parkrun]
      saved_data.home_parkrun_info = home_event_info
  }


  console.log('Saving: '+JSON.stringify(saved_data))

  chrome.storage.sync.set(saved_data, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  var restored_options = null
  chrome.storage.sync.get({
    athlete_number: '',
    home_parkrun_info: null
  }, function(items) {
    restored_options = items
    document.getElementById('athlete_number').value = items.athlete_number;
  });

  // Load the GEO data with a timeout
  var timeout_for_geo_data_ms = 5000

  var timeoutProtect = setTimeout(function() {
    // Clear the local timer variable, indicating the timeout has been triggered.
    timeoutProtect = null;
    // Display the data without geo data
    display_data(challenge_settings)

  }, timeout_for_geo_data_ms);

  chrome.runtime.sendMessage({data: "geo"}, function(response) {
      // Proceed only if the timeout handler has not yet fired.
      if (timeoutProtect) {
        // Clear the scheduled timeout handler
        clearTimeout(timeoutProtect);
        geo_data = response.geo

        // Fill in some summary data on the options page
        document.getElementById('cached_geo_updated').innerText = geo_data.updated;
        document.getElementById('cached_geo_events').innerText = Object.keys(geo_data.data.events).length;
        document.getElementById('cached_geo_countries').innerText = Object.keys(geo_data.data.countries).length;
        document.getElementById('cached_geo_regions').innerText = Object.keys(geo_data.data.regions).length;
        document.getElementById('cached_geo_bytes').innerText =  JSON.stringify(geo_data).length;

        // Fill in the home parkrun selection dropdown
        home_parkrun_select = $("[id=athlete_home_parkrun]")
        Object.keys(geo_data.data.events).forEach(function (event_name) {
            event_o = geo_data.data.events[event_name]
            // if (region_o.parent_id == "1") {
            var select_option = $('<option/>', {
                value: event_o.name
            })
            select_option.text(event_o.name)
            home_parkrun_select.append(select_option)
            // }
        })

        if (restored_options.home_parkrun_info !== null) {
            home_parkrun_select.val(restored_options.home_parkrun_info.name)
        }
        update_home_country()

        // Add on-change listener to the select box
        home_parkrun_select.change(update_home_country)
    }
  });

}

function update_home_country() {
    var h_parkrun = $("[id=athlete_home_parkrun]").val()
    if (h_parkrun === null || h_parkrun == "Not Set") {
        $("[id=athlete_home_country_div]").text("Not Set")
    } else if (h_parkrun in geo_data.data.events) {
        var h_country = geo_data.data.events[h_parkrun].country_name
        $("[id=athlete_home_country_div]").text(h_country)
    } else {
        $("[id=athlete_home_country_div]").text("Unknown")
    }

}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
