# Eventernote CLI Reference

Binary: `eventernote` (provided by `packages/eventernote-skill`; implementation lives in `packages/eventernote-cli`)

---

## events search

Search public Eventernote event listings.

```bash
eventernote events search \
  [--keyword <text>]          # free-text keyword
  [--date <YYYY|YYYY-MM|YYYY-MM-DD>]  # exact date, month, or year
  [--area <area_id>]          # Eventernote area ID (mutually exclusive with --prefecture)
  [--prefecture <pref_id>]    # Eventernote prefecture ID
  [--sort event_date|start_time]
  [--order ASC|DESC]
  [--page <n>]
  [--format markdown|json|csv]
```

Output columns: `id | date | start | title | venue | performers`

---

## events detail

Fetch full event detail, optionally with participation research.

```bash
eventernote events detail \
  --event-id <id>             # or --event-url <url>
  [--research]                # extract ticket URLs, price, reception window
  [--format markdown|json]
```

---

## actors search

Find actors by keyword.

```bash
eventernote actors search \
  --keyword <text>
  [--page <n>]
  [--format markdown|json]
```

---

## actors events

List all events for one actor.

```bash
eventernote actors events \
  --actor-id <id>             # or --actor-url <url>
  [--page <n>]
  [--all-pages]
  [--format markdown|json]
```

---

## places search

Find venues by keyword.

```bash
eventernote places search \
  --keyword <text>
  [--format markdown|json]
```

---

## places detail

Fetch venue details and recent events.

```bash
eventernote places detail \
  --place-id <id>             # or --place-url <url>
  [--format markdown|json]
```

---

## places events

List all events for a venue.

```bash
eventernote places events \
  --place-id <id>
  [--page <n>]
  [--all-pages]
  [--format markdown|json]
```

---

## prefs list

List locally stored interested actors.

```bash
eventernote prefs list \
  [--db <path>]               # default: $EVENTERNOTE_DB
  [--priority S+|S|A|B|C]
  [--format markdown|json]
```

---

## prefs upsert

Add or update an actor preference.

```bash
eventernote prefs upsert \
  --actor-id <id>             # or --actor-url <url>
  --priority S+|S|A|B|C
  [--notes <text>]
  [--db <path>]
```

---

## prefs disable

Disable an interested actor without deleting history.

```bash
eventernote prefs disable \
  --actor-id <id>
  [--db <path>]
```

---

## prefs import-favorites

Import Eventernote favorite actors from a manually logged-in browser session.

```bash
eventernote prefs import-favorites \
  --browser playwright        # open browser; ask user to log in
  [--dry-run]                 # show candidates without writing to DB
  [--db <path>]
```

Safety: read-only. The CLI must NOT click save/update/delete or modify account data.

---

## plan

Plan a trip from anchor event(s), finding nearby additions within a date window.

```bash
eventernote plan \
  --anchor-event <id>         # repeat for multiple anchors: --anchor-event <id2>
  [--anchor-url <url>]
  [--buffer-before <days>]    # default: 1
  [--buffer-after <days>]     # default: 1
  [--area <id>]               # override region
  [--format markdown|json]
  [--db <path>]
```

Output report sections: Summary / Anchor Events / Recommendations /
Conflicts / Cross-Region Candidates / Research / Open Questions.

---

## Environment Variables

| Variable | Description |
| --- | --- |
| `EVENTERNOTE_DB` | Default SQLite database path |

---

## Implementation Status

| Command | Status |
| --- | --- |
| `events search` | ✅ Implemented |
| `events detail` | ✅ Implemented |
| `actors search` | ✅ Implemented |
| `actors events` | ✅ Implemented |
| `places search` | ✅ Implemented |
| `places detail` | ✅ Implemented |
| `places events` | ✅ Implemented |
| `prefs list` | ✅ Implemented |
| `prefs upsert` | ✅ Implemented |
| `prefs disable` | ✅ Implemented |
| `prefs import-favorites` | 🔲 Planned (use MCP `preferences_import_favorites`) |
| `plan` | 🔲 Planned |

All capabilities are available now via the MCP server (`eventernote-mcp`).
