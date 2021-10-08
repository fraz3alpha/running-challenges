var assert = require('assert');
const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const fs = require('fs');
const path = require('path');

const parkrunnerAndyTaylor = "1309364";

var buildDriver = function(caps) {
    let opts = new chrome.Options();

    const encodeExt = file => {
        const stream = fs.readFileSync(path.resolve(file));
        return Buffer.from(stream).toString('base64');
      };

    const extensionZip = process.env.EXTENSION_ZIP
    console.log("Loading extension zip from ${extensionZip}")
  
    // Chrome seems to want us to load the extension into memory before passing it to the options
    // From https://stackoverflow.com/questions/51182142/add-an-unpacked-extension-from-file-selenium-node-js/56088051
    opts.addExtensions(encodeExt('C:\\Users\\andre\\Downloads\\running_challenges-chrome-1.1.4.26.zip'))
    // opts.addExtensions(encodeExt(extensionZip))

    return new Builder()
    .usingServer("http://localhost:4444/wd/hub")
    .forBrowser('chrome')
    .setChromeOptions(opts)
    .build();
  };

// Use the Mocha testing harness
describe("extension", () => {
    // Before each test set up a connection to selenium
    before(function(done) {
        // caps.name = this.currentTest.title;
        driver = buildDriver({});
        done();
    });

    after(async function() { 
        driver.quit()
    });

    // After each test, take a screenshot then close the connection
    afterEach(async function() {
        // console.log(this);

        // this.currentTest has a title, and a parent suite object, which itself might have a parent etc...
        // We should create a path heirachy and put the screenshots in the right place to match up with the test
        console.log(this.currentTest.parent.title)
        let screenshotName = "screenshot-"+this.currentTest.title.toLowerCase().replace(/[^a-z0-9]/g,'_')+".png";

        return driver.takeScreenshot().then(
            function(image, err) {
                require('fs').writeFile(screenshotName, image, 'base64', function(err) {
                    console.log(err);
                });
            }
        );

    });

    describe("parkrun.org.uk", function() {

        describe("athleteeventresultshistory - the main page", function() {
            this.timeout(30000);

            // Ensure that the main page on the UK site works
            it("should load the extension and modify results/athleteeventresultshistory", async () => {
                // Load the parkrun page
                await driver.get("https://www.parkrun.org.uk/results/athleteeventresultshistory/?athleteNumber="+parkrunnerAndyTaylor+"&eventNumber=0");
                // Give us a moment the ensure the extension has loaded before continuing
                await driver.sleep(1000);

                let div = await driver.findElement(By.id("running_challenges_messages_div"))
                // Give it 10 seconds to say that
                await driver.wait(until.elementTextIs(div, "Additional badges provided by Running Challenges"), 10000)

            });
        
        });

    });

    // describe("parkrun.com.de", function() {

    //     describe("athleteeventresultshistory - the main page", function() {
    //         this.timeout(30000);

    //         // Ensure that the main page on the UK site works
    //         it("should load the extension and modify results/athleteeventresultshistory", async () => {
    //             // Load the parkrun page
    //             await driver.get("https://www.parkrun.com.de/results/athleteeventresultshistory/?athleteNumber="+parkrunnerAndyTaylor+"&eventNumber=0");
    //             // Give us a moment the ensure the extension has loaded before continuing
    //             await driver.sleep(1000);

    //             let div = await driver.findElement(By.id("running_challenges_messages_div"))
    //             // Give it 10 seconds to say that
    //             await driver.wait(until.elementTextIs(div, "Additional badges provided by Running Challenges"), 10000)

    //         });
        
    //     });

    // });

});