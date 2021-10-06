const { Builder } = require("selenium-webdriver");
const firefox = require("selenium-webdriver/firefox");
const fs = require('fs');
const path = require('path');

let opts = new firefox.Options();
(async function helloSelenium() {

    const encodeExt = file => {
        const stream = fs.readFileSync(path.resolve(file));
        return Buffer.from(stream).toString('base64');
      };

    const delay = s => new Promise(resolve => setTimeout(resolve, s*1000))

    // If we load it like Chrome, it complains it doesn't end in .zip
    // If we give the Chrome extension it complains it doesn't have the ID in it
    // If we give it the firefox one it doesn't complain, but it also didn't load anything
    opts.addExtensions('C:\\Users\\andre\\Downloads\\running_challenges-firefox-1.1.4.26.zip')


    let driver = new Builder()
        .usingServer("http://localhost:4445/wd/hub")
        .forBrowser('firefox')
        .setFirefoxOptions(opts)
        .build();
    try {
        await driver.get('https://www.parkrun.org.uk/results/athleteeventresultshistory/?athleteNumber=1309364&eventNumber=0');

        await delay(10);
        await driver.takeScreenshot().then(
          function(image, err) {
              require('fs').writeFile('out-docker-firefox.png', image, 'base64', function(err) {
                  console.log(err);
              });
          }
        );
    }
    finally {
        await driver.quit();
    }
})();