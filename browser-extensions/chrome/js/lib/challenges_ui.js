/*
 * data object is of the form:
 * [
 *  alphabeteer: {
 *    "title_text": "Alphabeteer Challenge",
 *    "complete": false,
 *    "subparts": [
 *      'a',
 *      'b',
 *      'c'
 *    ],
 *    "subparts_completed": {
 *      "a": {
 *          "name":
 *          "position":
 *          ...
 *      },
 *    ]
 *    If there are any recommendations about what to do for these parts, then
 *    they can be added to this object
 *    "subparts_remaining_recommendations": {
 *      "c": {'Congleton'}
 *    }
 *  },
 * ]
 */

function generate_challenge_table() {

    // console.log('Generating Challenge Table')
    var table = $('<table></table>')
    // Set the ID so that we can easily find it again
    // table.attr("id", "challenge-table")
    // Use the 'results' id so that we pick up the standard styling
    table.attr("id", "results")
    // Optionally add a class with .addClass(this.tableClass)
    table.append($('<caption></caption>').text('Challenges'))

    // Add a set of links on the top row
    help_link = $('<a></a>').attr("href", chrome.extension.getURL("/html/help.html")).attr("target", '_blank').text('help')
    options_link = $('<a></a>').attr("href", chrome.extension.getURL("/html/options.html")).attr("target", '_blank').text('options')
    help_td = $('<td></td>').attr('colspan', 6).attr('align', 'right')
    help_td.append(options_link)
    help_td.append(" | ")
    help_td.append(help_link)

    table.append($('<tr></tr>').append(help_td))

    return table

}

function add_table_break_row(table, title, help) {
    var tbody = $('<tbody/>')
    var gap_row = $('<tr/>')
    gap_row.append($('<th/>').attr('colspan', 6).append('<span>&nbsp;</span>'))
    tbody.append(gap_row)
    var main_row = $('<tr/>')
    var tooltip = ''
    if (help !== undefined) {
        tooltip = '<span style="font-size: 10px; vertical-align: middle; cursor: default" title="'+help+'">[?]</span>'
    }
    main_row.append($('<th/>').attr('colspan', 6).append('<span><b>'+title+'</b></span> '+tooltip))
    tbody.append(main_row)
    table.append(tbody)
}

function add_challenges_to_table(table, data) {

   var ui_challenge_generation_duration = 0

   data.forEach(function (challenge) {
       // console.log("Generating table rows for " + challenge.shortname)
       var start_time = new Date()
       if (challenge.shortname == 'regionnaire') {
           generate_regionnaire_table_entry(challenge, table)
       } else {
           generate_standard_table_entry(challenge, table)
       }
       var duration = new Date() - start_time
       ui_challenge_generation_duration += duration
       // console.log("Completed generating table rows for " + challenge.shortname + " in " + duration + "ms")

   });

   // console.log("Completed generating challenge table rows in " + ui_challenge_generation_duration + "ms")

   return table
}

function get_tbody_header(challenge) {
    return $('<tbody></tbody>').attr('id', get_tbody_header_id(challenge))
}

function get_tbody_content(challenge) {
    return $('<tbody></tbody>').attr('id', get_tbody_content_id(challenge))
}

function get_tbody_header_id(challenge) {
    return "challenge_tbody_header_"+challenge['shortname']
}

function get_tbody_content_id(challenge) {
    return "challenge_tbody_content_"+challenge['shortname']
}

function get_flag_icon(country, height, width) {
    var flag_img = $('<img>'); //Equivalent: $(document.createElement('img'))
    flag_img.attr('src', chrome.extension.getURL("/images/flags/png/"+country.flag_icon+".png"));
    // badge_img.attr('alt', challenge.name)
    // badge_img.attr('title', challenge.name)
    flag_img.attr('height', height)
    flag_img.attr('width', width)

    return flag_img
}


function get_challenge_icon(challenge, height, width) {
    var badge_img = $('<img>'); //Equivalent: $(document.createElement('img'))
    badge_img.attr('src', chrome.extension.getURL("/images/badges/256x256/"+challenge.badge_icon+".png"));
    badge_img.attr('alt', challenge.name)
    badge_img.attr('title', challenge.name)
    badge_img.attr('height', height)
    badge_img.attr('width', width)

    return badge_img
}

