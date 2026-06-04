import * as cheerio from "cheerio";
import { type Actor, ActorSchema } from "../schemas.js";
import { actorIdFromUrl } from "../ids.js";
import { absoluteUrl, cleanText } from "./utils.js";

export function parseFavoriteActors(html: string): Actor[] {
  const $ = cheerio.load(html);
  const seen = new Set<string>();
  const actors: Actor[] = [];
  $("a[href^='/actors/']").each((_, node) => {
    const link = $(node);
    const href = link.attr("href") ?? "";
    const actorId = actorIdFromUrl(href);
    if (!actorId || seen.has(actorId)) return;
    seen.add(actorId);
    actors.push(
      ActorSchema.parse({
        actorId,
        name: cleanText(link.text()),
        url: absoluteUrl(href),
      }),
    );
  });
  return actors;
}
