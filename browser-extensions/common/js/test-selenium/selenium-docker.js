var assert = require('assert');
const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const firefox = require("selenium-webdriver/firefox");
const fs = require('fs');
const path = require('path');

// OK, we are going to make things hard for ourselves here, and instead of using the normal
// Mocha test writing style of describe() { it('should do a thing') {} ...}, we are going to
// the objects manually so that we can dynamically create the list of tests.
// This is primarily because it is the same test for each of the websites, but there may
// be some differences, and we want to list them as separate tests. You could put them all in
// the same test, but that makes it harder to work out which is failing, and to associate
// a final screenshot with each one.
const Mocha = require('mocha');
const { hasUncaughtExceptionCaptureCallback } = require('process');
var testRunner = new Mocha()
// This is our top-level suite, we'll add a suite to this for each website, and
// that suite will have the tests for that site.
var testSuite = Mocha.Suite.create(testRunner.suite, 'extension-mocha-tests')
// We'll need to use the driver variable for the entire test, it should get
// set up in the before() block, but we will need to create a beforeAll() function
// and set it up there.
var driver;

// Lets use me for testing
const parkrunnerAndyTaylor = "1309364";

const extensionZip = process.env.EXTENSION_ZIP
const extensionBrowser = process.env.EXTENSION_BROWSER ? process.env.EXTENSION_BROWSER : "chrome"
const seleniumPort = process.env.SELENIUM_PORT ? process.env.SELENIUM_PORT : "4444"
// Default to running all countries, but if if we just want to run some, set the names in a comma separate list here.
const countryFilter = process.env.COUNTRY_FILTER

var websiteFilter = undefined
if (countryFilter !== undefined && countryFilter.length >0) {
    websiteFilter = countryFilter.split(",")
}

console.log("Running tests against "+extensionBrowser+" (port "+seleniumPort+") for "+extensionZip)

var getBrowserOptions = function(browser) {
    switch(browser) {
        case "chrome":
            return new chrome.Options();
        case "firefox":
            return new firefox.Options();
        default:
            console.log("Unsupported browser for these tests")
            return undefined
    }
}

// Create the driver, which needs to load the extension and make a connection to 
// the appropriate Selenium port (Which will be running in a container)
var buildDriver = function(browser, caps) {

    const encodeExt = file => {
        const stream = fs.readFileSync(path.resolve(file));
        return Buffer.from(stream).toString('base64');
      };

    // The path to the extension zip should be set in this environment variable,
    // Or you could hardcode it, like 'C:\\Users\\andre\\Downloads\\running_challenges-chrome-1.1.4.26.zip'
    
    console.log("Loading extension zip from "+extensionZip)
  
    let opts = getBrowserOptions(browser);

    // Chrome seems to want us to load the extension into memory before passing it to the options
    // From https://stackoverflow.com/questions/51182142/add-an-unpacked-extension-from-file-selenium-node-js/56088051
    // Firefox wants it as a path, which we shall use as the default
    switch(browser) {
        // Chrome needs to be encoded
        case "chrome":
            opts.addExtensions(encodeExt(extensionZip));
            break;
        // Nothing else seems to want to be encoded
        case "firefox":
        default:
            opts.addExtensions(extensionZip);
            break;
    }
    
    let builder = new Builder()
    .usingServer("http://localhost:"+seleniumPort+"/wd/hub")
    .forBrowser(browser)

    // Apply the appropriate options
    switch(browser) {
        case "chrome":
            builder.setChromeOptions(opts);
            break;
        case "firefox":
            builder.setFirefoxOptions(opts);
            break;
    }
    return builder.build();
  };

testSuite.beforeAll(function(done) {
    console.log("Creating browser driver")
    // No specific capabililties are passed in this time.
    driver = buildDriver(extensionBrowser, {});
    done();
});

// Free up the driver at the end
testSuite.afterAll(async function() { 
    driver.quit()
});

