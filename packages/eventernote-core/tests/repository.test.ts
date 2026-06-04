import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { openEventernoteDb } from "../src/db/repository.js";

describe("repository", () => {
  it("upserts actors, preferences, and group edges", () => {
    const db = openEventernoteDb(join(mkdtempSync(join(tmpdir(), "eventernote-")), "test.db"));
    db.upsertActor({ actorId: "39397", name: "RAISE A SUILEN", url: "https://www.eventernote.com/actors/39397", actorType: "group" });
    db.upsertActor({ actorId: "16232", name: "Raychell", url: "https://www.eventernote.com/actors/16232", actorType: "person" });
    db.upsertPreference({ actorId: "39397", priority: "S+", enabled: true, source: "manual" });
    db.upsertActorGroup({ groupActorId: "39397", childActorId: "16232", source: "manual" });
    expect(db.listPreferences()).toHaveLength(1);
    expect(db.expandPreferredActorIds()).toEqual(new Set(["39397", "16232"]));
    db.close();
  });
});
