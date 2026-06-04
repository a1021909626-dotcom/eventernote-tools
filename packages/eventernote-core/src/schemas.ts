import { z } from "zod";

export const PrioritySchema = z.enum(["S+", "S", "A", "B", "C"]);
export type Priority = z.infer<typeof PrioritySchema>;

export const ActorTypeSchema = z.enum(["person", "group", "project", "unknown"]);

export const ActorSchema = z.object({
  actorId: z.string(),
  name: z.string(),
  url: z.string().url(),
  kana: z.string().optional(),
  actorType: ActorTypeSchema.default("unknown")
});
export type Actor = z.infer<typeof ActorSchema>;

export const PlaceSchema = z.object({
  placeId: z.string(),
  name: z.string(),
  url: z.string().url(),
  prefecture: z.string().optional(),
  address: z.string().optional(),
  officialSite: z.string().url().optional(),
  tips: z.string().optional(),
  mapUrl: z.string().url().optional()
});
export type Place = z.infer<typeof PlaceSchema>;

export const EventSummarySchema = z.object({
  eventId: z.string(),
  title: z.string(),
  url: z.string().url(),
  date: z.string(),
  weekday: z.string().optional(),
  openTime: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  placeId: z.string().optional(),
  venueName: z.string().optional(),
  performers: z.array(ActorSchema).default([])
});
export type EventSummary = z.infer<typeof EventSummarySchema>;

export const EventDetailSchema = EventSummarySchema.extend({
  relatedLinks: z.array(z.object({ label: z.string().optional(), url: z.string().url() })).default([]),
  descriptionText: z.string().optional()
});
export type EventDetail = z.infer<typeof EventDetailSchema>;

export const ResearchSummarySchema = z.object({
  eventId: z.string(),
  sourceUrls: z.array(z.string().url()).default([]),
  ticketUrls: z.array(z.string().url()).default([]),
  summary: z.string(),
  warnings: z.array(z.string()).default([])
});
export type ResearchSummary = z.infer<typeof ResearchSummarySchema>;

export const PreferenceSchema = z.object({
  actorId: z.string(),
  priority: PrioritySchema,
  enabled: z.boolean().default(true),
  source: z.string().default("manual"),
  notes: z.string().optional()
});
export type Preference = z.infer<typeof PreferenceSchema>;
