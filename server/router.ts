// server/router.ts

import { Application } from "../application.meta.ts";
import { read, readPlaying, readToday } from "../highscores/highscores.ts";

const routes = [
  {
    pattern: new URLPattern({ pathname: "/api/meta" }),
    handler: function (
      _req: Request,
      _match: Record<string, string>,
    ): Response | undefined {
      const meta = {
        ...Application,
        instance: Deno.env.get("PUP_CLUSTER_INSTANCE") || "0",
      };
      return new Response(JSON.stringify(meta), {
        status: 200,
        headers: {
          "content-type": "application/json; charset=utf-8",
        },
      });
    },
  },
  {
    pattern: new URLPattern({ pathname: "/api/highscores/:mode" }),
    handler: async function (
      _req: Request,
      match: Record<string, string>,
    ): Promise<Response | undefined> {
      // Read highscores
      if (match.mode) {
        const response = await read(match.mode);
        return new Response(JSON.stringify(response), {
          status: 200,
          headers: {
            "content-type": "application/json; charset=utf-8",
          },
        });
      }
    },
  },
  {
    pattern: new URLPattern({ pathname: "/api/playing/;mode" }),
    handler: async function (
      _req: Request,
      match: Record<string, string>,
    ): Promise<Response | undefined> {
      // Read highscores
      if (match.mode) {
        const response = await readPlaying(match.mode);
        return new Response(JSON.stringify(response), {
          status: 200,
          headers: {
            "content-type": "application/json; charset=utf-8",
          },
        });
      }
    },
  },
  {
    pattern: new URLPattern({ pathname: "/api/today/:mode" }),
    handler: async function (
      _req: Request,
      match: Record<string, string>,
    ): Promise<Response | undefined> {
      // Read highscores
      if (match.mode) {
        const response = await readToday(match.mode);
        return new Response(JSON.stringify(response), {
          status: 200,
          headers: {
            "content-type": "application/json; charset=utf-8",
          },
        });
      }
    },
  },
  // You can add more routes here...
];

export function Router(req: Request): Promise<Response> | undefined {
  for (const route of routes) {
    const match = route.pattern.exec(req.url);
    if (match) {
      return route.handler(req, match.pathname.groups);
    }
  }
  return undefined;
}
