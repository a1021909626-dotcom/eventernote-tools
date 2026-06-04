import { BASE_URL } from "./parsers/utils.js";

function dateParts(date?: string): Record<string, string> {
  if (!date) return {};
  const match = /^(\d{4})(?:-(\d{1,2})(?:-(\d{1,2}))?)?$/.exec(date);
  if (!match) throw new Error("date must be YYYY, YYYY-MM, or YYYY-MM-DD");
  const [, year, month, day] = match;
  return {
    year: String(Number(year)),
    ...(month ? { month: String(Number(month)) } : {}),
    ...(day ? { day: String(Number(day)) } : {})
  };
}

function withQuery(path: string, params: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(path, BASE_URL);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }
  return url.toString();
}

export function buildEventSearchUrl(input: {
  keyword?: string;
  date?: string;
  area?: string;
  prefecture?: string;
  sort?: "event_date" | "start_time";
  order?: "ASC" | "DESC";
  page?: number;
}): string {
  if (input.area && input.prefecture) throw new Error("Use either area or prefecture, not both");
  return withQuery("/events/search", {
    ...dateParts(input.date),
    keyword: input.keyword,
    area_id: input.area,
    prefecture_id: input.prefecture,
    sort: input.sort,
    order: input.order,
    page: input.page
  });
}

export function buildActorSearchUrl(input: { keyword: string; page?: number; limit?: number }): string {
  return withQuery("/actors/search", { keyword: input.keyword, page: input.page, limit: input.limit });
}

export function buildActorEventsUrl(input: { actorId: string; page?: number; limit?: number }): string {
  return withQuery(`/actors/${input.actorId}/events`, {
    actor_id: input.actorId,
    limit: input.limit,
    page: input.page
  });
}

export function buildPlaceSearchUrl(input: { keyword: string; page?: number; limit?: number }): string {
  return withQuery("/places/search", { keyword: input.keyword, page: input.page, limit: input.limit });
}

export function buildPlaceEventsUrl(input: { placeId: string; page?: number; limit?: number }): string {
  return withQuery(`/places/${input.placeId}/events`, {
    place_id: input.placeId,
    limit: input.limit,
    page: input.page
  });
}
