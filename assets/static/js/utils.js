/**
 * Exports various utility functions
 *
 * @file static/js/utils.js
 */

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

const debounceMap = new Map();
export function debounce(id, fn, delay = 150) {
  if (debounceMap.has(id)) clearTimeout(debounceMap.get(id));
  debounceMap.set(id, setTimeout(fn, delay));
}
