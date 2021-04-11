// import * as watcher from "./src/watcher.ts";
import { exec } from "https://deno.land/x/exec/mod.ts";
//live reloading watching all files components for changes and will automatically run exec() code once there are changes

async function watchChanges(
  path: string,
  onChange: Function,
) {
  console.log("invoking watchChanges");
  const watcher = Deno.watchFs(path);
  //watches a path which (currently not given specific path)
  for await (const event of watcher) {
    console.log(event);
    if (event.kind === "modify") {
      await onChange();
      return;
    }
    return;
  }
}

//denon/deno command will stop working after a couple rebuilds because needs dtime to finish bundling and compiling process
async function main() {
  console.log("Watching for file changes.");

  return await watchChanges(".", async () => {
    console.log("File change detected.");
    console.log("updated denor");
    // Update the vno link to deno 3rd party link when all work is complete and uploaded.
    await exec(
      "deno run --allow-read --allow-write --allow-net --unstable ./install/vno.ts build --ssr",
    );
    await exec(
      `deno run --allow-read --allow-run --allow-write --allow-net --unstable ./core/dev/denor.ts`,
    );
  });
}
main();