// After each test, take a screenshot
testSuite.afterEach(async function() {
    // console.log(this);

    // this.currentTest has a title, and a parent suite object, which itself might have a parent etc...
    // We should create a path heirachy and put the screenshots in the right place to match up with the test

    let testPath = []
    let parentSuite = this.currentTest.parent
    while (parentSuite !== undefined && parentSuite.title != "") {
        testPath.push(parentSuite.title.toLowerCase().replace(/[^a-z0-9-_\.]/g,'_'))
        parentSuite = parentSuite.parent
    }
    // We need to use ... to splat the array into a set of strings
    let screenshotPath = path.join("screenshots", extensionBrowser, ...testPath.reverse())
    console.log("Screenshot path for this test: "+screenshotPath)

    // Create directory if required
    if (!fs.existsSync(screenshotPath)){
        fs.mkdirSync(screenshotPath, { recursive: true });
    }

    console.log("Creating screenshot for " + this.currentTest.title)
    let screenshotName = "screenshot-"+this.currentTest.title.toLowerCase().replace(/[^a-z0-9-_\.]/g,'_')+".png";

    let screenshotFileName = path.join(screenshotPath, screenshotName)

    console.log("Full screenshot path: " + screenshotFileName)
    return driver.takeScreenshot().then(
        function(image, err) {
            // Writing the file out to disk
            fs.writeFile(screenshotFileName, image, 'base64', function(err) {
                console.log(err);
            });
        }
    );
});
    

const testOrder = [
    "main",
    "other"
]

var parkrunWebsites = {
    "defaultPages": {
        "main": "/parkrunner/REPLACE_ATHLETE_NUMBER/all/"
    },
    "sites": [
        {
            "name": "parkrun.org.uk",
            "hostname": "https://www.parkrun.org.uk",
            "pages": {
                "other": "something" // Example, doesn't do anything at the moment
            }
        },
        {
            "name": "parkrun.com.au",
            "hostname": "https://www.parkrun.com.au"
        },
        {
            "name": "parkrun.co.nz",
            "hostname": "https://www.parkrun.co.nz"
        },
        {
            "name": "parkrun.ca",
            "hostname": "https://www.parkrun.ca"
        },
        {
            "name": "parkrun.ie",
            "hostname": "https://www.parkrun.ie"
        },
        {
            "name": "parkrun.co.za",
            "hostname": "https://www.parkrun.co.za"
        },
        {
            "name": "parkrun.us",
            "hostname": "https://www.parkrun.us"
        },
        {
            "name": "parkrun.sg",
            "hostname": "https://www.parkrun.sg"
        },
        {
            "name": "parkrun.pl",
            "hostname": "https://www.parkrun.pl"
        },
        {
            "name": "parkrun.it",
            "hostname": "https://www.parkrun.it"
        },
        {
            "name": "parkrun.dk",
            "hostname": "https://www.parkrun.dk"
        },
        {
            "name": "parkrun.se",
            "hostname": "https://www.parkrun.se"
        },
        {
            "name": "parkrun.fi",
            "hostname": "https://www.parkrun.fi"
        },
        {
            "name": "parkrun.fr",
            "hostname": "https://www.parkrun.fr"
        },
        {
            "name": "parkrun.no",
            "hostname": "https://www.parkrun.no"
        },
        {
            "name": "parkrun.com.de",
            "hostname": "https://www.parkrun.com.de"
        },
        {
            "name": "parkrun.ru",
            "hostname": "https://www.parkrun.ru"
        },
        {
            "name": "parkrun.my",
            "hostname": "https://www.parkrun.my"
        },
        {
            "name": "parkrun.jp",
            "hostname": "https://www.parkrun.jp"
        },
        {
            "name": "parkrun.co.nl",
            "hostname": "https://www.parkrun.co.nl"
        },
    ]
}

parkrunWebsites.sites.forEach(function(website) {
    if (websiteFilter !== undefined) {
        if (!(websiteFilter.includes(website.name))) {
            // Skip this one then
            console.log("Skipping "+website.name+" it is not in "+websiteFilter)
            return;
        }
    }
    var thisWebsiteTestSuite = Mocha.Suite.create(testSuite, website.name)
    testOrder.forEach(function(testName) {
        // Pick up the page from the default config, unless it has been overridden.
        var testDefinition = parkrunWebsites.defaultPages[testName]
        if (website.pages !== undefined && testName in website.pages) {
            testDefinition = website.pages[testName]
        }

        if (testDefinition !== undefined) {
            if (testName == "main") {
                thisWebsiteTestSuite.addTest(new Mocha.Test(testName, async function() {
                    // Set the timeout for this test to 30 seconds
                    this.timeout(30000);
                    // Load the parkrun page
                    const url = website.hostname + testDefinition.replace("REPLACE_ATHLETE_NUMBER", parkrunnerAndyTaylor)
                    console.log("Loading "+url)
                    // await driver.get("https://www.parkrun.org.uk/parkrunner/"+parkrunnerAndyTaylor+"/all/");
                    await driver.get(url);
                    // Give us a moment the ensure the extension has loaded before continuing
                    await driver.sleep(1000);

                    let div = await driver.findElement(By.id("running_challenges_messages_div"))
                    // Give it 10 seconds to say that
                    await driver.wait(until.elementTextIs(div, "Additional badges provided by Running Challenges"), 10000)

                }));
            }
            // else if (testName == "xyz") {
            //     thisWebsiteTestSuite.addTest(new Mocha.Test(testName, async function() {
            //         // Set the timeout for this test to 30 seconds
            //         this.timeout(30000);
            //         // Load the parkrun page
            //         const url = website.hostname + website.pages[testName].replace("REPLACE_ATHLETE_NUMBER", parkrunnerAndyTaylor)
            //         console.log("Loading "+url)
            //         // await driver.get("https://www.parkrun.org.uk/parkrunner/"+parkrunnerAndyTaylor+"/all/");
            //         await driver.get(url);
            //         // Give us a moment the ensure the extension has loaded before continuing
            //         await driver.sleep(1000);

            //         let div = await driver.findElement(By.id("running_challenges_messages_div"))
            //         // Give it 10 seconds to say that
            //         await driver.wait(until.elementTextIs(div, "Additional badges provided by Running Challenges"), 10000)

            //     }));
            // }
        }
    });    
});

