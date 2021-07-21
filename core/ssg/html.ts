import Vue from "https://deno.land/x/vue_js@0.0.5/mod.js";
import * as fs from "https://deno.land/std@0.99.0/fs/mod.ts";
import * as path from "https://deno.land/std@0.99.0/path/mod.ts";
import renderer from "https://deno.land/x/vue_server_renderer@0.0.4/mod.js";
import {
  Language,
  minify,
  minifyHTML,
} from "https://deno.land/x/minifier@v1.1.1/mod.ts";
import {
  Component,
  getComponent,
  getComponents,
  writeJs2,
} from "./components.ts";
import { getTags, Mapped, PathData } from "./utils.ts";
import { getAssets } from "./assets.ts";

const __dirname = new URL(".", import.meta.url).pathname;
(Vue.config as any).devtools = false;
(Vue.config as any).productionTip = false;

export interface GenHtmlParams {
  entry: string;
  output: string;
  pathData?: PathData;
  cmps?: Mapped<Component>;
  assets?: Mapped<string>;
  reload?: boolean;
  reloadPort?: number;
  jsName?: string;
}

/**
 * Generate a vue page component to html.
 */
export const genHtml = async (params: GenHtmlParams) => {
  const { entry, output } = params;

  // destructure these params and load them if needed
  let { cmps, pathData, assets } = params;
  pathData = pathData || { params: {} };
  cmps = cmps || (await getComponents());
  assets = assets || (await getAssets([/\.css$/i]));

  // get the page component info
  const cmp = await getComponent(entry);
  const template = cmp.source.descriptor.template.content as string;
  const styles = cmp.source.descriptor.styles;

  // get component and css dependencies
  let cmpStyles = "\n";
  const seenCss = new Set(cmp.css); // only need one of each css file
  const seenStyles = new Set<string>();
  const components: Mapped<any> = {};
  const tags = getTags(template);
  for (const tag of tags) {
    // only add if is a custom component i.e. in cmps
    if (tag in cmps) {
      components[tag] = cmps[tag].vueCmp;

      // loop through components css
      for (const css of cmps[tag].css) {
        // only added if new
        if (!seenCss.has(css)) {
          seenCss.add(css);
          cmp.css.push(css);
        }
      }

      for (const style of cmps[tag].styles) {
        if (!seenStyles.has(style)) {
          seenStyles.add(style);
          cmpStyles += style + "\n";
        }
      }
    }
  }

  // get needed css
  let rawCss = "\n";
  // loop through css dependency array, performed in reverse because component level css were added last
  for (const css of [...cmp.css].reverse()) {
    // get the full css path
    const cssFile = path.join(Deno.cwd(), css);

    // throw error if not found from assets folder
    if (!assets[cssFile]) {
      throw Error("invalid css");
    }

    rawCss += `${assets[cssFile]}\n`;
  }

  // call data function from the page component
  const data = await Promise.resolve(
    cmp.exports.getStaticProps
      ? cmp.exports.getStaticProps({
        ...pathData,
        fetch,
      })
      : {},
  );
  const dataHtml = `<script id="__VNO_DATA__" type="application/json">${
    JSON.stringify(data)
  }</script>`;

  // DEVELOPMENT
  const name = params.jsName || Math.random().toString(36);
  await writeJs2(
    {
      template,
      data() {
        return data;
      },
      components,
    },
    cmp,
    name,
  );

  // create the vue page component
  const App = new Vue({
    ...cmp.exports,
    template,
    data() {
      return data;
    },
    components,
  });

  // render the page component to html
  const bodyHtml = await new Promise<string>((resolve, reject) => {
    renderer(App, (err: any, html: string) => {
      if (err) {
        return reject(err);
      }
      return resolve(html);
    });
  });

  // combine all styles
  const rawStyles = minify(
    Language.CSS,
    cmpStyles + rawCss + styles.map((style: any) => style.content).join("\n"),
  );

  // read the html template
  const htmlTemplate = await Deno.readTextFile(
    path.join(Deno.cwd(), "public", "index.html"),
  );

  // insert styles and body
  let html = htmlTemplate
    .replace(/<\/head>/, `<style>${rawStyles}</style>$&`)
    .replace(/<body>/, `$&${bodyHtml}`);

  // add reload
  if (params.reload) {
    let reloadScript = await Deno.readTextFile(
      path.join(__dirname, "reload.js"),
    );
    if (params.reloadPort) {
      reloadScript = reloadScript.replace(/8080/, params.reloadPort.toString());
    }
    reloadScript = minify(Language.JS, reloadScript);

    html = html.replace(/<\/body>/, `<script>${reloadScript}</script>$&`);
  }

  html = html.replace(
    /<\/body>/,
    `<script src="/__vno/static/js/${name}.js" type="module"></script>$&`,
  );
  html = html.replace(/<\/body>/, `${dataHtml}$&`);

  // minify
  // const final = minifyHTML(html, { minifyCSS: true, minifyJS: true });
  const final = html;

  // write the html file
  await fs.ensureDir(path.parse(output).dir);
  return Deno.writeTextFile(output, final);
};

// DEVELOPMENT ONLY
if (import.meta.main) {
  await fs.emptyDir(path.join("./.vno"));
  genHtml({
    entry: "./pages/index.vue",
    output: "./.vno/dist/index.html",
  });
}
