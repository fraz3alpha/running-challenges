
// This captures the click on the icon in the toolbar
browser.browserAction.onClicked.addListener(handleClicked);

function handleClicked(_tab) {
  // We want to check if an Athlete Number has been provided,
  // if so let's display their results page
  browser.storage.local.get({
    athlete_number: undefined,
    home_parkrun_info: {}
  }).then((items) => handleStoredItems(items));
}

function handleStoredItems(items) {
  if (!items.athlete_number) {
    browser.runtime.openOptionsPage();
    return;
  }

  let local_url = "parkrun.org.uk";
  const home_parkrun_info = items?.home_parkrun_info;

  if (home_parkrun_info?.local_url) {
    local_url = home_parkrun_info.local_url;
  }

  const results_url = `https://${local_url}/parkrunner/${items.athlete_number}/all`;
  browser.tabs.create({ url: results_url });
}

