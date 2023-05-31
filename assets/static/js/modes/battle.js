/**
 * Manages single player game mode
 *
 * @file static/js/modes/battle.js
 */

import { Viewport } from "../viewports/battle.js";
import { showScreen } from "../gui.js";
import { Game } from "../common/game.js";

let viewport;

const gotData = (game) => {
  let resolver = () => {};
  let rejecter = () => {};

  const done = new Promise((resolve, reject) => {
    resolver = resolve;
    rejecter = reject;
  });

  const timeoutTimer = setTimeout(() => {
    rejecter();
  }, 120000);

  setTimeout(async () => {
    while (!game.getData()) {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    clearTimeout(timeoutTimer);
    resolver();
  }, 0);

  return done;
};

const StartBattle = (nickname, code, network) => {
  let game = new Game();

  // Run setup in "background"
  setTimeout(async () => {
    // Set up viewport
    viewport = new Viewport("#battlegame", "gf", 640, 480);
    game.setViewport(viewport);

    network.sendPlayerReady(nickname, "battle", code);

    try {
      // Wait for data
      await gotData(game);

      // Start playing
      showScreen("battlegame");

      // Play game
      console.log("Pregame");
      await game.play();

      console.log("Postgame");
      // Get score
      // ToDo: Currently always showing player 0s score
      console.log(game.getData());
      if (game.getData().Winner >= 0) {
        showScreen(
          "battlehighscore",
          game.getData().Winner === game.getData().PlayerIndex
            ? game.getData().Score[game.getData().PlayerIndex]
            : undefined,
        );
      } else {
        showScreen("aborted");
      }
    } catch (_e) {
      console.error("An error occurred while playing.", _e);
      showScreen("aborted");
    }

    // Reset game
    game = null;
  }, 100);

  return game;
};

export { StartBattle };
