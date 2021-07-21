import * as fs from "https://deno.land/std@0.99.0/fs/mod.ts";
import * as path from "https://deno.land/std@0.99.0/path/mod.ts";
import { genHtml } from "./html.ts";
import { getComponent, getComponents } from "./components.ts";
import { getAssets } from "./assets.ts";

/**
 * Statically generate project.
 */
export const generate = async (
  mode: "production" | "development" = "development",
  reloadPort?: number,
) => {
  const start = Date.now();

  const pagesDir = path.join(Deno.cwd(), "pages");
  const distDir = mode === "production"
    ? path.join(Deno.cwd(), "dist")
    : path.join(Deno.cwd(), ".vno", "dist");

  // empty output folder
  await fs.emptyDir(distDir);

  // get pieces
  const cmps = await getComponents();
  const assets = await getAssets([/\.css$/i]);

  const promises: Promise<void>[] = [];
  for await (
    const file of fs.walk(pagesDir, {
      exts: ["vue"],
    })
  ) {
    const parsed = path.parse(file.path);
    const name = parsed.name;
    const relPath = parsed.dir.replace(pagesDir, "");

    // dynamic page
    if (name.match(/\[.*\]/)) {
      promises.push(
        (async () => {
          const cmp = await getComponent(file.path);

          if (!cmp.exports.getStaticPaths) {
            throw Error("missing getStaticPaths");
          }

          // get the paths
          const pathsData = await Promise.resolve(
            cmp.exports.getStaticPaths({ fetch }),
          );

          const jsName = Math.random().toString(36);

          const pathData = pathsData[0];
          // get the page id
          const id = pathData.params[name.slice(1, name.length - 1)]
            .toString();
          // create an output location using the id
          const output = path.join(distDir, relPath, id, "index.html");
          await genHtml({
            entry: file.path,
            output,
            pathData,
            cmps,
            assets,
            reload: mode === "development",
            reloadPort,
            jsName,
          });

          const promises: Promise<void>[] = [];
          for (let i = 1; i < pathsData.length; i++) {
            const pathData = pathsData[i];
            // get the page id
            const id = pathData.params[name.slice(1, name.length - 1)]
              .toString();
            // create an output location using the id
            const output = path.join(distDir, relPath, id, "index.html");
            promises.push(
              genHtml({
                entry: file.path,
                output,
                pathData,
                cmps,
                assets,
                reload: mode === "development",
                reloadPort,
                jsName,
              }),
            );
          }

          await Promise.all(promises);
        })(),
      );
    } else {
      // named page

      promises.push(
        (async () => {
          // create an output location based on the name
          const output = path.join(
            distDir,
            relPath,
            name == "index" ? "index.html" : `${name}/index.html`,
          );

          await genHtml({
            entry: file.path,
            output: output,
            cmps,
            assets,
            reload: mode === "development",
            reloadPort,
          });
        })(),
      );
    }
  }
  await Promise.all(promises);

  console.log(`build took ${Date.now() - start}ms`);
};

if (import.meta.main) {
  generate("production");
}
