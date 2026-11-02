import { describe, expect, it } from "vitest";
import { buildManifest, fillServiceWorker, normalizeBase } from "./precache-integration.mjs";

describe("normalizeBase", () => {
  it.each([
    ["/merobaron", "/merobaron/"],
    ["/merobaron/", "/merobaron/"],
    ["/", "/"],
  ])("normalizes %s", (base, expected) => {
    expect(normalizeBase(base)).toBe(expected);
  });
});

describe("buildManifest", () => {
  it("maps built files under the base and the page to the base itself", () => {
    const files = ["index.html", "_astro/app.abc.js", "_astro/app.abc.js.map", "favicon.svg", "sw.js"];
    expect(buildManifest(files, "/merobaron")).toEqual([
      "/merobaron/",
      "/merobaron/_astro/app.abc.js",
      "/merobaron/favicon.svg",
    ]);
  });
});

describe("fillServiceWorker", () => {
  it("injects the manifest and a version that changes with it", () => {
    const source = 'const PRECACHE = "__PRECACHE_MANIFEST__";\nconst CACHE = "merobaron-__CACHE_VERSION__";';
    const a = fillServiceWorker(source, ["/merobaron/"]);
    const b = fillServiceWorker(source, ["/merobaron/", "/merobaron/x.js"]);
    expect(a).toContain('const PRECACHE = ["/merobaron/"];');
    expect(a).not.toContain("__CACHE_VERSION__");
    const version = (text) => text.match(/merobaron-(\w+)/)[1];
    expect(version(a)).not.toBe(version(b));
  });
});
