import Database from "better-sqlite3";
import { type z } from "zod";
import { ActorSchema, type Preference, PreferenceSchema } from "../schemas.js";
import { SCHEMA_SQL } from "./schema.js";

type ActorInput = z.input<typeof ActorSchema>;
type PreferenceInput = z.input<typeof PreferenceSchema>;

export function openEventernoteDb(path: string) {
  const sqlite = new Database(path);
  sqlite.exec(SCHEMA_SQL);
  return {
    upsertActor(actor: ActorInput) {
      const parsed = ActorSchema.parse(actor);
      sqlite
        .prepare(
          `INSERT INTO actors (actor_id, name, url, actor_type)
           VALUES (@actorId, @name, @url, @actorType)
           ON CONFLICT(actor_id) DO UPDATE SET name=excluded.name, url=excluded.url, actor_type=excluded.actor_type`
        )
        .run(parsed);
    },
    upsertPreference(preference: PreferenceInput) {
      const parsed = PreferenceSchema.parse(preference);
      sqlite
        .prepare(
          `INSERT INTO actor_preferences (actor_id, priority, enabled, source, notes)
           VALUES (@actorId, @priority, @enabled, @source, @notes)
           ON CONFLICT(actor_id) DO UPDATE SET priority=excluded.priority, enabled=excluded.enabled, source=excluded.source, notes=excluded.notes`
        )
        .run({ ...parsed, enabled: parsed.enabled ? 1 : 0, notes: parsed.notes ?? null });
    },
    upsertActorGroup(edge: { groupActorId: string; childActorId: string; source: string }) {
      sqlite
        .prepare(
          `INSERT OR REPLACE INTO actor_groups (group_actor_id, child_actor_id, source)
           VALUES (@groupActorId, @childActorId, @source)`
        )
        .run(edge);
    },
    listPreferences(): Preference[] {
      return sqlite
        .prepare("SELECT actor_id as actorId, priority, enabled, source, notes FROM actor_preferences WHERE enabled = 1 ORDER BY priority")
        .all()
        .map((row: any) => PreferenceSchema.parse({ ...row, enabled: Boolean(row.enabled), notes: row.notes ?? undefined }));
    },
    expandPreferredActorIds(): Set<string> {
      const ids = new Set<string>();
      for (const pref of this.listPreferences()) ids.add(pref.actorId);
      const rows = sqlite
        .prepare("SELECT group_actor_id as groupActorId, child_actor_id as childActorId FROM actor_groups")
        .all() as Array<{ groupActorId: string; childActorId: string }>;
      for (const row of rows) if (ids.has(row.groupActorId)) ids.add(row.childActorId);
      return ids;
    },
    close() {
      sqlite.close();
    }
  };
}
