import Vue from "https://deno.land/x/vue_js@0.0.5/mod.js";
import * as fs from "https://deno.land/std@0.83.0/fs/mod.ts";
import * as vueCompiler from "https://denopkg.com/crewdevio/vue-deno-compiler/mod.ts";
import * as path from "https://deno.land/std@0.99.0/path/mod.ts";
import { getExport, getTags, Mapped, VueExport } from "./utils.ts";

export interface Component {
  name: string;
  path: string;
  raw: string;
  source: any;
  dependencies: Set<string>;
  dependants: Set<string>;
  exports: VueExport["default"];
  css: string[];
  styles: string[];
  vueCmp: any;
  jsFile: string;
}

export const serialize = (
  str: any,
  short = false,
  skip = <string[]> ["getStaticProps", "getStaticPaths"],
): string => {
  if (typeof str === "string") {
    return `\`${str}\``;
  }

  if (typeof str !== "object") {
    return str.toString();
  }

  if (Array.isArray(str)) {
    let res = "[";
    for (const el of str) {
      res += serialize(el) + ",";
    }
    res += "]";
    return res;
  }

  let res = "{";
  for (const key in str) {
    if (short) {
      res += key + ",";
      continue;
    }

    if (skip.includes(key)) {
      continue;
    }

    const val = serialize(str[key], ["components"].includes(key), skip);

    if (val.match(/^\w+\(\)/)) {
      res += val + ",";
    } else {
      res += key + ":" + val + ",";
    }
  }
  res += "}";
  return res;
};

const writeJs = async (obj: any, cmp: Component) => {
  const jsPath = path.join(Deno.cwd(), ".vno", "dist", "__vno", "static", "js");
  await fs.ensureDir(jsPath);

  const jsFile = path.join(
    jsPath,
    obj.name + ".js",
  );

  let js = `import exports from './${cmp.name}.script.js';\n`;
  for (const dep of cmp.dependencies) {
    js += `import ${dep} from '${"./" + dep + ".js"}';\n`;
  }
  js += `const {getStaticProps, getStaticPaths, ...restExports} = exports;\n`;
  js += `const cmp = Vue.component('${cmp.name}',{...restExports, ...${
    serialize(obj)
  }});\nexport default cmp;`;

  await Deno.writeTextFile(
    jsFile,
    js,
  );

  await Deno.writeTextFile(
    path.join(jsPath, cmp.name + ".script.js"),
    cmp.source.descriptor.script.content,
  );
};

export const writeJs2 = async (obj: any, cmp: any, name: string) => {
  const jsPath = path.join(Deno.cwd(), ".vno", "dist", "__vno", "static", "js");
  const jsFile = path.join(
    jsPath,
    name + ".js",
  );
  if (await fs.exists(jsFile)) {
    return;
  }
  await fs.ensureDir(jsPath);
  let js = "Vue.config.productionTip = false;\n";
  for (const dep in obj.components) {
    js += `import ${dep} from '${"./" + dep + ".js"}';\n`;
  }
  js += `import exports from './${name}.script.js';\n`;
  js +=
    `const data=JSON.parse(document.querySelector("#__VNO_DATA__").textContent);\n`;
  js += `const {getStaticProps, getStaticPaths, ...restExports} = exports;\n`;
  js += `const cmp=new Vue({...restExports, ...${
    serialize(obj)
  }}); cmp.$mount('#app');`;
  await Deno.writeTextFile(
    jsFile,
    js,
  );

  await Deno.writeTextFile(
    path.join(jsPath, name + ".script.js"),
    cmp.source.descriptor.script.content,
  );
};

/**
 * Detect if there are any circular dependencies within components.
 */
const checkDepsCycle = (cmps: Mapped<Component>) => {
  // keep track of seen and completed components
  const seen = new Set<string>();
  const completed = new Set<string>();

  // perform dfs
  const dfs = (cmp: Component) => {
    // loop through dependencies
    for (const depName of cmp.dependencies) {
      // if a component is seen but not completed, then that means the component has remaining dependencies that have not been completed
      if (seen.has(depName) && !completed.has(depName)) {
        return true;
      }

      // perform dfs on dependency
      if (!seen.has(depName)) {
        seen.add(depName);
        if (dfs(cmps[depName])) return true;
      }
    }

    // have completed all depencies so component is complete
    completed.add(cmp.name);
    return false;
  };

  // check all components
  for (const cmp of Object.values(cmps)) {
    if (!seen.has(cmp.name)) {
      seen.add(cmp.name);
      if (dfs(cmp)) return true;
    }
  }
  return false;
};

