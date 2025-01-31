function get_challenge_link_location() {
    return $("div[id=content]").find("p:first")
}

function get_athlete_id() {
    // Very basic method to get only the parameter we care about
    var page_parameters = window.location.search
    var athlete_id = undefined

    if (window.location.pathname.startsWith('/parkrunner')) {
        athlete_id = window.location.pathname.match('parkrunner\/([0-9]+)\/')[1]
    } else if (page_parameters.includes('athleteNumber=')) {
        athlete_id = page_parameters.split('athleteNumber=')[1].split('&')[0]
    }

    console.log('Athlete ID: '+athlete_id)
    return athlete_id
}


var athlete_id = get_athlete_id()
if (athlete_id !== undefined) {
    url = 'https://' + location.host + "/parkrunner/" + athlete_id + '/all'

    if (url != null) {
        var challenge_link = $("<a/>").attr("href", url)

        var icon =  $('<img/>')
        icon.attr('src', browserAPI.runtime.getURL("/images/logo/logo-128x128.png"))
        icon.attr('alt', get_localised_value("text_running_challenges"))
        icon.attr('title', get_localised_value("text_running_challenges"))
        icon.attr('height', 24)
        icon.attr('width', 24)

        challenge_link.append(icon)
        challenge_link.append($("<span/>").text(get_localised_value("text_see_challenge_progress")))
        get_challenge_link_location().after($('<div/>').append($('<p/>').append(challenge_link)))
    }
}
