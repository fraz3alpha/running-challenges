const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const fs = require('fs');
const path = require('path');



let opts = new chrome.Options();

(async function helloSelenium() {

    const encodeExt = file => {
        const stream = fs.readFileSync(path.resolve(file));
        return Buffer.from(stream).toString('base64');
      };

    // From https://stackoverflow.com/questions/14249506/how-can-i-wait-in-node-js-javascript-l-need-to-pause-for-a-period-of-time
    const delay = s => new Promise(resolve => setTimeout(resolve, s*1000))


    // Chrome seems to want us to load the extension into memory before passing it to the options
    // From https://stackoverflow.com/questions/51182142/add-an-unpacked-extension-from-file-selenium-node-js/56088051
    opts.addExtensions(encodeExt('C:\\Users\\andre\\Downloads\\running_challenges-chrome-1.1.4.26.zip'))

    let driver = new Builder()
        .usingServer("http://localhost:4444/wd/hub")
        .forBrowser('chrome')
        .setChromeOptions(opts)
        .build();
    try {
        // https://www.selenium.dev/selenium/docs/api/javascript/index.html might be useful

        // Andy's profile
        await driver.get('https://www.parkrun.org.uk/results/athleteeventresultshistory/?athleteNumber=1309364&eventNumber=0');

        // Short delay to ensure the extension is loaded
        await delay(1);

        // This div will start by saying something like "Loading volunteer data", and eventually
        // say "Additional badges provided by Running Challenges" when everything has worked
        let div = await driver.findElement(By.id("running_challenges_messages_div"))
        // Give it 10 seconds to say that
        await driver.wait(until.elementTextIs(div, "Additional badges provided by Running Challenges"), 10000);

        console.log(await div.getText())

        
        // From https://stackoverflow.com/questions/22938045/selenium-webdriver-node-js-take-screenshot-and-save-test-results/22938848
        await driver.takeScreenshot().then(
          function(image, err) {
              require('fs').writeFile('out-docker-chrome.png', image, 'base64', function(err) {
                  console.log(err);
              });
          }
        );
    }
    finally {
        await driver.quit();
    }
})();