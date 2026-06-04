import { fetchHtml } from "../http.js";
import { parseActorSearch } from "../parsers/actor-search.js";
import { parseEventCards, parseTotalCount } from "../parsers/event-card.js";
import { parseEventDetail } from "../parsers/event-detail.js";
import { parsePlaceDetail } from "../parsers/place-detail.js";
import { parsePlaceSearch } from "../parsers/place-search.js";
import {
  buildActorEventsUrl,
  buildActorSearchUrl,
  buildEventSearchUrl,
  buildPlaceEventsUrl,
  buildPlaceSearchUrl
} from "../urls.js";

export type HtmlFetcher = (url: string) => Promise<string>;

export function createLookupService(fetcher: HtmlFetcher = fetchHtml) {
  return {
    async searchEvents(input: Parameters<typeof buildEventSearchUrl>[0]) {
      const sourceUrl = buildEventSearchUrl(input);
      const html = await fetcher(sourceUrl);
      return { sourceUrl, totalCount: parseTotalCount(html), events: parseEventCards(html), warnings: [] as string[] };
    },
    async searchActors(input: { keyword: string; page?: number; limit?: number }) {
      const sourceUrl = buildActorSearchUrl(input);
      return { sourceUrl, actors: parseActorSearch(await fetcher(sourceUrl)), warnings: [] as string[] };
    },
    async actorEvents(input: { actorId: string; page?: number; limit?: number }) {
      const sourceUrl = buildActorEventsUrl(input);
      const html = await fetcher(sourceUrl);
      return { sourceUrl, totalCount: parseTotalCount(html), events: parseEventCards(html), warnings: [] as string[] };
    },
    async searchPlaces(input: { keyword: string; page?: number; limit?: number }) {
      const sourceUrl = buildPlaceSearchUrl(input);
      return { sourceUrl, places: parsePlaceSearch(await fetcher(sourceUrl)), warnings: [] as string[] };
    },
    async placeEvents(input: { placeId: string; page?: number; limit?: number }) {
      const sourceUrl = buildPlaceEventsUrl(input);
      const html = await fetcher(sourceUrl);
      return { sourceUrl, totalCount: parseTotalCount(html), events: parseEventCards(html), warnings: [] as string[] };
    },
    async eventDetail(input: { eventId: string }) {
      const sourceUrl = `https://www.eventernote.com/events/${input.eventId}`;
      return { sourceUrl, event: parseEventDetail(await fetcher(sourceUrl), input.eventId), warnings: [] as string[] };
    },
    async placeDetail(input: { placeId: string }) {
      const sourceUrl = `https://www.eventernote.com/places/${input.placeId}`;
      return { sourceUrl, ...parsePlaceDetail(await fetcher(sourceUrl), input.placeId), warnings: [] as string[] };
    }
  };
}
