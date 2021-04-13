import { exec } from "../utils/deps.ts";

async function watchChanges(
  path: string,
  onChange: () => void, //typescript for callback that doesnt return anything
) {
  const watcher = Deno.watchFs(path);
  //watches a path which (currently not given specific path)
  for await (const event of watcher) {
    if (event.kind === "modify") {
      await onChange();
      return;
    }
    return;
  }
}

//live reloading watching all files components for changes and will automatically run exec() code once there are changes
interface watchOptions {
  ssr?: boolean;
}

async function watchAndRebuild(options: watchOptions) {
  const ssrFlag = options?.ssr ? " --ssr" : "";
  console.log("Watching for changes.");
  await watchChanges(".", async () => {
    console.log("File change detected.");
    // TODO: Update the vno link to deno 3rd party link when all work is complete and uploaded.
    await exec(
      `deno run --allow-read --allow-write --allow-net --unstable https://raw.githubusercontent.com/oslabs-beta/vno/reloading/install/vno.ts build${ssrFlag}`,
    );
    // this is all part of microtask queue. which means this will be pushed onto callstack after.
    // if we had await in front of it then: this callback should not be garbage collected until
    // its all resolved. but because its recursive then will always stay in microtask queue, since the
    // function calls itself again. in this case, since we do NOT have an await keyword,
    // it doesn't matter here because nothing else after line 33 suspend the callback untill this resumes
    watchAndRebuild(options);
  });
}
export { watchAndRebuild };
