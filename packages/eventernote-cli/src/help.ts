import type { Domain, Subcommand } from "./types.js";

const PAD_CMD = 24;
const PAD_FLAG = 34;

export function printTopHelp(domains: Domain[]): void {
  console.log("Usage: eventernote <domain> <command> [options]\n");
  console.log("Domains:");
  for (const d of domains) {
    for (const sub of d.subcommands) {
      const cmd = `  ${d.name} ${sub.name}`;
      console.log(`${cmd.padEnd(PAD_CMD)}  ${sub.description}`);
    }
  }
  console.log("\nRun 'eventernote <domain> <command> --help' for per-command details.");
  console.log("Environment: EVENTERNOTE_DB — default SQLite database path.");
}

export function printDomainHelp(domain: Domain): void {
  console.log(`Usage: eventernote ${domain.name} <command> [options]\n`);
  console.log(`${domain.description}\n`);
  console.log("Commands:");
  for (const sub of domain.subcommands) {
    console.log(`  ${sub.name.padEnd(20)}  ${sub.description}`);
  }
}

export function printCommandHelp(domain: Domain, sub: Subcommand): void {
  console.log(`Usage: eventernote ${domain.name} ${sub.name} [options]\n`);
  console.log(`${sub.description}\n`);
  console.log("Options:");
  const allFlags = [...sub.flags, { name: "help", description: "Show this help" }];
  for (const flag of allFlags) {
    const left = `  --${flag.name}${flag.arg ? ` ${flag.arg}` : ""}`;
    const req = flag.required ? " (required)" : "";
    console.log(`${left.padEnd(PAD_FLAG)}${flag.description}${req}`);
  }
}
