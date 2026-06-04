import { z } from "zod";
import { PrioritySchema } from "@cknl/eventernote-core";

export const EventSearchInputSchema = z
  .object({
    keyword: z.string().optional(),
    date: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    area: z.string().optional(),
    prefecture: z.string().optional(),
    sort: z.enum(["event_date", "start_time"]).optional(),
    order: z.enum(["ASC", "DESC"]).optional(),
    page: z.number().int().positive().optional(),
    limit: z.number().int().min(-1).default(20),
    interestedOnly: z.boolean().default(false),
  })
  .refine((value) => !(value.area && value.prefecture), "Use either area or prefecture, not both");

export const IdOrUrlSchema = z.object({
  eventId: z.string().optional(),
  eventUrl: z.string().url().optional(),
  placeId: z.string().optional(),
  placeUrl: z.string().url().optional(),
});

export const ActorSearchInputSchema = z.object({ keyword: z.string().min(1), page: z.number().int().positive().optional() });
export const PlaceSearchInputSchema = ActorSearchInputSchema;

export const ActorEventsInputSchema = z.object({
  actorId: z.string().optional(),
  actorUrl: z.string().url().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(-1).default(20),
});

export const PlaceEventsInputSchema = z.object({
  placeId: z.string().optional(),
  placeUrl: z.string().url().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(-1).default(30),
});

export const PreferencesUpsertInputSchema = z.object({
  actorId: z.string().optional(),
  actorName: z.string().optional(),
  actorUrl: z.string().url().optional(),
  priority: PrioritySchema,
  notes: z.string().optional(),
});

export const PreferencesListInputSchema = z.object({
  dbPath: z.string(),
  enabledOnly: z.boolean().default(true),
  priority: PrioritySchema.optional(),
});

export const PreferencesDisableInputSchema = z.object({
  dbPath: z.string(),
  actorId: z.string().optional(),
  actorUrl: z.string().url().optional(),
});

export const PreferencesImportFavoritesInputSchema = z.object({
  dbPath: z.string(),
  favoriteActorsHtml: z.string().optional(),
  dryRun: z.boolean().default(true),
});
