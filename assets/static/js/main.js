/**
 * The main loop, so to speak...
 *
 * @file js/main.js
 */

import { Network } from "./network.js";
import { Controls } from "./controls.js";
import { onScreenEvent, showScreen } from "./gui.js";

import { StartSingleplayer } from "./modes/singleplayer.js";
import { StartCoop } from "./modes/coop.js";

// Set up game
let currentGame = undefined;

// Set up network
const network = new Network();
const onNetworkMessage = (o) => {
  if (currentGame) {
    if (o.Grid) {
      currentGame.setData(o);
    } else if (o.gameOver) {
      currentGame.setPlaying(false);
      currentGame.setGameOver();
    }
  }
  currentGame.getViewport().redraw(currentGame);
};
await network.connect("/ws", onNetworkMessage);

// Set up controller
const controls = new Controls();
controls.setHandleChange((c) => {
  network.sendControlsChange(c);
});

// Generic initialization
onScreenEvent("aborted", "ok", () => {
  showScreen("modeselect");
});

showScreen("modeselect");
onScreenEvent("modeselect", "singleplayer", (nickname) => {
  showScreen("loading");
  currentGame = StartSingleplayer(nickname, network);
});
onScreenEvent("modeselect", "coop", (nickname, code) => {
  showScreen("starting");
  currentGame = StartCoop(nickname, code, network);
});

// Singleplayer initialization
onScreenEvent("singleplayerhighscore", "newgame", (nickname) => {
  currentGame = StartSingleplayer(nickname, network);
});
onScreenEvent(
  "singleplayerhighscore",
  "mainmenu",
  () => showScreen("modeselect"),
);

// Co-Op initialization
onScreenEvent("coophighscore", "mainmenu", () => showScreen("modeselect"));