function get_challenge_header_row(challenge) {

    var main_row = $('<tr></tr>')

    var badge_img = get_challenge_icon(challenge, 24, 24)
    badge_img.click(function(){
        $("tbody[id=challenge_tbody_content_"+challenge['shortname']+"]").toggle();
    });

    var anchor_tag = $('<a/>')
    anchor_tag.attr('name', challenge['shortname'])
    anchor_tag.append(badge_img)

    main_row.append($('<th></th>').append(anchor_tag))

    // main_row.append($('<th></th>').text(challenge.shortname))
    var help = ''
    if (challenge.help !== undefined) {
        help = '<span style="font-size: 10px; vertical-align: middle; cursor: default" title="'+challenge.help+'">[?]</span>'
    }

    main_row.append($('<th></th>').append(challenge.name + ' ' + help))
    main_row.append($('<th></th>'))
    main_row.append($('<th></th>').text(challenge.completed_on))
    if (challenge.summary_text !== undefined) {
        main_row.append($('<th></th>').text(challenge.summary_text))
    } else {
        main_row.append($('<th></th>').text(challenge.subparts_completed_count+"/"+challenge.subparts_count))
    }
    if (challenge.complete) {
        main_row.append($('<img/>').attr('src', chrome.extension.getURL("/images/badges/256x256/tick.png")).attr('width',24).attr('height',24))
    }

    return main_row
}

function generate_regionnaire_table_entry(challenge, table) {
    var shortname = challenge['shortname']

    var challenge_tbody_header = get_tbody_header(challenge)
    var challenge_tbody_detail = get_tbody_content(challenge)

    // Create the header row and add it to the tbody that exists to hold
    // the title row
    var main_row = get_challenge_header_row(challenge)
    challenge_tbody_header.append(main_row)

    iterate_regionnaire_data(challenge_tbody_detail, challenge['regions'])

    add_map_element(challenge_tbody_detail)

    table.append(challenge_tbody_header)
    table.append(challenge_tbody_detail)

    create_map(challenge)

}

function create_map(challenge) {
  console.log(challenge)
  // var map = new ol.Map({
  //   target: 'map',
  //   layers: [
  //     new ol.layer.Tile({
  //       source: new ol.source.OSM()
  //     })
  //   ],
  //   view: new ol.View({
  //     center: ol.proj.fromLonLat([37.41, 8.82]),
  //     zoom: 4
  //   })
  // });

  var vectorSource = new ol.source.Vector({
    //create empty vector
  });

  //create a bunch of icons and add to source vector
  for (var i=0;i<50;i++){

      var iconFeature = new ol.Feature({
        geometry: new
          ol.geom.Point(ol.proj.transform([Math.random()*360-180, Math.random()*180-90], 'EPSG:4326',   'EPSG:3857')),
      name: 'Null Island ' + i,
      population: 4000,
      rainfall: 500
      });
      vectorSource.addFeature(iconFeature);
  }

  //create the style
  var iconStyle = new ol.style.Style({
    image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
      anchor: [0.5, 46],
      anchorXUnits: 'fraction',
      anchorYUnits: 'pixels',
      opacity: 0.75,
      scale: 0.1,
      src: chrome.extension.getURL("/images/maps/markers/green-marker.png")
    }))
  });



  //add the feature vector to the layer vector, and apply a style to whole layer
  var vectorLayer = new ol.layer.Vector({
    source: vectorSource,
    style: iconStyle
  });

  var map = new ol.Map({
    layers: [new ol.layer.Tile({ source: new ol.source.OSM() }), vectorLayer],
    target: document.getElementById('map'),
    view: new ol.View({
      center: [-1.310849, 51.069286],
      zoom: 3
    })
  });
}

function add_map_element(table) {
  var row = $('<tr></tr>')
  var map = $('<td colspan="4"><div id="map" style="height:400; width:400"></div></td>')

  row.append(map)
  table.append(row)
}

