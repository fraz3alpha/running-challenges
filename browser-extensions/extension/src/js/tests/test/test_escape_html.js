const assert = require("assert");
const { escape_html } = require("../../lib/escape-html.js");

describe("escape_html", function () {
  it("escapes angle brackets", function () {
    assert.strictEqual(
      escape_html("<script>alert(1)</script>"),
      "&lt;script&gt;alert(1)&lt;/script&gt;",
    );
  });

  it("escapes ampersand and quotes", function () {
    assert.strictEqual(
      escape_html("\"foo\" & 'bar'"),
      "&quot;foo&quot; &amp; &#039;bar&#039;",
    );
  });

  it("returns empty string for null", function () {
    assert.strictEqual(escape_html(null), "");
  });

  it("returns empty string for undefined", function () {
    assert.strictEqual(escape_html(undefined), "");
  });

  it("converts non-strings to string then escapes", function () {
    assert.strictEqual(escape_html(1), "1");
    assert.strictEqual(escape_html("<"), "&lt;");
  });

  it("leaves safe text unchanged", function () {
    assert.strictEqual(
      escape_html("Parsing Athlete Info"),
      "Parsing Athlete Info",
    );
  });
});
