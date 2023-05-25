/**
 * The main loop, so to speak...
 *
 * @file js/main.js
 */

import { Network } from "./network.js";
import { Controls } from "./controls.js";
import { onScreenEvent, showScreen } from "./gui.js";

import { StartSingleplayer } from "./modes/singleplayer.js";

// Set up game
let currentGame = undefined;

// Set up network
const network = new Network();
const onNetworkMessage = (o) => {
  if (currentGame) {
    if (o.Score) {
      currentGame.setState(o);
    } else if (o.Position) {
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
onScreenEvent("modeselect", "done", (mode) => {
  if (mode === "singleplayer") {
    showScreen("singleplayer");
  } else if (mode === "coop") {
    showScreen("coop");
  }
});

// Show mode select screen
showScreen("modeselect");

// Singleplayer initialization
onScreenEvent("singleplayer", "done", (nickname) => {
  currentGame = StartSingleplayer(nickname, network);
});
onScreenEvent("singleplayerhighscore", "newgame", (nickname) => {
  currentGame = StartSingleplayer(nickname, network);
});
onScreenEvent(
  "singleplayerhighscore",
  "mainmenu",
  () => showScreen("modeselect"),
);

// Co-Op initialization
onScreenEvent("coop", "done", (nickname) => {
  currentGame = StartCoop(nickname, network);
});
onScreenEvent("coophighscore", "mainmenu", () => showScreen("modeselect"));
