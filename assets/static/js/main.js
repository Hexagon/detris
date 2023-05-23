/**
 * The main loop, so to speak...
 *
 * @file js/main.js
 */

import controls from "./controls.js";
import { onScreenEvent, showScreen } from "./gui.js";
import { Game } from "./game.js";

let currentGame = undefined;

// Initialize controls
const controller = controls.initialize();

// Show login screen
showScreen("login");

const newGame = async (nickname) => {
  showScreen("loading");

  // New game
  currentGame = new Game();
  await currentGame.setup(nickname, controller);

  // Start playing
  showScreen("game");
  await currentGame.play();

  // Get score
  if (currentGame.data.Score > 0) {
    showScreen("highscore", currentGame.data.Score);
  } else {
    showScreen("aborted");
  }

  // Reset game
  currentGame = null;
};
onScreenEvent("login", "done", newGame);

onScreenEvent("highscore", "newgame", newGame);

onScreenEvent("aborted", "ok", () => {
  showScreen("login");
});
