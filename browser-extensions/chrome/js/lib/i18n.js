// This attempts to provide an interface for the code to be common, and yet
// still work across all of the parkrun sites
// Although most of the content is still in English, such as the parkrun names

var domains = {
    // Default english language options, good for most of the domains
    "default": {
        "url_athleteeventresultshistory": "results/athleteeventresultshistory/",
        "table_all_results": "All Results",
        "link_view_stats_for_all_parkruns": "View stats for all parkruns by this athlete",
        "link_view_stats_for_all_parkruns_athleteeventhistory": "View stats for all parkruns by this athlete",
        "link_all": "All",
        // These variables contain text we output, so need translating by someone
        "text_see_challenge_progress": "See challenge progress",
        "text_running_challenges": "Running Challenges"
    },
    "www.parkrun.pl": {
        // Polish pages
        // http://www.parkrun.pl/warszawa-ursynow/rezultaty/athletehistory/?athleteNumber=546975
        // http://www.parkrun.pl/rezultaty/athleteresultshistory/?athleteNumber=546975
        // http://www.parkrun.pl/rezultaty/athleteeventresultshistory/?athleteNumber=546975&eventNumber=0
        "url_athleteeventresultshistory": "rezultaty/athleteeventresultshistory/",
        "table_all_results": "Wszystkie wyniki",
        "link_view_stats_for_all_parkruns": "Zobacz statystyki uczestnika ze wszystkich biegów parkrun",
        "link_view_stats_for_all_parkruns_athleteeventhistory": "Zobacz wyniki tego zawodnika ze wszystkich biegów",
    },
    "www.parkrun.it": {
        // Italian pages
        // http://www.parkrun.it/etna/results/athletehistory/?athleteNumber=3868619
        // http://www.parkrun.it/results/athleteresultshistory/?athleteNumber=3868619
        // http://www.parkrun.it/results/athleteeventresultshistory?athleteNumber=3868619&eventNumber=0
        "table_all_results": "Tutti i risultati",
        "link_view_stats_for_all_parkruns": "Visualizza statistiche per tutti i parkruns di questo atleta",
        "link_view_stats_for_all_parkruns_athleteeventhistory": "Visualizza statistiche per tutti i parkruns di questo atleta",
    },
    "www.parkrun.dk": {
        // Danish pages
        // http://www.parkrun.dk/amagerstrandpark/results/athletehistory/?athleteNumber=3287153
        // http://www.parkrun.dk/results/athleteresultshistory/?athleteNumber=3287153
        // http://www.parkrun.dk/results/athleteeventresultshistory/?athleteNumber=3287153&eventNumber=0
        "table_all_results": "Alle resultater",
        "link_view_stats_for_all_parkruns": "Se tal for alle parkruns løbet af denne løber",
        "link_view_stats_for_all_parkruns_athleteeventhistory": "Se tal for alle parkruns løbet af denne løber",
    },
    "www.parkrun.se": {
        // Swedish pages
        // http://www.parkrun.se/orebro/results/athletehistory/?athleteNumber=3899897
        // http://www.parkrun.se/results/athleteresultshistory/?athleteNumber=3899897
        // http://www.parkrun.se/results/athleteeventresultshistory/?athleteNumber=3899897&eventNumber=0
        "table_all_results": "Alla resultat",
        "link_view_stats_for_all_parkruns": "Se statistik för alla parkruns av denna löpare",
        "link_view_stats_for_all_parkruns_athleteeventhistory": "Se statistik för alla parkruns av denna löpare",
    }
}

function get_localised_value(param, domain=location.host) {
    // Strip any leading http[s] protocol off the front of the domain
    var domain = domain.replace(/^https?:\/\//,'')
    if (domain in domains) {
        if (param in domains[domain]) {
            console.log("I18N:"+param+":"+domains[domain][param])
            return domains[domain][param]
        }
    }
    return get_localised_default_value(param)
}

function get_localised_default_value(param) {
    console.log("I18N:"+param+":"+domains.default[param])
    return domains.default[param]
}
