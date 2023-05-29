// main.ts

import { serve } from "https://deno.land/std@0.184.0/http/server.ts";
import { serveFile } from "https://deno.land/std@0.184.0/http/file_server.ts";
import { join, resolve } from "https://deno.land/std@0.184.0/path/mod.ts";
import * as highscore from "./highscores/highscores.ts";
import { Player } from "./server/player.ts";
import { Router } from "./server/router.ts";
import { Game } from "./game/game.ts";

// Migrate old scores
const oldScores = highscore.old();
for (const score of await oldScores) {
  highscore.write("singleplayer", score.value);
}

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
        if (game.listPlayers().length == 2) {
          nickname = game.listPlayers()[0].getNickname() + " & " +
            game.listPlayers()[1].getNickname();
        } else {
          nickname = game.listPlayers()[0].getNickname();
        }

        // Write highscore
        highscore.write(game.getMode(), {
          nickname: nickname,
          score: (game.getData() as { Score: number }).Score,
          level: (game.getData() as { Level: number }).Level,
          lines: (game.getData() as { Lines: number }).Lines,
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
serve((req: Request) => {
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
  return serveFile(req, resolve(join("./assets/", pathname)));
}, { port: parseInt(Deno.env.get("DETRIS_PORT") || "8080", 10) });

MainLoop();
