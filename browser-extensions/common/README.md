# Examples

Someone who hasn't done many other parkruns other than their own course: [Liz MARSHALL](http://www.parkrun.org.uk/results/athleteeventresultshistory/?athleteNumber=930349&eventNumber=0)

Someone who done a lot of touristing: [James WHITE](http://www.parkrun.org.uk/results/athleteeventresultshistory/?athleteNumber=556789&eventNumber=0)

Someone who has done a lot of parkruns: [Glenna GREENSLADE](http://www.parkrun.org.uk/results/athleteeventresultshistory/?athleteNumber=105134&eventNumber=0)

The Famous Cowells: [Chris COWELL](http://www.parkrun.org.uk/results/athleteeventresultshistory/?athleteNumber=11865&eventNumber=0) and [Linda COWELL](http://www.parkrun.org.uk/results/athleteeventresultshistory/?athleteNumber=18414&eventNumber=0)

People responsible for getting more involved: [Tim GP](http://www.parkrun.org.uk/results/athleteeventresultshistory/?athleteNumber=78426&eventNumber=0) & [May GP](http://www.parkrun.org.uk/winchester/results/athletehistory/?athleteNumber=81219)

Two other people [Laura COWEN](http://www.parkrun.org.uk/results/athleteeventresultshistory/?athleteNumber=1386351&eventNumber=0) & [Andrew TAYLOR](http://www.parkrun.org.uk/results/athleteeventresultshistory/?athleteNumber=1309364&eventNumber=0)

Sparse Example: [Andy STANFORD-CLARK](http://www.parkrun.org.uk/results/athleteeventresultshistory/?athleteNumber=1770518&eventNumber=0)

Founder: [Paul Sinton-Hewitt](http://www.parkrun.org.uk/results/athleteeventresultshistory/?athleteNumber=1674&eventNumber=0)

Unfeasibly large number of different parkuns, and totals in a year: [Paul FREYNE](http://www.parkrun.org.uk/results/athleteeventresultshistory/?athleteNumber=5227&eventNumber=0)

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