import * as cheerio from "cheerio";
import { PlaceSchema } from "../schemas.js";
import { parseEventCards } from "./event-card.js";
import { absoluteUrl, BASE_URL, cleanHtmlText, cleanText } from "./utils.js";

export function parsePlaceDetail(html: string, placeId: string) {
  const $ = cheerio.load(html);
  const rows = new Map<string, cheerio.Cheerio<any>>();
  $(".gb_place_detail_table table tr").each((_, row) => {
    const cells = $(row).find("td");
    const label = cleanText(cells.eq(0).text());
    if (label) rows.set(label, cells.eq(1));
  });
  const addressCell = rows.get("所在地");
  const official = rows.get("公式サイト")?.find("a[href]").first().attr("href");
  const mapUrl = addressCell?.find("a[href]").first().attr("href");
  return {
    place: PlaceSchema.parse({
      placeId,
      name: cleanText($(".gb_place_detail_title h2").first().text()),
      url: `${BASE_URL}/places/${placeId}`,
      address: cleanText(addressCell?.text() ?? "") || undefined,
      officialSite: official ? absoluteUrl(official) : undefined,
      tips: cleanHtmlText(rows.get("会場TIPS")?.html() ?? undefined) || undefined,
      mapUrl: mapUrl ? new URL(mapUrl).toString() : undefined
    }),
    events: parseEventCards(html)
  };
}
