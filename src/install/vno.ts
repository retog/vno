import Initialize from "../strategies/initialize.ts";
import { creator, info, print, str } from "../command-line/_exp.ts";
import { fs, oak, path, serve } from "../lib/deps.ts";

// ensure permissions
const read = { name: "read" } as const;
const write = { name: "write" } as const;
// permission requests
const resRead = await Deno.permissions.request(read);
const resWrite = await Deno.permissions.request(write);

// vno module
const bundler = new (Initialize as any)();
// command line arguments
const { args } = Deno;

if (resRead && resWrite) {
  // vno create [project-name]
  if ((/create/i).test(args[0])) {
    const repo = args[1];
    // if a project title is provided
    if (repo) {
      const dir = `${Deno.cwd()}/${repo}`;
      await fs.ensureDir(dir);
      Deno.chdir(dir);
    }
    // run creator for an application template
    await creator(repo && repo);
  }
  // vno build || vno run dev
  if ((/build/i).test(args[0]) || /run/i.test(args[0])) {
    let configFile;

    // located vno.config.json in file system
    if (await (fs.exists("./vno.config.json"))) {
      const currFile = path.parse("./vno.config.json");
      configFile = currFile;
    }

    if (configFile) {
      const configPath = `${Deno.cwd()}/${configFile.base}`;
      // read the vno.config.json file and parse it into js
      const json = await Deno.readTextFile(configPath)
        .then((res) => JSON.parse(res));

      let vue;
      // { vue } if the user provided a vue cdn
      json.vue ? { vue } = json : null;
      // {entry, root} will be used to run the vno bundler
      const { entry, root } = json;
      // { options } stores user data that will populate an html file
      const { options } = json;

      // invoke the bundler
      await bundler.config({ entry, root, vue } || { entry, root });
      // if 'quiet' is run as an argument, do not print ASCII
      if (args[1] === "quiet" || args[2] === "quiet") print.QUIET();
      else print.ASCII();

      // vno run dev
      if (/run/i.test(args[0])) {
        if (/dev\s*/i.test(args[1])) {
          serve(parseInt(options.port) ?? 3000, "./public", false)
        }
      }

    } else {
      print.WARN(
        ">> could not locate vno.config.json \n>> run cmd again in root directory || create vno.config.json",
      );
    }
  } else {
    // --flags to help users on the command-line
    if ((/--help/i.test(args[0])) || (/--info/i.test(args[0]))) {
      print.ASCII();
      print.INFO(info);
      // vno --help responds with info on all commands
      if (/--help/i.test(args[0])) {
        print.CMDS(info);
        print.OPTIONS(info);
      } // vno --info responds with module specific information
      if (/--info/i.test(args[0])) console.log("\n");
    }
  }
} else {
  print.WARN(">> Deno requires read/write permissions to run vno");
}

export default new (Initialize as any)();
