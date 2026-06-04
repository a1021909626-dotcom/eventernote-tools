import { describe, expect, it } from "vitest";
import { ActorSchema, EventSummarySchema, PrioritySchema } from "../src/schemas.js";
import { actorIdFromUrl, eventIdFromUrl, placeIdFromUrl } from "../src/ids.js";

describe("schemas", () => {
  it("accepts the configured priority scale", () => {
    expect(PrioritySchema.parse("S+")).toBe("S+");
    expect(() => PrioritySchema.parse("P0")).toThrow();
  });

  it("validates compact event summaries", () => {
    const event = EventSummarySchema.parse({
      eventId: "433454",
      title: "RAISE MY CATHARSIS",
      url: "https://www.eventernote.com/events/433454",
      date: "2025-12-07",
      startTime: "17:35",
      performers: [{ actorId: "39397", name: "RAISE A SUILEN", url: "https://www.eventernote.com/actors/39397" }]
    });
    expect(event.eventId).toBe("433454");
    expect(event.performers[0]?.actorId).toBe("39397");
  });

  it("extracts ids from Eventernote URLs", () => {
    expect(actorIdFromUrl("/actors/Raychell/16232")).toBe("16232");
    expect(actorIdFromUrl("/actors/16232")).toBe("16232");
    expect(eventIdFromUrl("/events/433454")).toBe("433454");
    expect(placeIdFromUrl("/places/11572/events?place_id=11572")).toBe("11572");
  });

  it("keeps public counters out of compact event summaries", () => {
    const event = EventSummarySchema.parse({
      eventId: "1",
      title: "x",
      url: "https://www.eventernote.com/events/1",
      date: "2026-01-01",
      participantCount: 10
    });
    const actor = ActorSchema.parse({
      actorId: "1",
      name: "x",
      url: "https://www.eventernote.com/actors/1",
      eventCount: 10
    });
    expect("participantCount" in event).toBe(false);
    expect("eventCount" in actor).toBe(false);
  });
});
