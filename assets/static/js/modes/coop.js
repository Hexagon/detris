/**
 * Manages single player game mode
 *
 * @file static/js/modes/coop.js
 */

import { Viewport } from "../viewports/coop.js";
import { showScreen } from "../gui.js";
import { Game } from "../common/game.js";

let viewport;

const StartCoop = (nickname, code, network) => {
  showScreen("loading");

  let game = new Game();

  // Run setup in "background"
  setTimeout(async () => {
    // Set up viewport
    viewport = new Viewport("#coopgame", "gf", 640, 480);
    game.setViewport(viewport);

    network.sendPlayerReady(nickname, "coop", code);

    // Start playing
    showScreen("coopgame");

    try {
      await game.play();
    } catch (_e) {
      console.error("An error occurred while playing.");
    }

    // Get score
    if (game.getData().Score > 0) {
      showScreen("coophighscore", game.getData().Score);
    } else {
      showScreen("aborted");
    }

    // Reset game
    game = null;
  }, 100);

  return game;
};

export { StartCoop };
