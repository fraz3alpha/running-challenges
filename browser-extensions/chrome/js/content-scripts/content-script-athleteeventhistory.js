function get_challenge_link_location() {
    return $("div[id=content]").find("p:first")
}

function get_athlete_id() {
    // Very basic method to get only the parameter we care about
    var page_parameters = window.location.search
    var athlete_id = null
    if (page_parameters.includes('athleteNumber=')) {
        athlete_id = page_parameters.split('athleteNumber=')[1].split('&')[0]
    }
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
