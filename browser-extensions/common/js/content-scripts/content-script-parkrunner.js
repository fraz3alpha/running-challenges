
function get_table(id, caption) {

  query_string = "table"
  if (id !== undefined) {
    query_string += "[id=" + id + "]"
  }


  return $(query_string).filter(function (index) {

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
    return table_captions[0].innerText.replace('–', '').trim() == caption
  })
}

function get_badge_location() {
  return $("div[id=content]").find("p:first")
}

function parse_volunteer_table(result) {

  // Find all the results tables in this page
  var completed_volunteer_roles = {}
  $("table[id=results]", result).each(function (results_table_index) {
    // Try and find the table that also has a <h1> containing
    // "Volunteer Summary"
    var results_table = $(this)
    parent = $(this).parent()
    $("h3#volunteer-summary", parent).each(function (index) {
      completed_volunteer_roles = {}
      $("tbody>tr", results_table).each(function (role_index) {
        table_cells = $("td", this)
        volunteer_role = table_cells[0].innerText.replace(/^\s+|\s+$/g, '');
        volunteer_role_quantity = table_cells[1].innerText

        // Try and translate from whatever language it is in
        normalised_volunteer_role = get_normalised_volunteer_role(volunteer_role)

        if (!(normalised_volunteer_role in completed_volunteer_roles)) {
          completed_volunteer_roles[normalised_volunteer_role] = 0
        }
        completed_volunteer_roles[normalised_volunteer_role] += parseInt(volunteer_role_quantity)
      })
      // console.log(completed_volunteer_roles)
    })

  })
  return completed_volunteer_roles
}

function set_complete_progress_message(errors) {
  var messages = ['Additional badges provided by <a href="https://running-challenges.co.uk" target="_blank">Running Challenges</a>']
  $.each(errors, function (index, error_message) {
    messages.push(error_message)
  })
  if (errors.length > 0) {
    messages.push('Refresh the page to try again')
  }
  set_progress_message(messages.join('<br/><br/>'))
}

function set_progress_message(progress_message) {
  console.log("Progress: " + progress_message)
  // $("div[id=running_challenges_messages_div]").html($("div[id=running_challenges_messages_div]").html() + "<br/>" + progress_message)
  $("div[id=running_challenges_messages_div]").html(progress_message)
}

function parsePageAthleteInfo() {

  // Parse out the information from the page relating to this parkrunner, including:
  // The name, as shown

  // The HTML relating to the top of the page looks like this:
  //   <div id="main">
  //   <div id="primary">
  //     <div id="content" role="main">
  //         <a href='https://contra-movement.com/?utm_source=parkrun&utm_medium=web&utm_campaign=dec_19'>
  //           <picture>
  //               <source media='(min-width: 767px)' srcset='https://images.parkrun.com/blogs.dir/3/files/2019/12/1100x100_gif.gif'>
  //                 <img src='https://images.parkrun.com/blogs.dir/3/files/2019/12/767x250_bau_gif.gif'
  //                   alt='CONTRA December 2019'
  //                   style='width:auto;margin-bottom: 20px;'>
  //             </picture>
  //         </a><?xml version="1.0"?>
  // <h2>Andrew TAYLOR - 202 runs at All Events<br/>202 parkruns total
  //       </h2>

  // It can look different in different languages, e.g.
  // https://www.parkrun.ru/parkrunner/5481082/all/
  // <h2>Максим МАХНО - 14 пробежек на All Events<br/>14 забеги parkrun total</h2>
  // https://www.parkrun.jp/parkrunner/6460713/all/
  // <h2>和輝 遠藤 - 10 参加 All Events<br/>10 parkrun total</h2>

  // In each case, however, it is the first <h2> block, and everything before the dash is what we want.
  // Find the first h2 tag in the appropriate div, and we can parse the name out of that.
  var mainAthleteTag = $("div[id=main]>div[id=primary]>div[id=content]>h2").first()

  var pageAthleteInfo = {
    "id": get_athlete_id(),
    "name": getAthleteName(mainAthleteTag.text())
  }

  // Check to see if the athlete tag should be updated now
  var now = new Date()
  var timeoutDate = Date.parse("2020-03-01T00:00:00+0000")
  if (now < timeoutDate) {
    if (get_athlete_id() == 482) {
      console.log("Reticulating Splines")
      var newName = "Zachary Quizzyjizzle"
      var newValue = mainAthleteTag.html().replace(/(.*?) -/, newName + " -")
      mainAthleteTag.html(newValue)
      pageAthleteInfo.name = newName
    }
  }

  return pageAthleteInfo

}

