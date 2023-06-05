/**
 * Exports application metadata as `{ Application }`
 *
 * @file      application.meta.ts
 */

// Note that this object (`Application`) is exposed as-is at /api/meta
//
// - DO NOT add any wierd references here

const Application = {
  name: "detris",
  version: "1.0.0-alpha.1",
  repository: "https://github.com/hexagon/detris",
};

export { Application };