function iterate_regionnaire_data(table, region, level, region_group) {

    if (level === undefined) {
        level = 0
    }

    // console.log(region["name"])

    var region_name_sanitised = region["name"].toLowerCase().replace(/\s/g, "_")

    var region_class_name = "regionnaire-class-"+region_name_sanitised
    var region_event_class_name = region_class_name+"-event"
    var region_incomplete_event_class_name = region_class_name+"-event-incomplete"
    var region_complete_event_class_name = region_class_name+"-event-complete"

    var hide_show_message = "parkruns I haven't done"

    if (region["child_events_total"] == 0) {
        return
    }

    var row = $('<tr></tr>')
    var twisty = $('<td></td>')
    var hide_region_sub_rows = false
    if (level == 1) {
        if (region["child_events_completed_count"] == 0) {
            twisty.append($('<b></b>').text("+"))
            hide_region_sub_rows = true
        } else {
            twisty.append($('<b></b>').text("+"))
        }
        // Set the geo region to the top level one (not world)
        // e.g. UK, Australia, Denmark
        region_group = region_class_name
    }
    row.append(twisty)
    var prefix = Array(level).join("> ")
    row.append($('<td></td>').append($('<b></b>').text(prefix + " " + region["name"])))
    row.append($('<td></td>'))
    var completion_string = region["child_events_completed_count"]+"/"+region["child_events_total"]
    row.append($('<td></td>').text(completion_string))
    row.addClass(region_event_class_name)
    row.addClass(region_group)
    table.append(row)

    // Print out those events that have been completed
    region["child_events"].forEach(function (child_event) {
        if (child_event in region["child_events_completed"]) {
            var row = $('<tr></tr>')
            row.addClass(region_complete_event_class_name)
            row.append($('<td></td>').text(""))
            row.append($('<td></td>'))
            row.append($('<td></td>').text(child_event))
            row.append($('<td></td>').text(region["child_events_completed"][child_event]["date"]))
            row.addClass(region_group)
            table.append(row)
        }
    })
    // Print the info of the ones that you are missing (if any)
    if (region["complete"] == false) {
        // Add a link to display the missing events (with them being normally
        // hidden so as not to overwhelm the page)
        // But only if there are sub-events
        if (region.child_events.length > 0) {
            var show_more_row = $('<tr/>')
            show_more_row.append($('<td/>'))
            show_more_row.append($('<td/>').append($('<span/>').click(function(){
                    $("."+region_incomplete_event_class_name).show();
                    // Change the visibility of the buttons for this section
                    $("."+region_incomplete_event_class_name+"-show").hide();
                    $("."+region_incomplete_event_class_name+"-hide").show();
                }).text('show '+hide_show_message+" ...")).attr('colspan', 3))
            show_more_row.addClass(region_incomplete_event_class_name+"-show")
            show_more_row.addClass(region_group)
            table.append(show_more_row)
        }

        // Create rows for all the unattended events, default to hidden
        region["child_events"].forEach(function (child_event) {
            if (!(child_event in region["child_events_completed"])) {
                var row = $('<tr></tr>')
                row.addClass(region_incomplete_event_class_name)
                row.append($('<td></td>'))
                row.append($('<td></td>'))
                row.append($('<td></td>').text(child_event))
                row.addClass(region_group)
                // Hide the row by default
                row.hide()
                table.append(row)
            }
        })

        var hide_more_row = $('<tr/>')
        hide_more_row.append($('<td/>'))
        hide_more_row.append($('<td/>').append($('<span/>').click(function(){
                $("."+region_incomplete_event_class_name).hide();
                // Change the visibility of the buttons for this section
                $("."+region_incomplete_event_class_name+"-show").show();
                $("."+region_incomplete_event_class_name+"-hide").hide();
            }).text('hide '+hide_show_message)).attr('colspan', 3))
        hide_more_row.addClass(region_incomplete_event_class_name+"-hide")
        hide_more_row.addClass(region_group)
        // Hide by default
        hide_more_row.hide()
        table.append(hide_more_row)
    }

    region["child_regions"].forEach(function (child_region) {
        iterate_regionnaire_data(table, child_region, level+1, region_event_class_name)
    })

    // // Sort out the visibility of all sub rows
    // if (hide_region_sub_rows) {
    //     console.log('Hiding sub rows of '+region["name"]+" with class "+region_group)
    //     $("."+region_group).hide()
    // }
}

function generate_standard_table_entry(challenge, table) {

    var challenge_tbody_header = get_tbody_header(challenge)
    var challenge_tbody_detail = get_tbody_content(challenge)

    // Create the header row and add it to the tbody that exists to hold
    // the title row
    var main_row = get_challenge_header_row(challenge)
    challenge_tbody_header.append(main_row)

    // Print the subparts
    challenge.subparts_detail.forEach(function (subpart_detail) {
        var subpart_row = $('<tr></tr>')
        subpart_row.append($('<td></td>').text("-"))
        if (subpart_detail != null) {

            subpart_row.append($('<td></td>').text(subpart_detail.subpart))
            subpart_row.append($('<td></td>').text(subpart_detail.name))
            subpart_row.append($('<td></td>').text(subpart_detail.info))

            challenge_tbody_detail.append(subpart_row)
        } else {
             subpart_row.append($('<td></td>').text('Missing'))
             challenge_tbody_detail.append(subpart_row)
        }

    });

    table.append(challenge_tbody_header)
    table.append(challenge_tbody_detail)

}
