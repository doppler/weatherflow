import {
  listenAndServe,
  acceptWebSocket,
  acceptable,
} from "./deps.ts";
import { handleWs } from "./websocket.ts";

listenAndServe({ port: 3001 }, async (req) => {
  let body = "";
  switch (req.url) {
    case "/":
      body = await Deno.readTextFile("./public/index.html");
      req.respond({ body });
      break;
    case "/favicon.ico":
      body = await Deno.readTextFile("./public/favicon.svg");
      let headers = new Headers();
      headers.set("content-type", "image/svg+xml");
      req.respond({ body, headers });
      break;
    case "/ws":
      if (acceptable(req)) {
        acceptWebSocket({
          conn: req.conn,
          bufReader: req.r,
          bufWriter: req.w,
          headers: req.headers,
        }).then(handleWs);
      }
      break;
    default:
      body = `${req.url}: not found`;
      try {
        body = await Deno.readTextFile(`./public/${req.url}`);
      } catch (e) {
        console.error(body, e);
      }
      req.respond({ body });
  }
});
