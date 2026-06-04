import {
  actorIdFromUrl,
  createLookupService,
  openEventernoteDb,
  parseFavoriteActors,
  placeIdFromUrl,
} from "@cknl/eventernote-core";
import {
  ActorEventsInputSchema,
  ActorSearchInputSchema,
  EventSearchInputSchema,
  IdOrUrlSchema,
  PlaceEventsInputSchema,
  PlaceSearchInputSchema,
  PreferencesDisableInputSchema,
  PreferencesImportFavoritesInputSchema,
  PreferencesListInputSchema,
  PreferencesUpsertInputSchema,
} from "./tool-schemas.js";

export function createEventernoteTools() {
  const lookup = createLookupService();
  return {
    async event_search(input: unknown) {
      const parsed = EventSearchInputSchema.parse(input);
      return await lookup.searchEvents(parsed);
    },
    async event_detail(input: unknown) {
      const parsed = IdOrUrlSchema.parse(input);
      const eventId = parsed.eventId ?? parsed.eventUrl?.split("/").pop();
      if (!eventId) throw new Error("eventId or eventUrl is required");
      return await lookup.eventDetail({ eventId });
    },
    async actor_search(input: unknown) {
      return await lookup.searchActors(ActorSearchInputSchema.parse(input));
    },
    async actor_events(input: unknown) {
      const parsed = ActorEventsInputSchema.parse(input);
      const actorId = parsed.actorId ?? (parsed.actorUrl ? actorIdFromUrl(parsed.actorUrl) : undefined);
      if (!actorId) throw new Error("actorId or actorUrl is required");
      return await lookup.actorEvents({ actorId, page: parsed.page, limit: parsed.limit });
    },
    async place_search(input: unknown) {
      return await lookup.searchPlaces(PlaceSearchInputSchema.parse(input));
    },
    async place_detail(input: unknown) {
      const parsed = IdOrUrlSchema.parse(input);
      const placeId = parsed.placeId ?? (parsed.placeUrl ? placeIdFromUrl(parsed.placeUrl) : undefined);
      if (!placeId) throw new Error("placeId or placeUrl is required");
      return await lookup.placeDetail({ placeId });
    },
    async place_events(input: unknown) {
      const parsed = PlaceEventsInputSchema.parse(input);
      const placeId = parsed.placeId ?? (parsed.placeUrl ? placeIdFromUrl(parsed.placeUrl) : undefined);
      if (!placeId) throw new Error("placeId or placeUrl is required");
      return await lookup.placeEvents({ placeId, page: parsed.page, limit: parsed.limit });
    },
    async preferences_list(input: unknown) {
      const parsed = PreferencesListInputSchema.parse(input);
      const db = openEventernoteDb(parsed.dbPath);
      try {
        return { preferences: db.listPreferences().filter((pref) => !parsed.priority || pref.priority === parsed.priority) };
      } finally {
        db.close();
      }
    },
    async preferences_upsert(input: unknown) {
      const parsed = PreferencesUpsertInputSchema.parse(input);
      const actorId = parsed.actorId ?? (parsed.actorUrl ? actorIdFromUrl(parsed.actorUrl) : undefined);
      if (!actorId) throw new Error("actorId or actorUrl is required");
      const dbPath = process.env.EVENTERNOTE_DB;
      if (!dbPath) throw new Error("EVENTERNOTE_DB is required for preference updates");
      const db = openEventernoteDb(dbPath);
      try {
        db.upsertPreference({ actorId, priority: parsed.priority, enabled: true, source: "manual", notes: parsed.notes });
        return { actorId, priority: parsed.priority, enabled: true };
      } finally {
        db.close();
      }
    },
    async preferences_disable(input: unknown) {
      const parsed = PreferencesDisableInputSchema.parse(input);
      const actorId = parsed.actorId ?? (parsed.actorUrl ? actorIdFromUrl(parsed.actorUrl) : undefined);
      if (!actorId) throw new Error("actorId or actorUrl is required");
      const db = openEventernoteDb(parsed.dbPath);
      try {
        db.upsertPreference({ actorId, priority: "C", enabled: false, source: "manual" });
        return { actorId, enabled: false };
      } finally {
        db.close();
      }
    },
    async preferences_import_favorites(input: unknown) {
      const parsed = PreferencesImportFavoritesInputSchema.parse(input);
      if (!parsed.favoriteActorsHtml) {
        return { dryRun: parsed.dryRun, imported: 0, candidates: [], warnings: ["favoriteActorsHtml is required unless browser integration is supplied by the caller"] };
      }
      const candidates = parseFavoriteActors(parsed.favoriteActorsHtml);
      if (parsed.dryRun) return { dryRun: true, imported: 0, candidates, warnings: [] };
      const db = openEventernoteDb(parsed.dbPath);
      try {
        for (const actor of candidates) {
          db.upsertActor(actor);
          db.upsertPreference({ actorId: actor.actorId, priority: "C", enabled: true, source: "eventernote_favorites" });
        }
        return { dryRun: false, imported: candidates.length, candidates, warnings: [] };
      } finally {
        db.close();
      }
    },
  };
}
