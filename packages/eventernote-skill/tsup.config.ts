import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    eventernote: "bin/eventernote.js",
  },
  format: ["esm"],
  dts: false,
  sourcemap: true,
  clean: true,
  target: "es2022",
  external: ["better-sqlite3", "cheerio", "zod"],
  noExternal: ["@cknl/eventernote-cli", "@cknl/eventernote-core"],
});
