import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createLookupService } from "../src/services/lookup.js";
import { buildActorEventsUrl, buildEventSearchUrl, buildPlaceEventsUrl } from "../src/urls.js";

const fixture = (name: string) => readFileSync(join(import.meta.dirname, "fixtures", name), "utf8");

describe("url builders", () => {
  it("builds event search URLs and avoids area/prefecture collision", () => {
    expect(buildEventSearchUrl({ keyword: "raise", date: "2027-02-02", area: "1" })).toBe(
      "https://www.eventernote.com/events/search?year=2027&month=2&day=2&keyword=raise&area_id=1"
    );
    expect(() => buildEventSearchUrl({ area: "1", prefecture: "13" })).toThrow("Use either area or prefecture");
  });

  it("builds actor and place events URLs", () => {
    expect(buildActorEventsUrl({ actorId: "16232", page: 2, limit: 20 })).toBe(
      "https://www.eventernote.com/actors/16232/events?actor_id=16232&limit=20&page=2"
    );
    expect(buildPlaceEventsUrl({ placeId: "11572", page: 2, limit: 30 })).toBe(
      "https://www.eventernote.com/places/11572/events?place_id=11572&limit=30&page=2"
    );
  });
});

describe("lookup service", () => {
  it("parses actor events through an injectable fetcher", async () => {
    const lookup = createLookupService(async () => fixture("actor-events-raychell-page2.html"));
    const result = await lookup.actorEvents({ actorId: "16232", page: 2, limit: 20 });
    expect(result.totalCount).toBe(303);
    expect(result.events[0]?.eventId).toBe("476872");
  });
});
