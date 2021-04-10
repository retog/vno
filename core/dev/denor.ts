import * as watcher from "./src/watcher.ts";
import { exec } from "https://deno.land/x/exec/mod.ts";
//live reloading watching all files components for changes and will automatically run exec() code once there are changes
async function main() {
  console.log("Watching for file changes.");
  await watcher.watchChanges(".", async () => {
    console.log("File change detected.");
    await exec(
      "deno run --allow-read --allow-write --allow-net --unstable https://deno.land/x/vno/install/vno.ts build"
    );
  });
}
main();
