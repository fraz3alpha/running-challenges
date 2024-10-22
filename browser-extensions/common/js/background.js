
// This captures the click on the icon in the toolbar
browser.browserAction.onClicked.addListener(handleClicked);

function handleClicked(_tab) {
  // We want to check if an Athlete Number has been provided,
  // if so let's display their results page
  browser.storage.local.get({
    athlete_number: '',
    home_parkrun_info: {}
  }).then((items) => handleStoredItems(items));
}

browser.runtime.onMessage.addListener(handleMessage);

function handleMessage(request, _sender, sendResponse) {
  // console.log(sender.tab ?
  //             "from a content script:" + sender.tab.url :
  //             "from the extension");
  if (request.data == "geo") {
    // sendResponse({farewell: 'argh'});
    var freshen = false
    if ('freshen' in request) {
      if (request.freshen === true) {
        freshen = true
      }
    }
    // console.log('freshen='+freshen)
    get_geo_data(function (geo_data) {
      // console.log('Sending response back to the page')
      returned_data = { "geo": geo_data }
      // console.log(returned_data)
      sendResponse(returned_data);
    }, freshen);

    // Indicate we are going to return a response asynchronously
    // https://developer.chrome.com/extensions/runtime#event-onMessage
    return true
  }
  if (request.action) {
    var done = false
    var msg = request.action + ": OK"
    switch (request.action) {
      case "cache-all-clear":
        clear_cache()
        done = true
        break
      case "cache-geo-clear":
        clear_cache_by_name("events")
        done = true
        break
      case "cache-get":
        if (cache.data) {
          msg = JSON.stringify(cache.data, null, 2)
        } else {
          msg = "<no cached data>"
        }
        done = true
        break
      case "cache-get-summary":
        var cache_summary = get_cache_summary()
        msg = JSON.stringify(cache_summary, null, 2)
        done = true
        break
      case "enable-geo":
        cache.events.enabled = true
        done = true
        break
      case "disable-geo":
        cache.events.enabled = false
        done = true
        break
    }
    if (done) {
      sendResponse({
        "action": request.action,
        "msg": msg
      });
    } else {
      sendResponse({
        "action": request.action,
        "msg": request.action + ": Unsupported action"
      });
    }
  }
}

function handleStoredItems(items) {
  // console.log('Icon clicked, loading based on '+JSON.stringify(items))
  // If no athlete number has been set, load the options page
  if (items.athlete_number == '') {
    browser.runtime.openOptionsPage();
  } else {
    // If they have set it up, then redirect to their home parkrun's site,
    // else default to the UK site.
    var home_parkrun_info = items.home_parkrun_info;

    var local_url = "parkrun.org.uk";
    console.log("Home parkrun info: " + JSON.stringify(home_parkrun_info));

    // Previously, I think we must have had local_url come back, but now it doesn't by default
    if ("local_url" in home_parkrun_info) {
      local_url = home_parkrun_info.local_url;
      console.log("Overriding local_url for this to: " + local_url);
    } else {
      // So, lets try and work out what the local URL is, if possible
      console.log("unknown local url");
      if ("country_name" in home_parkrun_info) {

        // This will always be undefined before the extension is loaded the first time,
        // so it'll always send people to the wrong site if the we need to take this code
        // path when the browser is first loaded.
        if (cache.data !== undefined) {

          // This mirrors the way we try to do it in the options page
          if ("country_name" in home_parkrun_info) {
            var country_info = cache.data.countries[home_parkrun_info["country_name"]];
            if ("url" in country_info) {
              local_url = country_info["url"];
              // Persist this data back into the user's saved information
              home_parkrun_info["local_url"] = local_url;
              browser.storage.local.set({ "home_parkrun_info": home_parkrun_info }).then(() => {
                console.log("Saved updated user data to include local_url");
              });
            }
          }
        }
      }
      // else we'll end up with the UK site
    }

    console.log("local_url for this user is: " + local_url);
    results_url = "https://" + local_url + "/parkrunner/" + items.athlete_number + "/all";
    browser.tabs.create({ url: results_url });
  }
}

