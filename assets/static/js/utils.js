export function htmlEscape(str) {
  if (!str) return "";
  if (typeof str === "number") return str;
  if (str.replace) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/'/g, "&apos;")
      .replace(/"/g, "&quot;")
      .replace(/>/g, "&gt;")
      .replace(/</g, "&lt;");
  }
  return "";
}
