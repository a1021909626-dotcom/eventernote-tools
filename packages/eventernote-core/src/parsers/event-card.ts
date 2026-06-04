import * as cheerio from "cheerio";
import { ActorSchema, type EventSummary, EventSummarySchema } from "../schemas.js";
import { actorIdFromUrl, eventIdFromUrl, placeIdFromUrl } from "../ids.js";
import { absoluteUrl, cleanText, parseTime } from "./utils.js";

export function parseEventCards(html: string): EventSummary[] {
  const $ = cheerio.load(html);
  return $(".gb_event_list > ul > li.clearfix")
    .toArray()
    .map((node) => {
      const li = $(node);
      const titleLink = li.find(".event h4 a[href^='/events/']").first();
      const href = titleLink.attr("href") ?? "";
      const eventId = eventIdFromUrl(href) ?? "";
      const dateText = cleanText(li.find("> .date p[class^='day']").first().text());
      const date = /\d{4}-\d{2}-\d{2}/.exec(dateText)?.[0] ?? "";
      const weekday = cleanText(li.find("> .date span[class^='wday']").first().text()) || undefined;
      const placeLink = li.find(".event .place a[href^='/places/']").first();
      const placeHref = placeLink.attr("href") ?? "";
      const timeText =
        li
          .find(".event .place")
          .toArray()
          .map((place) => cleanText($(place).text()))
          .find((text) => text.includes("開場") || text.includes("開演") || text.includes("終演")) ?? "";
      const performers = li
        .find(".actor a[href^='/actors/']")
        .toArray()
        .map((actorNode) => {
          const actorLink = $(actorNode);
          const actorHref = actorLink.attr("href") ?? "";
          return ActorSchema.parse({
            actorId: actorIdFromUrl(actorHref) ?? "",
            name: cleanText(actorLink.text()),
            url: absoluteUrl(actorHref)
          });
        })
        .filter((actor) => actor.actorId);

      return EventSummarySchema.parse({
        eventId,
        title: cleanText(titleLink.text()),
        url: absoluteUrl(href),
        date,
        weekday,
        openTime: parseTime("開場", timeText),
        startTime: parseTime("開演", timeText),
        endTime: parseTime("終演", timeText),
        placeId: placeIdFromUrl(placeHref),
        venueName: cleanText(placeLink.text()) || undefined,
        performers
      });
    })
    .filter((event) => event.eventId && event.date);
}

export function parseTotalCount(html: string): number | null {
  const text = cheerio.load(html).text();
  const match = /(\d+)件(?:のイベントが見つかりました|見つかりました)/.exec(text);
  return match ? Number.parseInt(match[1], 10) : null;
}
