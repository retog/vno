import { Config } from "../dts/factory.d.ts";
import { fs, path } from "../utils/deps.ts";
import { checkVueVersion } from "../utils/type_gaurds.ts";

export async function configReader(): Promise<Config> {
  //iterates through cwd,  assigning "vno.config" (if found while parsing)  to variable configFile
  let configFile;
  for await (const file of fs.walk(Deno.cwd())) {
    const currFile = path.parse(file.path);
    if (currFile.name === "vno.config") {
      configFile = currFile;
    }
  }
  if (configFile) {
    //configPAth is cwd/filename (with extention because ts)
    const configPath = `${Deno.cwd()}/${configFile.base}`;
    // Deno.readTextFile returns entire contents of configFile as a string
    const json = await Deno.readTextFile(configPath);
    //the returned string from  Deno.readTextFile is converted into object of type Config
    const res = JSON.parse(json) as Config;
    //checkVueVersion will instantiate const config to res and turn the Vue version to 2 (if not already)
    const config = checkVueVersion(res) ? res : { ...res, vue: 2 };
    return config as Config;
  } else {
    throw new Error(
      "vno requires a config file or options argument for Factory class",
    );
  }
}

