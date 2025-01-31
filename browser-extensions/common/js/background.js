const browserAPI = (typeof chrome !== "undefined") ? chrome : browser;

browserAPI.action.onClicked.addListener(handleClicked);

function handleClicked(_tab) {
  console.log("Extension clicked");
  // We want to check if an Athlete Number has been provided,
  // if so let's display their results page
  browserAPI.storage.local.get({
    athlete_number: '',
    home_parkrun_info: {}
  }).then((items) => handleStoredItems(items));
}

function handleStoredItems(items) {
  console.log(`handleStoredItems(${JSON.stringify(items)})`);
  if (!items.athlete_number) {
    console.log("No athlete number set, opening options page");
    browserAPI.runtime.openOptionsPage();
    return;
  }

  let local_url = "parkrun.org.uk";
  const home_parkrun_info = items?.home_parkrun_info;

  if (home_parkrun_info?.local_url) {
    local_url = home_parkrun_info.local_url;
  }

  console.log(`Opening results page for athlete ${items.athlete_number}`);
  const results_url = `https://${local_url}/parkrunner/${items.athlete_number}/all`;
  browserAPI.tabs.create({ url: results_url });
}

