import { describe, expect, it } from "vitest";
import { isExpired, todayIso } from "./content";

describe("isExpired", () => {
  it("flags data whose expiry date has passed", () => {
    expect(isExpired({ expiresOn: "2026-08-01" }, "2026-11-02")).toBe(true);
  });

  it("keeps data current on its expiry date", () => {
    expect(isExpired({ expiresOn: "2026-11-02" }, "2026-11-02")).toBe(false);
  });

  it("keeps data current before its expiry date", () => {
    expect(isExpired({ expiresOn: "2027-02-01" }, "2026-11-02")).toBe(false);
  });
});

describe("todayIso", () => {
  it("formats a local date as YYYY-MM-DD", () => {
    expect(todayIso(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});
