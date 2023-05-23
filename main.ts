// main.ts

import { serve } from "https://deno.land/std@0.184.0/http/server.ts";
import { Player } from "./server/player.ts";
import { serveFile } from "https://deno.land/std@0.184.0/http/file_server.ts";
import { join, resolve } from "https://deno.land/std@0.184.0/path/mod.ts";
import { router } from "./server/router.ts";

// Open the default database for the script.
const kv = await Deno.openKv();

serve((req: Request) => {
  let pathname = new URL(req.url).pathname;

  // Serve websockets
  if (req.headers.get("upgrade") == "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(req);

    Player(socket, kv);

    return response;
  }

  // Check router
  const routerResponse = router(req);
  if (routerResponse) return routerResponse;

  // Try to serve static files
  if (pathname === "/") pathname = "/index.html";
  return serveFile(req, resolve(join("./assets/", pathname)));
}, { port: parseInt(Deno.env.get("DETRIS_PORT") || "8080", 10) });
