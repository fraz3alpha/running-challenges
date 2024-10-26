function getBrowserAPI() {
  const api = (typeof chrome !== "undefined") ? chrome : browser;
  console.log(`getBrowserAPI() ==> ${typeof api}`);
  return api;
}

const browserAPI = getBrowserAPI();

// The data will be updated when there is no data, or it is over the
// configured age
var cache = {
  'events': {
    'raw_data': undefined,
    'updated_at': undefined,
    'last_update_attempt': undefined,
    'updating': false,
    'max_age': 3 * 24 * 60 * 60 * 1000,
    'url': "https://images.parkrun.com/events.json",
    'datatype': 'json',
    'enabled': true,
    'timeout': 5000,
    'last_status': {}
  },
  'data': undefined,
  'updated_at': undefined
};

function fetch_with_cache(url, cacheKey, responseType = 'json') {
  const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  const cacheTimestampKey = `${cacheKey}_timestamp`;

  console.log(`Loading data from ${url}`);

  return getBrowserAPI().storage.local.get([cacheKey, cacheTimestampKey])
    .then(cache => {
      const now = Date.now();
      if (cache[cacheKey] && cache[cacheTimestampKey] && (now - cache[cacheTimestampKey] < CACHE_DURATION)) {
        console.log(`Using cached data for ${url}`);
        return cache[cacheKey];
      } else {
        return fetch(url)
          .then(response => response[responseType]())
          .then(data => {
            const cacheData = {};
            cacheData[cacheKey] = data;
            cacheData[cacheTimestampKey] = now;
            browserAPI.storage.local.set(cacheData);
            return data;
          });
      }
    });
}

function clear_all_cache() {
  const cacheKeys = [
    'geo_data',
    'geo_data_timestamp',
    // 'home_parkrun_info',
    // 'athlete_number',
    'challengeMetadata'
  ];

  return browserAPI.storage.local.remove(cacheKeys)
    .then(() => {
      console.log('All cache items cleared');
    });
}

function load_data(force_update = false) {
  if (force_update) {
    console.log("Forcing update of data");
    clear_all_cache();
  }
  console.log("Loading saved data");
  return load_saved_data()
    .then(items => {
      console.log("Loaded saved data");
      const loaded_user_data = items;
      return fetch_geo_data().then(json => {
        console.log("Loaded geo data");
        update_cache_data(json);
        if (cache && cache.data && cache.data.valid) {
          return { loaded_user_data, loaded_geo_data: cache };
        } else {
          throw new Error('Geo data rejected');
        }
      });
    });
}

function load_saved_data() {
  return browserAPI.storage.local.get(["home_parkrun_info", "athlete_number", "challengeMetadata"]);
}

function fetch_geo_data() {
  const GEO_DATA_URL = 'https://images.parkrun.com/events.json';
  const CACHE_KEY = 'geo_data';
  return fetch_with_cache(GEO_DATA_URL, CACHE_KEY);
}

function getCountryNameFromId(id) {
  // Countries that no longer exists in the data are 
  // prefixed "0_" and arbitrarily assigned numbers
  // Sub-countries are assigned a number with a prefix of their main country site code.
  const countryMap = {
    "3": "Australia",
    "4": "Austria",
    "14": "Canada",
    "23": "Denmark",
    "30": "Finland",
    "31": "France",
    "32": "Germany",
    "0_2": "Iceland",
    "42": "Ireland",
    "44": "Italy",
    "46": "Japan",
    "54": "Lithuania",
    "57": "Malaysia",
    "64": "Netherlands",
    "65": "New Zealand",
    "85_2": "Namibia",
    "67": "Norway",
    "74": "Poland",
    "79": "Russia",
    "82": "Singapore",
    "85": "South Africa",
    "85_1": "Swaziland",
    "88": "Sweden",
    "97": "UK",
    "98": "USA",
    "0_1": "Zimbabwe",
  }

  var countryName = "unknown"
  if (id in countryMap) {
    countryName = countryMap[id]
  }
  // console.log("Returning: "+countryName+" for id="+id)
  return countryName
}

