import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],
  tsconfig: "tsconfig.build.json",
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  target: "es2022",
  external: ["@cknl/eventernote-core", "@modelcontextprotocol/sdk", "zod"],
});
