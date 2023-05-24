import { read, readPlaying, readToday } from "../highscores/highscores.ts";

const routes = [
  {
    pattern: new URLPattern({ pathname: "/api/highscores" }),
    handler: async function (_req: Request): Promise<Response> {
      // Read highscores
      const response = await read();
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
          "content-type": "application/json; charset=utf-8",
        },
      });
    },
  },
  {
    pattern: new URLPattern({ pathname: "/api/playing" }),
    handler: async function (_req: Request): Promise<Response> {
      // Read highscores
      const response = await readPlaying();
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
          "content-type": "application/json; charset=utf-8",
        },
      });
    },
  },
  {
    pattern: new URLPattern({ pathname: "/api/today" }),
    handler: async function (_req: Request): Promise<Response> {
      // Read highscores
      const response = await readToday();
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
          "content-type": "application/json; charset=utf-8",
        },
      });
    },
  }
  // You can add more routes here...
];

export function router(req: Request): Response | undefined {
  for (const route of routes) {
    const match = route.pattern.exec(req.url);
    if (match) {
      return route.handler(req, match);
    }
  }
  return;
}
