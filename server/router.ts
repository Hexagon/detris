// server/router.ts

import { read, readPlaying, readToday } from "../highscores/highscores.ts";

const routes = [
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