var suiteRun = testRunner.run()
process.on("exit", (code) => {
    process.exit(suiteRun.stats.failures> 0)
})





// // Use the Mocha testing harness
// describe("extension", () => {
//     // Before each test set up a connection to selenium
//     before(function(done) {
//         // caps.name = this.currentTest.title;
//         driver = buildDriver({});
//         done();
//     });

//     after(async function() { 
//         driver.quit()
//     });

//     // After each test, take a screenshot then close the connection
//     afterEach(async function() {
//         // console.log(this);

//         // this.currentTest has a title, and a parent suite object, which itself might have a parent etc...
//         // We should create a path heirachy and put the screenshots in the right place to match up with the test

//         let testPath = []
//         let parentSuite = this.currentTest.parent
//         while (parentSuite !== undefined && parentSuite.title != "") {
//             testPath.push(parentSuite.title.toLowerCase().replace(/[^a-z0-9]/g,'_'))
//             parentSuite = parentSuite.parent
//         }
//         // We need to use ... to splat the array into a set of strings
//         let screenshotPath = path.join("screenshots",...testPath.reverse())
//         console.log(screenshotPath)

//         // Create directory if required
//         if (!fs.existsSync(screenshotPath)){
//             fs.mkdirSync(screenshotPath, { recursive: true });
//         }

//         console.log(this.currentTest.parent.title)
//         let screenshotName = "screenshot-"+this.currentTest.title.toLowerCase().replace(/[^a-z0-9]/g,'_')+".png";

//         let screenshotFileName = path.join(screenshotPath, screenshotName)

//         return driver.takeScreenshot().then(
//             function(image, err) {
//                 require('fs').writeFile(screenshotFileName, image, 'base64', function(err) {
//                     console.log(err);
//                 });
//             }
//         );

//     });

//     describe("parkrun.org.uk", function() {

//         describe("athleteeventresultshistory - the main page", function() {
//             this.timeout(30000);

//             // Ensure that the main page on the UK site works
//             it("should load the extension and modify results/athleteeventresultshistory", async () => {
//                 // Load the parkrun page
//                 await driver.get("https://www.parkrun.org.uk/parkrunner/"+parkrunnerAndyTaylor+"/all/");
//                 // Give us a moment the ensure the extension has loaded before continuing
//                 await driver.sleep(1000);

//                 let div = await driver.findElement(By.id("running_challenges_messages_div"))
//                 // Give it 10 seconds to say that
//                 await driver.wait(until.elementTextIs(div, "Additional badges provided by Running Challenges"), 10000)

//             });
        
//         });

//     });

//     describe("parkrun.com.de", function() {

//         describe("athleteeventresultshistory - the main page", function() {
//             this.timeout(30000);

//             // Ensure that the main page on the UK site works
//             it("should load the extension and modify results/athleteeventresultshistory", async () => {
//                 // Load the parkrun page
//                 await driver.get("https://www.parkrun.com.de/parkrunner/"+parkrunnerAndyTaylor+"/all/");
//                 // Give us a moment the ensure the extension has loaded before continuing
//                 await driver.sleep(1000);

//                 let div = await driver.findElement(By.id("running_challenges_messages_div"))
//                 // Give it 10 seconds to say that
//                 await driver.wait(until.elementTextIs(div, "Additional badges provided by Running Challenges"), 10000)

//             });
        
//         });

//     });

// });