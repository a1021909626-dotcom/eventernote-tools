# Planning Workflow Reference

This document describes the LLM-orchestrated trip-planning workflow in detail.
The LLM (not the SDK) decides recommendations and explanations.
The SDK provides data retrieval and structural signals.

---

## Invocation

Triggered by patterns like:
- `我确定参加[活动名称], 规划其他临近活动, [buffer天数]`
- `围绕[活动名称]找[同地区/跨区域]活动`
- `eventernote plan --anchor-event <id> --buffer-before 1 --buffer-after 1`

---

## Step-by-Step

### 1. Resolve Anchor Events

```
event_detail(eventId)  →  { date, prefecture, areaId, performers, startTime, endTime }
```

For each anchor, note: `date`, `placeId`, and region metadata.

### 2. Build Date Window

```ts
buildDateWindow(anchorDates, bufferDays)
// e.g. anchor = 2025-12-07, buffer = 1  →  { from: "2025-12-06", to: "2025-12-08" }
```

### 3. Search Same-Prefecture Candidates

```
event_search({ date: from..to, prefecture: anchorPrefecture, limit: -1 })
```

Deduplicate against anchor event IDs.

### 4. Search Same-Area Candidates

```
event_search({ date: from..to, area: anchorAreaId, limit: -1 })
```

Add any new IDs not already in the same-prefecture list.

### 5. Match Against Preferences

```
preferences_list({ dbPath, enabledOnly: true })
```

For each candidate event, check `performers` against preference `actorId` set
(expanded with `expandPreferredActorIds()` to include group children).

Priority tiers: `S+` > `S` > `A` > `B` > `C`.

Display group matches as `GroupName (via MemberName)`.

### 6. Detect Time Conflicts

```ts
detectConflict(anchor, candidate)
// returns true when start/end windows overlap
// if endTime is missing, default duration = 2 hours
// if startTime is missing, mark confidence = low
```

Conflicting candidates → "Conflicts" section (do not include in recommendations).

### 7. Identify Cross-Region Candidates

```
event_search({ date: from..to, limit: -1 })  // no region filter
```

Events not in the same prefecture/area that match `S+` or `S` priority actors
→ separate "Cross-Region High-Priority Candidates" section.
The user decides whether cross-region travel is worthwhile.

### 8. Run Participation Research

For each anchor and top recommended candidate:

```ts
const detail = await event_detail(eventId)
const research = summarizeResearch({
  eventId,
  descriptionText: detail.event.descriptionText,
  relatedLinks: detail.event.relatedLinks,
})
// returns: { ticketUrls, summary (price + reception), warnings }
```

Research is bounded: Eventernote detail page + first-level related links only.
Do NOT follow unlimited links or purchase/submit anything.

### 9. Build Report

Markdown report structure:

```markdown
## Summary
[1-3 sentences: window, anchor count, recommendation count]

## Anchor Events
| date | start | title | venue | url |

## Recommended Nearby Additions
| priority | date | start | title | venue | matched actors | region | reason |

## Time Conflicts and Rejections
| date | start-end | title | conflict reason |

## Cross-Region High-Priority Candidates
| date | start | title | venue | region | priority | note: user must decide |

## Participation Research
### [Event Title]
- Ticket URLs: ...
- Price: ...
- Reception: ...
- Warnings: ...

## Open Questions / Manual Confirmation Needed
- [items requiring user action]

## Source Links
- [Eventernote URLs used]
```

JSON output (`--format json`) should mirror the same sections as structured objects.

---

## Context Signals for LLM Recommendation

The SDK surfaces the following signals. The LLM uses them to decide what to recommend and why:

| Signal | Source | Meaning |
| --- | --- | --- |
| `priority` | `preferences_list` | Actor importance tier |
| `samePrefecture` | compare `prefecture` | Strongest region match |
| `sameArea` | compare `areaId` | Acceptable nearby region |
| `hasConflict` | `detectConflict` | Cannot attend with anchor |
| `startTime` | `event_detail` | Schedule position |
| `ticketUrls` | `summarizeResearch` | Actionable participation link exists |
| `warnings` | parser + research | Data confidence issues |

---

## Priority Scale

| Tier | Meaning |
| --- | --- |
| `S+` | Must-watch; cross-region travel is worth considering |
| `S` | High interest; same-region attendance strongly preferred |
| `A` | Interested; attend if convenient |
| `B` | Mild interest; include only if no schedule conflicts |
| `C` | Low priority; informational only |

---

## Region Matching Rules

1. **Same prefecture**: primary match, always include in candidate pool.
2. **Same Eventernote area**: acceptable, include with area label.
3. **Other region**: only surface in cross-region section for `S+`/`S` actors.

---

## Conflict Defaults

- No `endTime`: assume 2-hour duration.
- No `startTime`: mark as "time unknown"; do not auto-reject but note low confidence.
- Cross-region events: never auto-include in main itinerary even if no conflict.
