/**
 * The main loop, so to speak...
 *
 * @file js/main.js
 */
import { Viewport } from "./viewport.js";
import { Network } from "./network.js";
import { Controls } from "./controls.js";
import { onScreenEvent, showScreen } from "./gui.js";
import { Game } from "./game.js";

// Set up viewport
const viewport = new Viewport("#game", "gf", 640, 480);

// Set up game
let currentGame = undefined;

// Set up network
const network = new Network();
const onNetworkMessage = (o) => {
  if (currentGame) {
    if (o.Position) {
        currentGame.setData(o);
    } else if (o.Data) {
        currentGame.setGrid(o);
    } else if (o.gameOver) {
        currentGame.setPlaying(false);
        currentGame.setGameOver();
    }
  }
  viewport.redraw(currentGame);
};
await network.connect("/ws",onNetworkMessage);

// Set up controller
const controls = new Controls();
controls.setHandleChange((c) => {
  network.sendControlsChange(c);
});

// Function which starts a new game
const newGame = async (nickname) => {

  showScreen("loading");

  // New game
  currentGame = new Game();
  network.sendPlayerReady(nickname);

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

// Show login screen after 1 second
setTimeout(() => {
  showScreen("login");
}, 1000)
