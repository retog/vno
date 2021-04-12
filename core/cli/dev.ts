import { Application, path, send } from "../utils/deps.ts";
import * as print from "./stdout.ts";
import { exec } from "https://deno.land/x/exec/mod.ts";

import { watchAndRebuild } from "./liveRebuild.ts";

export const server: Application = new Application();

export const runDevServer = async function (port: number, hostname: string) {
  server.use(async (ctx, next) => {
    const { pathname } = ctx.request.url;

    if (pathname === "/") {
      await send(ctx, pathname, {
        root: path.join(Deno.cwd(), "public"),
        index: "index.html",
      });
    } else if (pathname === "/build.js") {
      ctx.response.type = "application/javascript";
      await send(ctx, pathname, {
        root: path.join(Deno.cwd(), "vno-build"),
        index: "build.js",
      });
    } else if (pathname === "/style.css") {
      ctx.response.type = "text/css";
      await send(ctx, pathname, {
        root: path.join(Deno.cwd(), "vno-build"),
        index: "style.css",
      });
    } else await next();
  });
  //, server.use(watchAndRebuild);

  // server error handling
  server.addEventListener("error", (e: unknown) => console.error(e));
  // listen for active server
  let running = false;
  server.addEventListener("listen", async () => {
    print.LISTEN(port, hostname);
    if (running === false) {
      console.log("await here");

      // await exec(
      //   `deno run --allow-read --allow-run --allow-write --allow-net --unstable ./core/cli/liveRebuild.ts`,
      // );
      watchAndRebuild({ ssr: false });

      running = true;
    }
  });
  await server.listen({ port, hostname });

  return server;
};
