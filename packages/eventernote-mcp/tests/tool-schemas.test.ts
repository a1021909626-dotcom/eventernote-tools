import { describe, expect, it } from "vitest";
import { EventSearchInputSchema, PreferencesUpsertInputSchema } from "../src/tool-schemas.js";

describe("mcp tool schemas", () => {
  it("validates event search input", () => {
    expect(EventSearchInputSchema.parse({ keyword: "raise", date: "2027-02", limit: 10 })).toMatchObject({ limit: 10 });
    expect(() => EventSearchInputSchema.parse({ area: "1", prefecture: "13" })).toThrow();
  });

  it("validates preference priority", () => {
    expect(PreferencesUpsertInputSchema.parse({ actorId: "16232", priority: "S" }).priority).toBe("S");
    expect(() => PreferencesUpsertInputSchema.parse({ actorId: "16232", priority: "P0" })).toThrow();
  });
});
