// import { build } from "../cli/commands.ts";
import Factory from "../factory/Factory.ts";
import * as watcher from "./src/watcher.ts";
import { exec } from "https://deno.land/x/exec/mod.ts";

async function  main() {
  console.log("Watching for file changes.");
//anychanges => logic here for deno run builds
  await watcher.watchChanges(".", async () => {
    console.log("File change detected.");

//want to rip out g,g vno permissios fro  build
 
    const write = { name: "write" } as const;
    // const run = { name: "run" } as const;
    // permission requests
    const resWrite = await Deno.permissions.request(write);
  
    const vno = Factory.create()

    await vno.build()
    //await exec('g')
    //first command is build, --allow-read
    // const args = ["build"]
    // console.log("build", build)
    // await build(args) 
   
    //return await exec('deno run -A --unstable --allow-write ./install/vno.ts build')


  })

}
main();
