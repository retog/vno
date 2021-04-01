import { opine, serveStatic } from "https://deno.land/x/opine@1.2.0/mod.ts";
import  vueServerRenderer from './vendor/basic.js';
import App from './vendor/component.js';
import { join, dirname} from "https://deno.land/std@0.63.0/path/mod.ts";
import  styles  from './vno-build/style.js'

const app = opine();
const __dirname = dirname(import.meta.url);

//app.use(serveStatic(join(__dirname, "public"))); //works but only sends css, not html
//app.use(serveStatic(join(__dirname, "public", "css")));  //  <--appears to do nothing
//app.use("/static", serveStatic(join(__dirname, "public"))); // <--appears to do nothing

vueServerRenderer

app.use("/", (req, res, next) => {
      
      let rendered;
      vueServerRenderer(App, (err:any, res:any) => {
        console.log('result', res);
        console.log('error', err);
        //print(res);
        rendered = res;
      });
      
      const html =
      `<html>
         <head>
         
            ${styles}
           
         </head>
         <body>
           <div id="root">${rendered}</div>
         </body>
       </html>`;

    res.type("text/html").send(html);
  });
  
  const port = 17123;
  app.listen({ port });
  
  console.log(`React SSR App listening on port ${port}`);
  