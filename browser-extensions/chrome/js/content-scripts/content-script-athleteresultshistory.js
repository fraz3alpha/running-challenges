function get_challenge_link_location() {
    return $("div[id=content]").find("p:first")
}

function get_athleteeventresultshistory_url() {
    var returned_url = null
    $('a').each(function (index) {
        // console.log(this)
        if ($(this).text() == 'All') {
            var url = $(this).attr('href')
            if (url.search('athleteeventresultshistory') > 0) {
                returned_url = url
            }
        }
    })
    return returned_url
}


var url = get_athleteeventresultshistory_url();
if (url != null) {
    var challenge_link = $("<a/>").attr("href", url)

    var icon =  $('<img/>')
    icon.attr('src', chrome.extension.getURL("/images/logo/logo-128x128.png"))
    icon.attr('alt', "Running Challenges")
    icon.attr('title', "Running Challenges")
    icon.attr('height', 24)
    icon.attr('width', 24)

    challenge_link.append(icon)
    challenge_link.append($("<span/>").text("See Challenge Progress"))
    get_challenge_link_location().after($('<div/>').append($('<p/>').append(challenge_link)))
}
