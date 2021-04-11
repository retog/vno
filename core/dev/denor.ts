// import * as watcher from "./src/watcher.ts";
import { exec } from "https://deno.land/x/exec/mod.ts";
//live reloading watching all files components for changes and will automatically run exec() code once there are changes

// emitter.on("SayHello", (to: string) => {
//   if (!to) {
//     console.log("hello!");
//   } else {
//     console.log("hello" + to + "!");
//   }
// });

// emitter.emit("SayHello");
// // hello!
// emitter.emit("SayHello", " world");
// // hello world!
// emitter.emit("SayHello", ", again, world");
// hello, again, world!
async function watchChanges(
  path: string,
  onChange: Function,
) {
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

async function main() {
  console.log("Watching for file changes.");
  await watchChanges(".", async () => {
    console.log("File change detected.");
    console.log("updated denor");
    // Update the vno link to deno 3rd party link when all work is complete
    await exec(
      "deno run --allow-read --allow-write --allow-net --unstable https://raw.githubusercontent.com/oslabs-beta/vno/reloading/install/vno.ts build --ssr",
    );
    await exec(
      `deno run --allow-read --allow-run --allow-write --allow-net --unstable https://raw.githubusercontent.com/oslabs-beta/vno/reloading/core/dev/denor.ts`,
    );
  });
}
main();
