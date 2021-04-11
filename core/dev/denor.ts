import { exec } from "https://deno.land/x/exec/mod.ts";

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
      `deno run --allow-read --allow-write --allow-net --unstable ./install/vno.ts build${ssrFlag}`,
    );
    await exec(
      `deno run --allow-read --allow-run --allow-write --allow-net --unstable ./core/dev/denor.ts`,
    );
  });
}

watchAndRebuild({ ssr: true });