function parse_events(data, events_data) {
  console.log('parse_events()')
  console.log(events_data)

  if (data === undefined) {
    return
  }
  if (events_data === undefined) {
    return
  }

  // We don't have the names of countries any more, they are just IDs, and URLs
  // We'll probably need to make a mapping that we can use everywhere

  // We will create a name > info map as we go, but the events are referenced by ID, 
  // so populate an ID > name map too.

  country_id_name_map = {}

  $.each(events_data['countries'], function (country_id, country_info) {
    country_name = getCountryNameFromId(country_id)
    country_id_name_map[country_id] = country_name

    // The country centre point is no longer provided, instead it provides the bounds.
    // This is potentially useful, but for migration we'll compute the centre point.
    country_centre_lat = (country_info['bounds'][1] + country_info['bounds'][3]) / 2
    country_centre_lon = (country_info['bounds'][0] + country_info['bounds'][2]) / 2
    // The zoom, therefore, doesn't make any sense either, so lets arbitrarily set it to 8.
    country_zoom = 8

    data.countries[country_name] = {
      // All the standard attributes that come from the parkrun data
      "id": country_id,
      "name": country_name,
      "lat": country_centre_lat,
      "lon": country_centre_lon,
      "bounds": country_info['bounds'],
      "url": country_info['url'],

      // Extra attributes that we are going to fill in
      "child_event_ids": [],
      "child_event_names": []
    }
  })

  // The events.json file is designed to be read straight into the map rendering library,
  // so the points on the map are in an array under events/features
  $.each(events_data['events']['features'], function (event_feature_index, event_info) {
    // Only process the 5k events
    if (event_info['properties']['seriesid'] == 1) {

      // Example
      // {
      //   "id": 280,
      //   "type": "Feature",
      //   "geometry": {
      //     "type": "Point",
      //     "coordinates": [
      //       -1.310849,
      //       51.069286
      //     ]
      //   },
      //   "properties": {
      //     "eventname": "winchester",
      //     "EventLongName": "Winchester parkrun",
      //     "EventShortName": "Winchester",
      //     "LocalisedEventLongName": null,
      //     "countrycode": 97,
      //     "seriesid": 1,
      //     "EventLocation": "North Walls Recreation Ground"
      //   }
      // }

      event_id = event_info['id']
      event_name = event_info['properties']['EventShortName']
      country_id = event_info['properties']['countrycode']
      event_country_name = country_id_name_map[country_id]

      data.events[event_name] = {
        // All the standard attributes that come from the parkrun data
        "shortname": event_info['properties']['eventname'],
        "name": event_info['properties']['EventShortName'],
        "country_id": country_id,
        "country_name": event_country_name,
        "id": event_info['id'],
        "lat": event_info['geometry']['coordinates'][1],
        "lon": event_info['geometry']['coordinates'][0],
      }

      // Add this event to the appropriate country object
      addEventToCountryData(data, event_country_name, event_id, event_name)
    }
  })

}

function addEventToCountryData(data, country_name, event_id, event_name) {
  // console.log("Adding "+event_name+":"+event_id+" to "+country_name)
  // console.log("Current info for "+country_name+": event_ids="+data.countries[country_name]["child_event_ids"].length+" event_names="+data.countries[country_name]["child_event_names"].length)
  data.countries[country_name]["child_event_ids"].push(event_id)
  data.countries[country_name]["child_event_names"].push(event_name)
}

function update_cache_data(data_events) {
  if (data_events === undefined) {
    cache.data = {
      'valid': false,
      'data_fetch_status': {
        'events': cache.events.last_status
      }
    }
    cache.updated_at = undefined
    return cache.data
  }

  // Build up our new data
  var data = {
    'valid': false,
    'events': {},
    'countries': {},
    'data_fetch_status': {
      'events': cache.events.last_status
    }
  }

  parse_events(data, data_events)

  // Update the global cache
  cache.data = data
  cache.updated_at = new Date()
  data.valid = true

  return data
}
