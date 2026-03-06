# playwright-testing
Testing the playwright testing framework

## When a UI test fails (headless)

On failure, Playwright writes debugging artifacts (all gitignored):

- **Screenshots**: `test-results/` — one screenshot per failed test.
- **Page HTML**: `playwright-debug/` — one `.html` file per failed test (sanitised test title as filename).

In CI, the same artifacts are uploaded as `ui-tests-screenshots-*` and `ui-tests-html-*` when the Playwright job fails.
