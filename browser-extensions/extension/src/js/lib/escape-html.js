function escape_html(unsafe) {
  if (unsafe == null) return "";
  const s = String(unsafe);
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

if (typeof window !== "undefined") {
  window.escape_html = escape_html;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { escape_html };
}
