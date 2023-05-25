// main.ts

import { serve } from "https://deno.land/std@0.184.0/http/server.ts";
import { serveFile } from "https://deno.land/std@0.184.0/http/file_server.ts";
import { join, resolve } from "https://deno.land/std@0.184.0/path/mod.ts";

import { Player } from "./server/player.ts";
import { Router } from "./server/router.ts";

serve((req: Request) => {
  let pathname = new URL(req.url).pathname;

  // Serve using websockets
  if (req.headers.get("upgrade") == "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(req);
    new Player(socket);
    return response;
  }

  // Serve using router
  const routerResponse = Router(req);
  if (routerResponse) return routerResponse;

  // Serve static files, or 404
  if (pathname === "/") pathname = "/index.html";
  return serveFile(req, resolve(join("./assets/", pathname)));
}, { port: parseInt(Deno.env.get("DETRIS_PORT") || "8080", 10) });
