export function parseArgs(rawArgs: string[]) {
  function get(name: string): string | undefined {
    const i = rawArgs.indexOf(`--${name}`);
    return i >= 0 ? rawArgs[i + 1] : undefined;
  }
  function has(name: string): boolean {
    return rawArgs.includes(`--${name}`);
  }
  /** Collect all values for a flag that can appear multiple times. */
  function getAll(name: string): string[] {
    const results: string[] = [];
    for (let i = 0; i < rawArgs.length - 1; i++) {
      if (rawArgs[i] === `--${name}`) results.push(rawArgs[i + 1]);
    }
    return results;
  }
  return { get, has, getAll };
}
