# eventernote-tools

`eventernote-tools` 是一个面向 Eventernote 的 TypeScript/pnpm monorepo，用来把 Eventernote 的活动、艺人、场馆查询能力整理成可复用 SDK、命令行工具、Codex Skill 和本地 MCP server。

项目目标是支持两类场景：

- 日常查询：按关键词、日期、地区、艺人、场馆查询 Eventernote 公共页面，并结构化输出活动、出演者、会场和相关链接。
- 个人规划：维护本地“感兴趣艺人”优先级列表，为后续围绕锚点活动做行程候选、冲突判断和参加方式研究提供数据基础。

本项目只读取公开 Eventernote 页面和本地 SQLite 数据库。它不会修改 Eventernote 账号、报名活动、购票、提交表单，也不会写入日历。

## Package Layout

| Package | Role |
| --- | --- |
| `@cknl/eventernote-core` | 核心 SDK。负责 URL 构造、HTTP 抓取、HTML 解析、Zod schema、SQLite repository、lookup service、偏好与规划上下文辅助逻辑。 |
| `@cknl/eventernote-cli` | CLI 实现。提供 `eventernote events/actors/places/prefs ...` 命令。 |
| `@cknl/eventernote-skill` | Codex Skill 包装层。包含 `SKILL.md`、参考文档，以及对 CLI 的可执行入口包装。 |
| `@cknl/eventernote-mcp` | 本地 MCP stdio server。暴露 Eventernote 查询和偏好管理 tools，供支持 MCP 的 agent 调用。 |

核心原则：抓取、解析、数据库和数据模型只放在 `eventernote-core`；CLI、Skill、MCP 都是薄适配层，不复制业务逻辑。

## Current Capabilities

已实现的查询能力：

- `events search`：按关键词、日期、area、prefecture、排序和分页查询活动列表。
- `events detail`：读取活动详情，包含标题、日期、时间、会场、出演者、相关链接和描述文本；可做有限的参加方式摘要。
- `actors search`：按关键词搜索艺人。
- `actors events`：查询某个艺人的活动列表。
- `places search`：按关键词搜索场馆。
- `places detail`：读取场馆详情和页面上的近期活动。
- `places events`：查询某个场馆的活动列表。
- `prefs list/upsert/disable`：在本地 SQLite 中维护感兴趣艺人的优先级。

MCP 额外暴露：

- `event_search`
- `event_detail`
- `actor_search`
- `actor_events`
- `place_search`
- `place_detail`
- `place_events`
- `preferences_list`
- `preferences_upsert`
- `preferences_disable`
- `preferences_import_favorites`

当前边界：

- CLI 的 `prefs import-favorites` 还未实现；如需导入收藏艺人，使用 MCP 的 `preferences_import_favorites` 并传入页面 HTML。
- PRD 中的完整 `plan` 行程规划命令还未落地为 CLI 命令；现阶段规划逻辑应由 Skill/LLM 基于 SDK 与 MCP 返回的结构化数据编排。

## Requirements

- Node.js 22 或兼容的现代 Node 版本
- pnpm
- macOS/Linux 环境下可构建 `better-sqlite3`

安装依赖：

```bash
pnpm install
```

## Development

常用命令：

```bash
pnpm build
pnpm test
pnpm typecheck
pnpm lint
pnpm format
```

各命令含义：

| Command | Description |
| --- | --- |
| `pnpm build` | 递归构建所有 workspace package，使用 `tsup` 产出 ESM 和类型声明。 |
| `pnpm test` | 运行 Vitest 测试。测试覆盖 parser、schema、repository、preferences、lookup/context 和 MCP schema。 |
| `pnpm typecheck` | 递归运行各 package 的类型检查脚本。 |
| `pnpm lint` | 当前等同于各 package 的 TypeScript/tsup 检查。 |
| `pnpm format` | 使用 Prettier 格式化仓库文件。 |

本仓库使用 `tsconfig.base.json` 作为共享 TypeScript 配置，workspace 范围由 `pnpm-workspace.yaml` 管理。

## CLI Usage

构建后可以通过 package binary 或 workspace 命令运行 CLI：

```bash
pnpm build
pnpm --filter @cknl/eventernote-skill smoke
pnpm --filter @cknl/eventernote-cli exec eventernote --help
```

示例：

```bash
eventernote events search --keyword Roselia --date 2026-06 --format markdown
eventernote events detail --event-id 433454 --research --format markdown
eventernote actors search --keyword Raychell --format json
eventernote actors events --actor-id 12345 --page 1
eventernote places search --keyword 有明 --format markdown
eventernote places detail --place-id 987 --format json
```

偏好列表需要 SQLite 数据库路径。可以每次传 `--db`，也可以设置环境变量：

```bash
export EVENTERNOTE_DB=/path/to/eventernote.sqlite

eventernote prefs upsert --actor-id 12345 --actor-name Raychell --priority S --notes "high priority"
eventernote prefs list --priority S
eventernote prefs disable --actor-id 12345
```

优先级取值为 `S+`、`S`、`A`、`B`、`C`。

完整 CLI 参数见 [packages/eventernote-skill/references/cli-reference.md](packages/eventernote-skill/references/cli-reference.md)。

## MCP Usage

`@cknl/eventernote-mcp` 是 stdio MCP server。构建后入口为：

```bash
pnpm --filter @cknl/eventernote-mcp build
pnpm --filter @cknl/eventernote-mcp exec eventernote-mcp
```

在 MCP client 中配置时，命令通常指向构建后的 binary 或 workspace 执行命令。偏好写入类工具需要可用的 SQLite 路径；其中部分工具通过输入参数 `dbPath` 传入，`preferences_upsert` 当前读取 `EVENTERNOTE_DB`。

MCP 工具返回 JSON 文本，推荐让上层 agent 根据结构化字段生成最终说明、排序理由和行程建议。

## Skill Usage

`packages/eventernote-skill/SKILL.md` 是给 Codex/agent 使用的 Skill 描述。它定义了自然语言意图到工具调用的映射，例如：

- 查询某个日期或地区的活动。
- 查询某个艺人的活动。
- 查询场馆详情。
- 查看、追加、调整或禁用感兴趣艺人。
- 围绕锚点活动做候选搜索和冲突分析。

Skill 的输出规范是：执行阶段尽量使用紧凑 Markdown 表、CSV 或 JSON；最终面向用户的报告再包含活动名称、日期、开始时间、场馆和链接。

## Repository Structure

```text
.
├── docs/
│   └── superpowers/
│       ├── plans/
│       └── specs/
├── packages/
│   ├── eventernote-cli/
│   ├── eventernote-core/
│   ├── eventernote-mcp/
│   └── eventernote-skill/
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

开发时优先从 `eventernote-core` 增加或修改能力，再在 CLI/MCP/Skill 层暴露。新增 Eventernote 页面解析时，应补充 fixture 和 parser 测试，避免页面结构变化导致静默解析错误。