function getAthleteName(athleteSummaryText) {
  // e.g.
  // Andrew TAYLOR - 202 runs at All Events202 parkruns total
  //  - 0 runs at All Events...
  // Максим МАХНО - 14 пробежек на All Events14 забеги parkrun total
  //  - 0 пробежек на All Events...

  var athleteName = undefined

  if (athleteSummaryText !== undefined) {
    var parts = athleteSummaryText.split(" - ")
    if (parts[0] != "") {
      athleteName = parts[0]
    }
  }

  return athleteName

}

function parse_results_table() {

  parkruns_completed = []

  get_table("results", get_localised_value('table_all_results')).each(function (results_table) {
    // Gather the data for this table

    // Find all the table body rows
    completed_parkrun_events = $("tbody>tr", this)

    completed_parkrun_events.each(function (index) {
      // Only parse table rows with at least one cell, and look at the first one
      table_cells = $("td", this)
      if (table_cells.length > 0) {
        // Find the name and other interesting bits of data for this parkrun

        parkrun_name = table_cells[0].innerText.trim()
        parkrun_eventlink = table_cells[0].innerHTML.trim()
        parkrun_date = table_cells[1].innerText.trim()
        parkrun_datelink = table_cells[1].innerHTML.trim()
        parkrun_event_number = table_cells[2].innerText.trim()
        parkrun_position = table_cells[3].innerText.trim()
        parkrun_time = table_cells[4].innerText.trim()
        parkrun_pb = table_cells[6].innerText.trim()

        // Create a date object, useful for comparing
        parkrun_date_obj = new Date()
        date_parts = parkrun_date.split("/")
        if (date_parts.length == 3) {
          parkrun_date_obj = new Date(date_parts[2] + "-" + date_parts[1] + "-" + date_parts[0] + "T00:00:00Z")
        }

        // Store this parkrun instance in our big data structure
        parkrun_stats = {
          "name": parkrun_name,
          "eventlink": parkrun_eventlink,
          "date": parkrun_date,
          "datelink": parkrun_datelink,
          "date_obj": parkrun_date_obj,
          "event_number": parkrun_event_number,
          "position": parkrun_position,
          "time": parkrun_time,
          "pb": parkrun_pb.length > 0
        }
        parkruns_completed.push(parkrun_stats)

      }
    });
  });

  // Return the results in chronological order, which is the natural
  // way to process it, as the older parkruns will be hit first when iterating
  // over the list

  // The returned array should be ordered by date, oldest first, rather than assuming the order. We've had several reports of this
  // causing issues, but at the time it appeared not to be consistent and some profiles were in one order, and others in the reverse.
  var parkruns_completed_sorted = parkruns_completed.sort(function (a, b) {
    return a.date_obj - b.date_obj
  })

  if (parkruns_completed_sorted.length > 0) {
    console.log("Sorted parkruns, first: " + parkruns_completed_sorted[0].date + " last: " + parkruns_completed_sorted[parkruns_completed_sorted.length - 1].date)
  }

  return parkruns_completed_sorted
}


function create_skeleton_elements(id_map) {

  top_of_the_page_anchor = $("div[id=content]").find("p:first")

  // The top sections are badges, flags, and messages.
  // Initially the badges and flags are empty until the data is parsed and loaded,
  // and the messsages displayed will indicate progress.

  // Spacer to separate the existing shirt icons from our badges
  var running_challenges_top_spacer = $('<br/>')
  top_of_the_page_anchor.after(running_challenges_top_spacer)

  // Create badges element
  var running_challenges_badges_div_container = $('<p/>')
  var running_challenges_badges_div = $('<div/>').attr("id", id_map["badges"])
  running_challenges_badges_div_container.append(running_challenges_badges_div)
  running_challenges_top_spacer.after(running_challenges_badges_div_container)

  // Create flags element
  var running_challenges_flags_div = $('<div/>').attr("id", id_map["flags"])
  running_challenges_badges_div_container.after(running_challenges_flags_div)

  var running_challenges_message_spacer = $('<br/>')
  running_challenges_flags_div.after(running_challenges_message_spacer)

  // Add a message div, with some initial contents
  var running_challenges_messages_div = $('<div/>').attr("id", id_map["messages"])
  running_challenges_message_spacer.after(running_challenges_messages_div)
  // Use the progress message function to se interval
  set_progress_message('Loading <a href="https://running-challenges.co.uk" target="_blank">Running Challenges</a> Badges')

  // Create main table element
  var running_challenges_main_table_div = $('<div/>').attr("id", id_map["main"])
  get_table('results', get_localised_value('table_all_results')).before(running_challenges_main_table_div)

  // Create stats element
  var running_challenges_stats_div = $('<div/>').attr("id", id_map["stats"])
  running_challenges_main_table_div.before(running_challenges_stats_div)

  // Add a spacer between the stats and the main table
  running_challenges_main_table_div.before($('<br/>'))

  // Add a spacer after the main table
  running_challenges_main_table_div.after($('<br/>'))

}

