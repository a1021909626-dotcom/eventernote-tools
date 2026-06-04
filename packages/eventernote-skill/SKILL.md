---
name: eventernote
description: >
  Eventernote lookup and trip-planning skill. Use when the user asks about
  Japanese live events, interested actors/actresses, venue details, ticket
  research, or trip itinerary planning around specific anchor events.
  Supports natural-language invocations in Chinese or Japanese.
  Do NOT use for writing to Lark/calendar, booking tickets, modifying
  Eventernote account data, or tasks unrelated to Eventernote.
---

# Eventernote

Skill for querying Eventernote events, actors, and places; managing local
interested-actor preferences; and planning event trips from anchor events.

## Trigger Patterns

| 用户意图 | 映射动作 |
| --- | --- |
| 查询[地区/日期]的感兴趣活动 | `event_search` → 按偏好过滤 |
| 查询[活动名称/日期]详情 | `event_search` + `event_detail` |
| 查询[艺人名称]的活动 | `actor_search` + `actor_events` |
| 我确定参加[活动名称]，规划临近活动 | Planning Workflow |
| 查询[场馆名称] | `place_search` + `place_detail` |
| 感兴趣列表追加/调整[艺人名称]，优先级[S+/S/A/B/C] | `actor_search` + `preferences_upsert` |
| 查询[活动]怎么买票/怎么参加 | `event_detail` + `summarizeResearch` |
| 围绕[活动名称]找同地区活动 | `event_detail` + `event_search`（同都道府县） |
| 查看/列出感兴趣列表 | `preferences_list` |
| 移除/禁用[艺人名称] | `preferences_disable` |
| 导入Eventernote收藏艺人 | `preferences_import_favorites` (dry-run first) |

## Available Tools

MCP tools (preferred): `event_search` · `event_detail` · `actor_search` · `actor_events` · `place_search` · `place_detail` · `place_events` · `preferences_list` · `preferences_upsert` · `preferences_disable` · `preferences_import_favorites`

CLI fallback: `eventernote events search` · `eventernote actors search`

Keywords: `mcp-tools`, `cli`. Details: `references/cli-reference.md`.

## Output Discipline

- **Execution**: compact Markdown tables, CSV, or JSON; prefer IDs over names.
- **Final output**: include names, dates, start times, venue, and links.
- Let the LLM produce recommendations and explanations from structured data.

## Planning Workflow

Resolves anchor event(s), expands a date window, searches same-prefecture and
same-area candidates, ranks by actor priority, detects conflicts, isolates
cross-region high-priority candidates, runs participation research, and
produces a Markdown report.

Keywords: `planning`, `anchor`, `buffer`, `conflict`, `cross-region`, `research`.
Details: `references/planning-workflow.md`.

## Error Handling

- Network failure: show URL + retry guidance.
- Layout change: return partial data + `warnings[]`.
- Ambiguous entity: require explicit selection before proceeding.
- Missing times: mark schedule confidence as low; default conflict window = 2 h.
- Empty results: not an error — report "no results found".
- Favorite import without login: ask user to log in manually, then retry.

## References

- `references/cli-reference.md` — full CLI flags, MCP parameters, implementation status
- `references/planning-workflow.md` — step-by-step orchestration, signals, report schema
