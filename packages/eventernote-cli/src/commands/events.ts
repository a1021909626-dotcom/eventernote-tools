import { createLookupService, summarizeResearch } from "@cknl/eventernote-core";
import { renderEventDetail, renderEventTable } from "../render.js";
import type { Domain } from "../types.js";

export const eventsDomain: Domain = {
  name: "events",
  description: "Query Eventernote event listings and details.",
  subcommands: [
    {
      name: "search",
      description: "Search public Eventernote event listings.",
      flags: [
        { name: "keyword", arg: "<text>", description: "Free-text keyword" },
        { name: "date", arg: "<YYYY|YYYY-MM|YYYY-MM-DD>", description: "Exact date, month, or year" },
        { name: "area", arg: "<area_id>", description: "Eventernote area ID (mutually exclusive with --prefecture)" },
        { name: "prefecture", arg: "<pref_id>", description: "Eventernote prefecture ID" },
        { name: "sort", arg: "event_date|start_time", description: "Sort field" },
        { name: "order", arg: "ASC|DESC", description: "Sort direction" },
        { name: "page", arg: "<n>", description: "Page number" },
        { name: "format", arg: "markdown|json", description: "Output format (default: markdown)" },
      ],
      async handler(get) {
        const lookup = createLookupService();
        const result = await lookup.searchEvents({
          keyword: get("keyword"),
          date: get("date"),
          area: get("area"),
          prefecture: get("prefecture"),
          sort: get("sort") as "event_date" | "start_time" | undefined,
          order: get("order") as "ASC" | "DESC" | undefined,
          page: get("page") ? Number(get("page")) : undefined,
        });
        if (get("format") === "json") {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(renderEventTable(result.events));
        }
      },
    },
    {
      name: "detail",
      description: "Fetch full event detail, optionally with participation research.",
      flags: [
        { name: "event-id", arg: "<id>", description: "Event ID" },
        { name: "event-url", arg: "<url>", description: "Event URL (alternative to --event-id)" },
        { name: "research", description: "Extract ticket URLs, price, reception window" },
        { name: "format", arg: "markdown|json", description: "Output format (default: json)" },
      ],
      async handler(get, has) {
        const eventId = get("event-id") ?? get("event-url")?.split("/").pop();
        if (!eventId) throw new Error("--event-id or --event-url is required");
        const lookup = createLookupService();
        const result = await lookup.eventDetail({ eventId });
        if (has("research")) {
          const research = summarizeResearch({
            eventId,
            descriptionText: result.event.descriptionText,
            relatedLinks: result.event.relatedLinks,
          });
          if (get("format") === "markdown") {
            console.log(renderEventDetail(result.event, research));
          } else {
            console.log(JSON.stringify({ event: result.event, research }, null, 2));
          }
        } else if (get("format") === "markdown") {
          console.log(renderEventDetail(result.event));
        } else {
          console.log(JSON.stringify(result.event, null, 2));
        }
      },
    },
  ],
};