function add_stats(div_id, data) {
  set_progress_message("Adding stats")
  var stats_div = $("div[id=" + div_id + "]")
  add_stats_table(stats_div, data)
  set_progress_message("Added stats")
}

function add_badges(div_id, data) {
  set_progress_message("Adding badges")
  // Find out which challenges we have been provided, and determine if they are
  // complete, and if so, award the badge
  var badges = []
  if (data.challenge_results) {
    // Running badges
    if (data.challenge_results.running_results) {
      data.challenge_results.running_results.forEach(function (result) {
        var badge = get_running_badge(result)
        if (badge) {
          if (Array.isArray(badge)) {
            $.each(badge, function (index, badgeInstance) {
              badges.push(badgeInstance)
            })
          } else {
            badges.push(badge)
          }
        }
      })
    }
    // Volunteer badges
    if (data.challenge_results.volunteer_results) {
      data.challenge_results.volunteer_results.forEach(function (result) {
        var badge = get_volunteer_badge(result)
        if (badge) {
          badges.push(badge)
        }
      })
    }
  }

  // Now insert all the badges into the page
  badge_div = $("div[id=" + div_id + "]")

  var index_counter = 1
  badges.forEach(function (badge) {
    var badge_awarded_div = $("<span/>")
    badge_awarded_div.attr("id", "badge-awarded-" + badge.shortname)
    var badge_link = $('<a></a>')
    badge_link.attr('href', badge.link)

    var img = $('<img>')
    img.attr('src', badge.icon)
    img.attr('alt', badge.name)
    img.attr('title', badge.name)
    img.attr('width', 64)
    img.attr('height', 64)

    modifyStyle(img)

    badge_awarded_div.append(badge_link)
    badge_link.append(img)
    badge_div.append(badge_awarded_div)

    if (index_counter > 0 && index_counter % 8 == 0) {
      badge_div.append($('<br/>'))
    }
    index_counter += 1
  })

  // All done!
  set_progress_message("Added badges")
}

// Format the badge information specific to the running challenge data
function get_running_badge(result) {
  var badge_info = undefined
  // console.log(result)

  // If this challenge uses the badgesAwarded mechanism, then see if there are
  // any
  if (result.badgesAwarded !== undefined) {
    if (result.badgesAwarded.length > 0) {
      badge_info = []
      $.each(result.badgesAwarded, function (index, badge) {
        badge_info.push({
          "name": badge.name,
          "icon": browserAPI.runtime.getURL("/images/badges/" + badge.badge_icon + ".png"),
          // The link just goes to the top of the main table for the challenge, not the specific row.
          "link": "#" + result.shortname,
          "shortname": badge.badge_icon
        })
      })
    }
  } else {
    if (result.complete == true) {
      badge_info = {
        "name": result.name,
        "icon": browserAPI.runtime.getURL("/images/badges/" + result.badge_icon + ".png"),
        "link": "#" + result.shortname,
        "shortname": result.badge_icon
      }
    } else if (result.partial_completion == true) {
      badge_info = {
        "name": result.partial_completion_name,
        "icon": browserAPI.runtime.getURL("/images/badges/" + result.partial_completion_badge_icon + ".png"),
        "link": "#" + result.shortname,
        "shortname": result.partial_completion_badge_icon
      }
    }
  }
  return badge_info
}

