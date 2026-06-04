import * as cheerio from "cheerio";
import { ActorSchema, type EventDetail, EventDetailSchema } from "../schemas.js";
import { actorIdFromUrl, placeIdFromUrl } from "../ids.js";
import { absoluteUrl, BASE_URL, cleanText, parseTime } from "./utils.js";

function eventTableMap($: cheerio.CheerioAPI): Map<string, cheerio.Cheerio<any>> {
  const rows = new Map<string, cheerio.Cheerio<any>>();
  $(".gb_events_info_table table tr").each((_, row) => {
    const cells = $(row).find("td");
    const label = cleanText(cells.eq(0).text());
    if (label) rows.set(label, cells.eq(1));
  });
  return rows;
}

export function parseEventDetail(html: string, eventId: string): EventDetail {
  const $ = cheerio.load(html);
  const rows = eventTableMap($);
  const title = cleanText($(".gb_events_detail_title h2").first().text());
  const dateText = cleanText(rows.get("開催日時")?.text() ?? "");
  const date = /\d{4}-\d{2}-\d{2}/.exec(dateText)?.[0] ?? "";
  const weekday = /[\(（]([^()（）]+)[\)）]/.exec(dateText)?.[1];
  const timeText = cleanText(rows.get("時間")?.text() ?? "");
  const placeLink = rows.get("開催場所")?.find("a[href^='/places/']").first();
  const relatedLinks = (rows.get("関連リンク")?.find("a[href]").toArray() ?? []).map((node) => ({
    url: absoluteUrl($(node).attr("href") ?? ""),
    label: cleanText($(node).text()) || undefined
  }));
  const performers = (rows.get("出演者")?.find("a[href^='/actors/']").toArray() ?? []).map((node) => {
    const href = $(node).attr("href") ?? "";
    return ActorSchema.parse({
      actorId: actorIdFromUrl(href) ?? "",
      name: cleanText($(node).text()),
      url: absoluteUrl(href)
    });
  });
  const descriptionText = cleanText(
    $(".gb_events_info_table table tr")
      .toArray()
      .map((row) => $(row).find("td").eq(1).text())
      .find((text) => text.includes("受付期間") || text.includes("チケット")) ?? ""
  );

  return EventDetailSchema.parse({
    eventId,
    title,
    url: `${BASE_URL}/events/${eventId}`,
    date,
    weekday,
    openTime: parseTime("開場", timeText),
    startTime: parseTime("開演", timeText),
    endTime: parseTime("終演", timeText),
    placeId: placeIdFromUrl(placeLink?.attr("href") ?? ""),
    venueName: cleanText(placeLink?.text() ?? "") || undefined,
    performers,
    relatedLinks,
    descriptionText
  });
}
