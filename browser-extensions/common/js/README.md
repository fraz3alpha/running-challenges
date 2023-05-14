# Testing Running Challenges

## Unit testing

This project uses [Mocha] for unit testing.

To run the unit tests locally:

```sh
cd browser-extensions/common/js/tests
npm install
npm run test-with-coverage
```

## Automated browser testing

This project uses [Selenium] for automated browser testing.

To run the tests locally you will need a number of Docker containers running Selenium. You can run them all at once:

```sh
docker run --name selenium-chrome -d -p 4444:4444 -p 7900:7900 selenium/standalone-chrome
docker run --name selenium-firefox -d -p 4445:4444 -p 7901:7900 selenium/standalone-firefox
docker run --name selenium-edge -d -p 4446:4444 -p 7902:7900 selenium/standalone-edge
```

These "latest" tagged images are the latest in [Selenium Grid releases], not in particular browser versions.

When run in the [Extension Builder] workflow in [GitHub Actions], we can define the port to be constant, or for it to be dynamically
generated at runtime, and pick it up from a variable. This is probably preferable.

You need to set the value of `EXTENSION_ZIP` to point to a built extension. On Windows you do it like:

```dos
$Env:EXTENSION_ZIP="C:\\Users\\andre\\Downloads\\running_challenges-chrome-1.1.4.26.zip"
```

If you want you can set the browser, but it will default to chrome - although perhaps we could derive this from the zip name?:

```dos
$Env:EXTENSION_BROWSER="firefox"
```

The port defaults to 4444, but you can override it with:

```dos
$Env:SELENIUM_PORT="4445"
```

<!-- Links for this document -->
[Extension Builder]: https://github.com/fraz3alpha/running-challenges/actions/workflows/build-extension.yml
[GitHub Actions]: https://github.com/actions
[Mocha]: https://mochajs.org
[Selenium Grid releases]: https://github.com/SeleniumHQ/docker-selenium/releases
[Selenium]: https://www.selenium.dev
