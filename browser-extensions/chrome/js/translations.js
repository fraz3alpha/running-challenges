

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function draw_translation_table() {

    var table = $('<table/>', {
        class: "simple_table"
    })

    english_translations = Object.keys(domains.default.text_volunteer_role_map).sort()
    console.log(english_translations)

    domain = Object.keys(domains.default.text_volunteer_role_map).sort()

    var translation_map = {}

    $.each(domains, function(domain, translations) {
        if (domain == "default") {
            return
        }
        console.log(domain)
        if ("text_volunteer_role_map" in translations) {
            var mapping = {}
            console.log(translations.text_volunteer_role_map)
            $.each(translations.text_volunteer_role_map, function(foreign, english) {
                mapping[english] = foreign
            })
            translation_map[domain] = mapping
        }
    })
    console.log(translation_map)
    var h_row = $('<tr/>')
    h_row.append($('<th/>').text('International English'))
    $.each(Object.keys(translation_map).sort(), function(j, pr_lang) {
        h_row.append($('<th/>').text(pr_lang))
    })
    table.append(h_row)

    $.each(Object.keys(domains.default.text_volunteer_role_map).sort(), function(i, role) {
        var row = $('<tr/>')
        row.append($('<td/>').text(role))
        $.each(Object.keys(translation_map).sort(), function(j, pr_lang) {
            row.append($('<td/>').text(translation_map[pr_lang][role]))
        })
        table.append(row)
    })

    console.log(table)
    $('[id=volunteer_roles]').append(table)
}

document.addEventListener('DOMContentLoaded', draw_translation_table);
