const {Builder, By, Key, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');

(async function example() {

  const encodeExt = file => {
    const stream = fs.readFileSync(path.resolve(file));
    return Buffer.from(stream).toString('base64');
  };

  const delay = s => new Promise(resolve => setTimeout(resolve, s*1000))

  let chromeOptions = new chrome.Options()
  console.log(chromeOptions)
  chromeOptions.addExtensions(encodeExt('C:\\Users\\andre\\Downloads\\running_challenges-chrome-1.1.4.26.zip'))
  // console.log(chromeOptions)

  let driver = new Builder()
      .forBrowser('chrome')
      .setChromeOptions(chromeOptions)
      .build();

  console.log(driver)

  // .withCapabilities({"extensions": ['C:\\Users\\andre\\Downloads\\running_challenges-chrome-1.1.4.26.zip']})
  // let driver = await new Builder().forBrowser('chrome').build();
  // let driverCaps = await driver.getCapabilities();
  // driverCaps.set("extensions", ['C:\\Users\\andre\\Downloads\\running_challenges-chrome-1.1.4.26.zip'])
  // driver.setCapabilties(driverCaps)
  try {
    await driver.get('https://www.parkrun.org.uk/results/athleteeventresultshistory/?athleteNumber=1309364&eventNumber=0');
    
    console.log("Waiting 10 seconds for something to happen")
    await delay(10);

    driver.takeScreenshot().then(
      function(image, err) {
          require('fs').writeFile('out.png', image, 'base64', function(err) {
              console.log(err);
          });
      }
    );

    //await driver.findElement(By.name('q'));.sendKeys('webdriver', Key.RETURN);
    //await driver.wait(until.titleIs('webdriver - Google Search'), 1000);
    console.log("Done")
  } finally {
    await driver.quit();
  }
})();