// Format the badge information specific to the volunteer challenge data -
// in particular, we award the stars based on how many times each has been done
function get_volunteer_badge(result) {
  var badge_info = undefined
  // console.log(result)
  if (result.complete == true) {
    badge_info = {
      "name": result.name,
      "icon": browserAPI.runtime.getURL("/images/badges/" + result.badge_icon + ".png"),
      "link": "#" + result.shortname,
      "shortname": result.badge_icon
    }
    if (result.subparts_completed_count >= 25) {
      badge_info.icon = browserAPI.runtime.getURL("/images/badges/" + result.badge_icon + "-3-stars.png")
      badge_info.name += " (25+ times)"
    } else if (result.subparts_completed_count >= 10) {
      badge_info.icon = browserAPI.runtime.getURL("/images/badges/" + result.badge_icon + "-2-stars.png")
      badge_info.name += " (10+ times)"
    } else if (result.subparts_completed_count >= 5) {
      badge_info.icon = browserAPI.runtime.getURL("/images/badges/" + result.badge_icon + "-1-star.png")
      badge_info.name += " (5+ times)"
    }
  }
  return badge_info
}

function add_flags(div_id, data) {
  set_progress_message("Adding flags")
  // console.log(data)

  if (data.parkrun_results && data.geo_data) {

    countryCompletionInfo = calculateCountryCompletionInfo(data)
    console.log(countryCompletionInfo)

    // Generate a list of visited countries
    countriesVisited = []
    $.each(countryCompletionInfo, function (countryName, countryInfo) {
      if (countryInfo.visited) {
        countriesVisited.push(countryInfo)
      }
    })
    console.log(countriesVisited)


    // global_tourism_info = generate_global_tourism_data(data.parkrun_results, data.geo_data)
    // console.log(global_tourism_info)

    flags_div = $("div[id=" + div_id + "]")

    var index_counter = 1
    countriesVisited.sort(function (o1, o2) {
      // Equal
      if (o1.firstRanOn === o2.firstRanOn) {
        return 0
      }
      // If either are null they should go to the back, although this shouldn't be the case
      // as we have already pruned out those we haven't visited
      if (o1.firstRanOn === null) {
        return 1
      }
      if (o2.firstRanOn === null) {
        return -1
      }
      return o1.firstRanOn - o2.firstRanOn
    }).forEach(function (country) {
      if (country.visited) {
        // Find out when it was first run and make a nice string
        var first_run = country.firstRanOn.toISOString().split("T")[0]

        var explorer_link = $("<a/>").attr("href", "#explorer")

        var img = $('<img>');
        img.attr('src', get_flag_image_src(country.name))
        img.attr('alt', country.name)
        img.attr('title', country.name + ": " + first_run)
        img.attr('width', 48)
        img.attr('height', 48)
        // We need some padding so that the flags don't run into each other.
        // This used to be 6px left and right, but that was not only huge, but squashed the flags
        // for some reason, perhaps there was inherited top and bottom padding that disappeared
        // at some point. So now lets make it 2px all round
        img.attr('style', 'padding-left:2px; padding-right:2px; padding-bottom:2px; padding-top:2px')

        explorer_link.append(img)
        flags_div.append(explorer_link)

        if (index_counter > 0 && index_counter % 8 == 0) {
          flags_div.append($('<br/>'))
        }
        index_counter += 1
      }
    })
  }

  set_progress_message("Added flags")
}

function updateSummaryInfo(data, athleteId) {

  data.info.has_athlete_id = (data.user_data.athlete_number !== undefined && data.user_data.athlete_number != '')
  data.info.has_home_parkrun = (data.user_data.home_parkrun_info !== undefined && data.user_data.home_parkrun_info.name !== undefined)
  data.info.is_our_page = (data.info.has_athlete_id && athleteId == data.user_data.athlete_number)
  // Convenience properties for the main sources of data
  // data.info.has_geo_data = (data.geo_data !== undefined)
  data.info.has_parkrun_results = (data.parkrun_results !== undefined)

}

function add_challenge_results(div_id, data) {
  set_progress_message("Adding challenge results")
  // console.log(data)
  results_div = $("div[id=" + div_id + "]")
  results_table = generate_challenge_table()
  results_div.append(results_table)
  // Add the results if we have them
  if (data.info.has_challenge_results) {

    // Add the explorer table on its own, before the challenges, always
    generateExplorerTableEntry(results_table, data)

    if (data.info.has_challenge_running_results) {
      add_challenges_to_table(results_table, 'running_results', data)
    }

    if (data.info.has_challenge_volunteer_results) {
      add_table_break_row(results_table, "Volunteer Challenges", "Get a purple badge when you've done a role once, get a star for doing the role 5+ times, two stars for 10+ times, three stars for 25+ times.")
      add_challenges_to_table(results_table, 'volunteer_results', data)
    }
  }
  set_progress_message("Added challenge results")
}

