/**
 * Manages single player game mode
 *
 * @file static/js/modes/coop.js
 */

import { Viewport } from "../viewports/coop.js";
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

const StartCoop = (nickname, code, network) => {
  let game = new Game();

  // Run setup in "background"
  setTimeout(async () => {
    // Set up viewport
    viewport = new Viewport("#coopgame", "gf", 640, 480);
    game.setViewport(viewport);

    network.sendPlayerReady(nickname, "coop", code);

    try {
      // Wait for data
      await gotData(game);

      // Start playing
      showScreen("coopgame");

      // Play game
      await game.play();

      // Get score
      if (game.getData().Score > 0) {
        showScreen("coophighscore", game.getData().Score);
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

export { StartCoop };
