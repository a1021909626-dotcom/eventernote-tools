#!/usr/bin/env node
import { parseArgs } from "./args.js";
import { actorsDomain } from "./commands/actors.js";
import { eventsDomain } from "./commands/events.js";
import { placesDomain } from "./commands/places.js";
import { prefsDomain } from "./commands/prefs.js";
import { printCommandHelp, printDomainHelp, printTopHelp } from "./help.js";
import type { Domain } from "./types.js";

const DOMAINS: Domain[] = [eventsDomain, actorsDomain, placesDomain, prefsDomain];

const [, , domainName, subName, ...rest] = process.argv;
const { get, has } = parseArgs(rest);

async function main(): Promise<void> {
  if (!domainName || domainName === "--help" || domainName === "-h") {
    printTopHelp(DOMAINS);
    return;
  }

  const domain = DOMAINS.find((d) => d.name === domainName);
  if (!domain) throw new Error(`Unknown domain: ${domainName}. Run 'eventernote --help' for usage.`);

  if (!subName || subName === "--help" || subName === "-h") {
    printDomainHelp(domain);
    return;
  }

  const sub = domain.subcommands.find((s) => s.name === subName);
  if (!sub) throw new Error(`Unknown command: ${domainName} ${subName}. Run 'eventernote ${domainName} --help'.`);

  if (has("help") || has("h")) {
    printCommandHelp(domain, sub);
    return;
  }

  if (!sub.handler) {
    printCommandHelp(domain, sub);
    throw new Error(`'eventernote ${domainName} ${subName}' is not yet implemented.`);
  }

  await sub.handler(get, has);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