function create_page() {
  const id_map = create_skeleton();

  let loaded_user_data = {};
  let loaded_geo_data;
  let parsed_volunteer_data;
  let parsed_results_data;

  parse_athlete_info();

  parsed_results_data = parse_results();
  if (!parsed_results_data || parsed_results_data.length === 0) {
    set_progress_message("No results detected, no challenge data will be compiled");
    return;
  }

  load_data()
    .then(data => {
      loaded_user_data = data.loaded_user_data;
      loaded_geo_data = data.loaded_geo_data;
      return load_volunteer_data();
    })
    .then(volunteer_data => {
      parsed_volunteer_data = volunteer_data;
      process_data_and_update_ui(id_map, parsed_results_data, parsed_volunteer_data, loaded_geo_data, loaded_user_data);
    })
    .catch(handle_error);
}

function create_skeleton() {
  const id_map = {
    "messages": "running_challenges_messages_div",
    "badges": "running_challenges_badges_div",
    "flags": "running_challenges_flags_div",
    "main": "running_challenges_main_div",
    "stats": "running_challenges_stats_div"
  };
  create_skeleton_elements(id_map);
  return id_map;
}

function parse_athlete_info() {
  set_progress_message("Parsing Athlete Info");
  parsePageAthleteInfo();
  set_progress_message("Parsed Athlete Info");
}

function parse_results() {
  set_progress_message("Parsing Results");
  const parsed_results_data = parse_results_table();
  set_progress_message("Parsed Results");
  return parsed_results_data;
}

function load_volunteer_data() {
  return fetch_volunteer_data(get_athlete_id())
    .then(results => {
      set_progress_message("Loaded volunteer data");
      return parse_volunteer_table(results);
    });
}

function process_data_and_update_ui(id_map, parsed_results_data, parsed_volunteer_data, loaded_geo_data, loaded_user_data) {
  set_progress_message("All done");

  const data = {
    'parkrun_results': parsed_results_data,
    'volunteer_data': parsed_volunteer_data,
    'geo_data': loaded_geo_data,
    'user_data': loaded_user_data,
    'info': {}
  };

  set_progress_message(JSON.stringify(data));
  updateSummaryInfo(data, get_athlete_id());

  data.challenge_results = {
    "running_results": generate_running_challenge_data(data, parsePageAthleteInfo()),
    "volunteer_results": generate_volunteer_challenge_data(data)
  };

  data.info.has_challenge_results = !!data.challenge_results;
  data.info.has_challenge_running_results = !!data.challenge_results.running_results;
  data.info.has_challenge_volunteer_results = !!data.challenge_results.volunteer_results;
  data.info.has_volunteer_data = !!data.volunteer_data;

  data.stats = generate_stats(data);
  data.info.has_stats = !!data.stats;

  add_badges(id_map["badges"], data);
  add_flags(id_map["flags"], data);
  add_challenge_results(id_map["main"], data);
  add_stats(id_map["stats"], data);

  const errors = [];
  if (!has_geo_data(data)) {
    errors.push('! Unable to fetch parkrun event location data: Stats, Challenges, and Maps requiring locations are not available !');
  }

  set_complete_progress_message(errors);
}

function handle_error(error) {
  console.error(`An error occurred: ${error}`);
  set_progress_message(`Error: ${error}. Stack: ${error.stack}. Data is ${JSON.stringify(data ?? undefined)}`);
}


function fetch_volunteer_data(athleteId) {
  const VOLUNTEER_DATA_URL = `https://${location.host}/parkrunner/${athleteId}/`;
  const CACHE_KEY = `volunteer_data_${athleteId}`;
  return fetch_with_cache(VOLUNTEER_DATA_URL, CACHE_KEY, 'text');
}

function get_athlete_id() {
  const pathname = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);

  let athlete_id;

  if (pathname.startsWith('/parkrunner')) {
    const match = pathname.match(/parkrunner\/(\d+)/);
    if (match) {
      athlete_id = match[1];
    }
  } else if (searchParams.has('athleteNumber')) {
    athlete_id = searchParams.get('athleteNumber');
  }

  console.log(`Athlete ID: ${athlete_id}`);
  return athlete_id;
}

function modifyStyle(img) {
  // Shush, don't tell anyone and spoil the surprise
  today = new Date();
  // getMonth is zero indexed. getDate is 1 indexed.
  if (today.getMonth() == 3 && today.getDate() == 1) {
    r = Math.floor(Math.random() * 4);
    if (r > 0) {
      img.attr('style', "transform:rotate(" + r * 90 + "deg);");
    }
  }
}

// Run our code and render the page
create_page();