/**
 * Add dependency info to a component.
 */
export const addComponentDeps = (cmp: Component, cmps: Mapped<Component>) => {
  const deps = new Set<string>();

  const tags = getTags(cmp.source.descriptor.template.content as string);

  for (const tag of tags) {
    if (tag in cmps) {
      deps.add(tag);
    }
  }

  return deps;
};

/**
 * Add depency info to all components.
 */
const addComponentsDeps = (cmps: Mapped<Component>) => {
  for (const cmp of Object.values(cmps)) {
    cmp.dependencies = addComponentDeps(cmp, cmps);
  }
};

/**
 * Add css info to all components, a component should have css for itself and all of its dependent components.
 */
const addCssDeps = (cmps: Mapped<Component>) => {
  const seen = new Set<string>();

  // perform dfs
  const dfs = (cmp: Component) => {
    const seenCss = new Set(cmp.css);
    const seenStyles = new Set(cmp.styles);

    // loop through dependencies
    for (const depName of cmp.dependencies) {
      // complete dependencies first
      if (!seen.has(depName)) {
        seen.add(depName);
        dfs(cmps[depName]);
      }

      // add unique css from dependency
      for (const css of cmps[depName].css) {
        if (!seenCss.has(css)) {
          seenCss.add(css);
          cmp.css.push(css);
        }
      }

      // add unique styles
      for (const style of cmps[depName].styles) {
        if (!seenStyles.has(style)) {
          seenStyles.add(style);
          cmp.styles.push(style);
        }
      }
    }
  };

  // do for all components
  for (const cmp of Object.values(cmps)) {
    if (!seen.has(cmp.name)) {
      seen.add(cmp.name);
      dfs(cmp);
    }
  }
};

/**
 * Add vue component to all components.
 */
const addVue = (cmps: Mapped<Component>) => {
  const seen = new Set<string>();

  // perform dfs
  const dfs = (cmp: Component) => {
    const components: { [name: string]: any } = {};

    // complete dependencies first
    for (const depName of cmp.dependencies) {
      if (!seen.has(depName)) {
        seen.add(depName);
        dfs(cmps[depName]);
        cmps[depName].dependants.add(cmp.name);
      }

      // add vue component dependency, needed for vue
      components[depName] = cmps[depName].vueCmp;
    }

    // DEVELOPMENT
    writeJs({
      name: cmp.name,
      template: cmp.source.descriptor.template.content as string,
      components,
    }, cmp);

    // create the vue component
    const vueCmp = (Vue as any).component(cmp.name, {
      ...cmp.exports,
      name: cmp.name,
      template: cmp.source.descriptor.template.content as string,
      components,
    });

    // add the vue component
    cmp.vueCmp = vueCmp;
  };

  // do for all components
  for (const cmp of Object.values(cmps)) {
    seen.add(cmp.name);
    dfs(cmp);
  }
};

/**
 * Get the info for a vue component.
 */
export const getComponent = async (filePath: string): Promise<Component> => {
  const name = path.parse(filePath).name;

  // read file
  const raw = await Deno.readTextFile(filePath);

  // parse
  const source = vueCompiler.parse(raw);

  // get info
  const obj = await getExport(source.descriptor.script.content as string);
  const styles = source.descriptor.styles
    .map((style: any) => style.content)
    .filter((style: string) => style != "\n");

  return {
    name,
    path: filePath,
    raw,
    source,
    dependencies: new Set(),
    dependants: new Set(),
    exports: obj.default,
    css: obj.default.css || [],
    styles,
    vueCmp: null,
    jsFile: "",
  };
};

/**
 * Get all project vue components.
 */
export const getComponents = async () => {
  const cmps: Mapped<Component> = {};

  // get components from components folder
  for await (
    const file of fs.walk(path.join(Deno.cwd(), "components"), {
      exts: ["vue"],
    })
  ) {
    const cmp = await getComponent(file.path);
    cmps[cmp.name] = cmp;
  }

  // add component dependencies
  addComponentsDeps(cmps);

  // check if a cycle exists
  if (checkDepsCycle(cmps)) {
    throw Error("cycle exists");
  }

  // add css dependencies
  addCssDeps(cmps);

  // add vue components
  addVue(cmps);

  return cmps;
};

// DEVELOPMENT ONLY
const main = async () => {
  const jsPath = path.join(Deno.cwd(), ".vno", "dist", "__vno", "static", "js");
  await fs.emptyDir(jsPath);
  const cmps = await getComponents();
  // console.log(cmps);
};

if (import.meta.main) {
  main();
}
