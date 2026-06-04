import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { openEventernoteDb } from "../src/db/repository.js";
import { upsertActorPreference } from "../src/services/preferences.js";

describe("preferences service", () => {
  it("upserts actor and preference together", () => {
    const dbPath = join(mkdtempSync(join(tmpdir(), "eventernote-pref-")), "test.db");
    const preference = upsertActorPreference(
      dbPath,
      { actorId: "16232", name: "Raychell", url: "https://www.eventernote.com/actors/16232" },
      { priority: "S", enabled: true, source: "manual", notes: "RAS" }
    );
    const db = openEventernoteDb(dbPath);
    expect(preference.actorId).toBe("16232");
    expect(db.listPreferences()).toEqual([{ actorId: "16232", priority: "S", enabled: true, source: "manual", notes: "RAS" }]);
    db.close();
  });
});
