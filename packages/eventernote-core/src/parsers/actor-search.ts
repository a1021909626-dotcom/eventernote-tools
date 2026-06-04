import * as cheerio from "cheerio";
import { ActorSchema, type Actor } from "../schemas.js";
import { actorIdFromUrl } from "../ids.js";
import { absoluteUrl, cleanText } from "./utils.js";

export function parseActorSearch(html: string): Actor[] {
  const $ = cheerio.load(html);
  return $(".gb_actors_list > li")
    .toArray()
    .map((node) => {
      const li = $(node);
      const link = li.find("a[href^='/actors/']").first();
      const href = link.attr("href") ?? "";
      return ActorSchema.parse({
        actorId: actorIdFromUrl(href) ?? "",
        name: cleanText(link.clone().children().remove().end().text()),
        url: absoluteUrl(href),
        kana: cleanText(li.find(".kana").text()) || undefined
      });
    })
    .filter((actor) => actor.actorId);
}
