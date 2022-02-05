# Examples

Someone who hasn't done many other parkruns other than their own course: [Liz MARSHALL](https://www.parkrun.org.uk/parkrunner/930349/all/)

Someone who done a lot of touristing: [James WHITE](https://www.parkrun.org.uk/parkrunner/556789/all/)

Someone who has done a lot of parkruns: [Glenna GREENSLADE](https://www.parkrun.org.uk/parkrunner/105134/all/)

The Famous Cowells: [Chris COWELL](https://www.parkrun.org.uk/parkrunner/11865&eventNumber=0) and [Linda COWELL](http://www.parkrun.org.uk/results/athleteeventresultshistory/?athleteNumber=18414/all/)

People responsible for getting more involved: [Tim GP](https://www.parkrun.org.uk/parkrunner/78426/all/) & [May GP](http://www.parkrun.org.uk/winchester/results/athletehistory/?athleteNumber=81219)

Two other people [Laura COWEN](https://www.parkrun.org.uk/parkrunner/1386351&eventNumber=0) & [Andrew TAYLOR](http://www.parkrun.org.uk/results/athleteeventresultshistory/?athleteNumber=1309364/all/)

Sparse Example: [Andy STANFORD-CLARK](https://www.parkrun.org.uk/parkrunner/1770518/all/)

Founder: [Paul Sinton-Hewitt](https://www.parkrun.org.uk/parkrunner/1674/all/)

Unfeasibly large number of different parkuns, and totals in a year: [Paul FREYNE](https://www.parkrun.org.uk/parkrunner/5227/all/)

Me: https://www.google.com/maps/search/?api=1&query=50.050091595041295,0.3533679090909079
Laura: https://www.google.com/maps/search/?api=1&query=50.99635012087909,-4.604887230769234

## Automated Testing

We had added a Mocha test framework to test the Javascript libraries, and the testcases are found in the 
`js/test` directory.

We might wish to publish our code coverage metrics like this: https://maximilianschmitt.me/posts/istanbul-code-coverage-badge-github/.

Currently they will just be printed to the Travis output

Run the tests in the `js` directory with:
```
npm test
```
Or, if you want the coverage report:
```
npm run test-with-coverage
``