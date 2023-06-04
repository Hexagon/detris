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
import { StartBattle } from "./modes/battle.js";

// Fetch application metadata
const xhr = new XMLHttpRequest();
xhr.open("GET", "api/meta");
xhr.onload = function () {
  if (xhr.status === 200) {
    const res = JSON.parse(xhr.responseText);
    console.log(res)
    if (res.version) {
      const 
        elmVersion = document.getElementById("version");
      if (elmVersion) elmVersion.innerHTML = res.version;
    }
    if (res.instance) {
      const 
        elmInstance = document.getElementById("instance");
      if (elmInstance) elmInstance.innerHTML = res.instance;
    }
  }
};
xhr.send();

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
onScreenEvent("aborted", "mainmenu", () => {
  showScreen("modeselect");
});

showScreen("modeselect");
onScreenEvent("modeselect", "singleplayer", (nickname) => {
  showScreen("loading");
  currentGame = StartSingleplayer(nickname, network);
});
onScreenEvent("modeselect", "coop", (nickname, code, ai) => {
  showScreen("starting");
  currentGame = StartCoop(nickname, code, network, ai);
});
onScreenEvent("modeselect", "battle", (nickname, code, ai) => {
  showScreen("starting");
  currentGame = StartBattle(nickname, code, network, ai);
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

// Co-Op initialization
onScreenEvent("battlehighscore", "mainmenu", () => showScreen("modeselect"));
