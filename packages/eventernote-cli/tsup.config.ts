import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli.ts"],
  tsconfig: "tsconfig.build.json",
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  target: "es2022",
  external: ["@cknl/eventernote-core"],
});
