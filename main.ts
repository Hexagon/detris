// main.ts

import { serve } from "./deps.ts";
import { serveFile } from "./deps.ts";
import { join, resolve } from "./deps.ts";

import * as highscore from "./highscores/highscores.ts";

import { Player } from "./server/player.ts";
import { Router } from "./server/router.ts";
import { Game } from "./game/game.ts";

// Main game loop
const games: Game[] = [];
const MainLoop = () => {
  // Wrap the full main login in a try catch
  try {
    for (const game of games) {
      // Start created games when requirements are met
      if (game.getStatus() === "created") {
        // Start if requirements are met
        if (game.checkRequirements()) {
          game.start();

          // Abandon game if not started after 120 seconds
        } else if (game.getCreateTime() < Date.now() - 120_000) {
          game.abandon();
        }
      }

      // Iterate games when playing
      if (game.getStatus() === "playing") {
        if (!game.iterate()) {
          game.over();
        }
      }

      // Update highscore if score changed
      if (game.scoreChanged()) {
        // Determine nickname
        let nickname = "";
        let score = 0;
        let level = 0;
        let lines = 0;
        if (game.listPlayers().length == 2) {
          if (game.getMode() === "battle") {
            const winner = (game.getData() as { Winner: number }).Winner;
            if (winner >= 0) {
              nickname = game.listPlayers()[winner].getNickname();
              score = (game.getData() as { Score: number[] }).Score[winner];
            }
          } else if (game.getMode() === "coop") {
            nickname = game.listPlayers()[0].getNickname() + " & " +
              game.listPlayers()[1].getNickname();
            score = (game.getData() as { Score: number }).Score;
            level = (game.getData() as { Levels: number }).Levels;
            lines = (game.getData() as { Lines: number }).Lines;
          }
        } else {
          nickname = game.listPlayers()[0].getNickname();
          score = (game.getData() as { Score: number }).Score;
          level = (game.getData() as { Levels: number }).Levels;
          lines = (game.getData() as { Lines: number }).Lines;
        }

        // Write highscore
        highscore.write(game.getMode(), {
          nickname,
          score,
          level,
          lines,
          ts: new Date(),
          tsInit: game.getCreateTime(),
        });
      }

      // Cleanup ended games
      const ended = game.getStatus() == "gameover" ||
        game.getStatus() == "abandoned";
      if (ended) {
        game.setCleanupTimer();

        // Remove current game if it was ended more than 120 seconds ago
        if (
          game.getCleanupTimer() &&
          game.getCleanupTimer() as number < Date.now() - 120_000
        ) {
          console.log("Cleaning up old game");
          games.splice(games.indexOf(game), 1);
        }
      }
    }
  } catch (e) {
    console.error("Main Loop Error: ", e);
  }

  // Recurse
  setTimeout(() => {
    MainLoop();
  }, 50);
};

// HTTP server
serve(async (req: Request) => {
  let pathname = new URL(req.url).pathname;

  // Serve using websockets
  if (req.headers.get("upgrade") == "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(req);
    new Player(socket, games);
    return response;
  }

  // Serve using router
  const routerResponse = Router(req);
  if (routerResponse) return routerResponse;

  // Serve static files, or 404
  if (pathname === "/") pathname = "/index.html";
  const resp = await serveFile(req, resolve(join("./assets/", pathname)));

  if (resp.status === 200) {
    /* Append custom headers to successful static file responses */
    resp.headers.set("Cache-Control", "public, max-age=86400"); // 86400 seconds is 24 hours
  }

  return resp;
}, {
  // Port number resolution
  //
  // 1. Environment variable PUP_CLUSTER_PORT
  // 2. Environment variable DETRIS_PORT
  // 3. Static port 8080
  //
  port: parseInt(
    Deno.env.get("PUP_CLUSTER_PORT") || Deno.env.get("DETRIS_PORT") || "8080",
    10,
  ),
});

MainLoop();
