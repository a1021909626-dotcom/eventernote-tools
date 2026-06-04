import * as cheerio from "cheerio";
import { z } from "zod";
import { placeIdFromUrl } from "../ids.js";
import { absoluteUrl, cleanText } from "./utils.js";

export const PlaceCandidateSchema = z.object({
  placeId: z.string(),
  name: z.string(),
  url: z.string().url(),
  prefecture: z.string().optional()
});
export type PlaceCandidate = z.infer<typeof PlaceCandidateSchema>;

export function parsePlaceSearch(html: string): PlaceCandidate[] {
  const $ = cheerio.load(html);
  return $(".gb_actors_list > li")
    .toArray()
    .map((node) => {
      const link = $(node).find("a[href^='/places/']").first();
      const href = link.attr("href") ?? "";
      const prefecture = cleanText(link.find(".kana").text()) || undefined;
      const name = cleanText(link.clone().children().remove().end().text());
      return PlaceCandidateSchema.parse({
        placeId: placeIdFromUrl(href) ?? "",
        name,
        url: absoluteUrl(href),
        prefecture
      });
    })
    .filter((place) => place.placeId);
}
