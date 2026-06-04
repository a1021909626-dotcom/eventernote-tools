import { createLookupService } from "@cknl/eventernote-core";
import { renderEventTable, renderPlaceDetail, renderPlaceTable } from "../render.js";
import type { Domain } from "../types.js";

export const placesDomain: Domain = {
  name: "places",
  description: "Search venues and list their events.",
  subcommands: [
    {
      name: "search",
      description: "Find venues by keyword.",
      flags: [
        { name: "keyword", arg: "<text>", description: "Search keyword", required: true },
        { name: "format", arg: "markdown|json", description: "Output format (default: markdown)" },
      ],
      async handler(get) {
        const keyword = get("keyword");
        if (!keyword) throw new Error("--keyword is required");
        const lookup = createLookupService();
        const result = await lookup.searchPlaces({ keyword });
        if (get("format") === "json") {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(renderPlaceTable(result.places));
        }
      },
    },
    {
      name: "detail",
      description: "Fetch venue details and recent events.",
      flags: [
        { name: "place-id", arg: "<id>", description: "Place ID" },
        { name: "place-url", arg: "<url>", description: "Place URL (alternative to --place-id)" },
        { name: "format", arg: "markdown|json", description: "Output format (default: json)" },
      ],
      async handler(get) {
        const placeId = get("place-id") ?? get("place-url")?.split("/").pop();
        if (!placeId) throw new Error("--place-id or --place-url is required");
        const lookup = createLookupService();
        const result = await lookup.placeDetail({ placeId });
        if (get("format") === "markdown") {
          console.log(renderPlaceDetail(result.place, result.events));
        } else {
          console.log(JSON.stringify(result, null, 2));
        }
      },
    },
    {
      name: "events",
      description: "List all events for a venue.",
      flags: [
        { name: "place-id", arg: "<id>", description: "Place ID" },
        { name: "place-url", arg: "<url>", description: "Place URL (alternative to --place-id)" },
        { name: "page", arg: "<n>", description: "Page number" },
        { name: "limit", arg: "<n>", description: "Max results per page" },
        { name: "format", arg: "markdown|json", description: "Output format (default: markdown)" },
      ],
      async handler(get) {
        const placeId = get("place-id") ?? get("place-url")?.split("/").pop();
        if (!placeId) throw new Error("--place-id or --place-url is required");
        const lookup = createLookupService();
        const result = await lookup.placeEvents({
          placeId,
          page: get("page") ? Number(get("page")) : undefined,
          limit: get("limit") ? Number(get("limit")) : undefined,
        });
        if (get("format") === "json") {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(renderEventTable(result.events));
        }
      },
    },
  ],
};
