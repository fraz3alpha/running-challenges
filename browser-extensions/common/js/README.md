To run the tests locally you will need a number of Docker containers that are running Selenium in order to run those tests.

You can run them all at once:
```
docker run --name selenium-firefox -d -p 4444:4444 -p 7900:7900 selenium/standalone-chrome
docker run --name selenium-firefox -d -p 4445:4444 -p 7901:7900 selenium/standalone-firefox
```
These "latest" tagged images appear to be the latest in the 3.x line - which I assume is selenium,
rather than any bearing on the browser version

I assume this will work too:
```
docker run --name selenium-firefox -d -p 4446:4444 -p 7902:7900 selenium/standalone-edge
```

When run in Github Actions we can define the port to be constant, or for it to be dynamically 
generated at runtime, and pick it up from a variable. This is probably preferable

You need to set the value of EXTENSION_ZIP to point to a built extension, on Windows you do it like:
```
$Env:EXTENSION_ZIP="C:\\Users\\andre\\Downloads\\running_challenges-chrome-1.1.4.26.zip"
```

If you want you can set the browser, but it will default to chrome - although perhaps we could derrive this from the zip name?:
```
$Env:EXTENSION_BROWSER="firefox"
```
The port defaults to 4444, but you can override it with:
```
$Env:SELENIUM_PORT="4445"
```