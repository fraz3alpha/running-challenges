function get_challenge_link_location() {
    return $("div[id=content]").find("p:first")
}

function get_athlete_id() {
    // Find the Athlete ID by looking on the page for the link which contains the
    // text "View stats for all parkruns by this athlete" to get '<a href="/athleteresultshistory?athleteNumber=1386351"></a>
    var athlete_id = null
    $("a:contains('"+get_localised_value("link_view_stats_for_all_parkruns_athleteeventhistory")+"')").each(function (i) {
        athlete_id = $(this).attr('href').split("=")[1]
    })
    return athlete_id
}

var athlete_id = get_athlete_id()
if (athlete_id != null) {
    url = location.protocol + '//' + location.host + "/" + get_localised_value('url_athleteeventresultshistory')+'?athleteNumber='+athlete_id+'&eventNumber=0'

    if (url != null) {
        var challenge_link = $("<a/>").attr("href", url)

        var icon =  $('<img/>')
        icon.attr('src', chrome.extension.getURL("/images/logo/logo-128x128.png"))
        icon.attr('alt', get_localised_value("text_running_challenges"))
        icon.attr('title', get_localised_value("text_running_challenges"))
        icon.attr('height', 24)
        icon.attr('width', 24)

        challenge_link.append(icon)
        challenge_link.append($("<span/>").text(get_localised_value("text_see_challenge_progress")))
        get_challenge_link_location().after($('<div/>').append($('<p/>').append(challenge_link)))
    }
}
