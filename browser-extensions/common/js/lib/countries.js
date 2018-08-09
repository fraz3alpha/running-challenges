var countries = {
    "New Zealand": {
      "flag_code": "nz",
      "website": "www.parkrun.co.nz"
    },
    "Australia": {
      "flag_code": "au"
    },
    "Denmark": {
      "flag_code": "dk"
    },
    "Finland": {
      "flag_code": "fi"
    },
    "France": {
      "flag_code": "fr",
      "website": "www.parkrun.fr"
    },
    "Germany": {
      "flag_code": "de"
    },
    "Iceland": {
      "flag_code": "is",
      "website": "www.parkrun.is"
    },
    "Ireland": {
      "flag_code": "ie"
    },
    "Italy": {
      "flag_code": "it"
    },
    "Malaysia": {
      "flag_code": "my"
    },
    "Canada": {
      "flag_code": "ca"
    },
    "Norway": {
      "flag_code": "no"
    },
    "Poland": {
      "flag_code": "pl"
    },
    "Russia": {
      "flag_code": "ru"
    },
    "Singapore": {
      "flag_code": "sg"
    },
    "South Africa": {
      "flag_code": "za"
    },
    "Sweden": {
      "flag_code": "se"
    },
    "UK": {
      "flag_code": "gb"
    },
    "USA": {
      "flag_code": "us"
    },
    "Zimbabwe": {
      "flag_code": "zb",
      "defunct_events": [
        "Rolf Valley"
      ]
    }
}
    // "Iceland"--
    // "Zimbabwe"--

function get_country_by_website(website) {
  var matching_countries = Object.keys(countries).some(function(c){
    return c.country_website == website
  })
  if (matching_countries.length == 1) {
    return matching_countries[0]
  } else {
    return undefined
  }
}
