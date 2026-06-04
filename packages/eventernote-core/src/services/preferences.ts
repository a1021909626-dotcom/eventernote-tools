import type { z } from "zod";
import { ActorSchema, type Preference, PreferenceSchema } from "../schemas.js";
import { openEventernoteDb } from "../db/repository.js";

type ActorInput = z.input<typeof ActorSchema>;
type PreferenceInput = Omit<z.input<typeof PreferenceSchema>, "actorId">;

export function upsertActorPreference(dbPath: string, actor: ActorInput, preference: PreferenceInput): Preference {
  const db = openEventernoteDb(dbPath);
  const parsedActor = ActorSchema.parse(actor);
  const value = PreferenceSchema.parse({ actorId: parsedActor.actorId, ...preference });
  try {
    db.upsertActor(parsedActor);
    db.upsertPreference(value);
    return value;
  } finally {
    db.close();
  }
}
