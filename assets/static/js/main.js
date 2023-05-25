/**
 * The main loop, so to speak...
 *
 * @file js/main.js
 */

import { Viewport } from "./viewport.js";
import { Network } from "./network.js";
import { Controls } from "./controls.js";
import { elements, onScreenEvent, showScreen } from "./gui.js";
import { Game } from "./game.js";
import { htmlEscape } from "./utils.js";

// Prepare viewport
let viewport;

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
  viewport.redraw(currentGame);
};
await network.connect("/ws", onNetworkMessage);

// Set up controller
const controls = new Controls();
controls.setHandleChange((c) => {
  network.sendControlsChange(c);
});

// Function which updates the live highscore
let updateHsTimer;
const updateLiveHighscore = () => {
  // Fetch highscore
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "api/today");
  xhr.onload = function () {
    if (xhr.status === 200) {
      const res = JSON.parse(xhr.responseText);
      let html = "";
      let current = 0;
      const max = 10;
      if (res.today) {
        res.today.forEach(function (hs) {
          const playingClass = (Date.parse(hs.ts) > Date.now() - 10_000)
            ? " playing"
            : "";
          if (current++ < max) {
            html += '<div class="highscore-entry' + playingClass +
              '"><h5 class="right no-margin">' +
              htmlEscape(hs.score) +
              '</h5><h5 class="no-margin">' +
              htmlEscape(hs.nickname) +
              "</h5></div>";
          }
        });
      }

      elements.containers.hsSingleplayerToday.innerHTML = html;
    }
  };
  xhr.send();

  updateHsTimer = setTimeout(updateLiveHighscore, 5_000);
};

// Function which starts a new game
const newSingleplayerGame = async (nickname) => {
  showScreen("loading");

  // Set up viewport
  viewport = new Viewport("#game", "gf", 400, 480);

  // New game
  currentGame = new Game();
  network.sendPlayerReady(nickname);

  // Start highscore updater
  updateLiveHighscore();

  // Start playing
  showScreen("singleplayergame");
  try {
    await currentGame.play();
  } catch (_e) {
    console.error("An error occurred while playing.");
  } finally {
    // Stop highscore updater
    clearTimeout(updateHsTimer);
  }

  // Get score
  if (currentGame.getState().Score > 0) {
    showScreen("singleplayerhighscore", currentGame.getState().Score);
  } else {
    showScreen("aborted");
  }

  // Reset game
  currentGame = null;
};

// Function which starts a new game
const newCoopGame = async (nickname) => {
  showScreen("loading");

  // Set up viewport
  viewport = new Viewport("#game", "gf", 640, 480);

  // New game
  currentGame = new Game();
  network.sendPlayerReady(nickname);

  // Start playing
  showScreen("coopgame");
  try {
    await currentGame.play();
  } catch (_e) {
    console.error("An error occurred while playing.");
  }

  // Get score
  if (currentGame.getState().Score > 0) {
    showScreen("coophighscore", currentGame.getState().Score);
  } else {
    showScreen("aborted");
  }

  // Reset game
  currentGame = null;
};

onScreenEvent("singleplayer", "done", newSingleplayerGame);
onScreenEvent("singleplayerhighscore", "newgame", newSingleplayerGame);
onScreenEvent(
  "singleplayerhighscore",
  "mainmenu",
  () => showScreen("modeselect"),
);

onScreenEvent("coop", "done", newCoopGame);
onScreenEvent("coophighscore", "mainmenu", () => showScreen("modeselect"));

onScreenEvent("modeselect", "done", (mode) => {
  if (mode === "singleplayer") {
    showScreen("singleplayer");
  } else if (mode === "coop") {
    showScreen("coop");
  }
});

onScreenEvent("aborted", "ok", () => {
  showScreen("modeselect");
});

// Show mode select screen
showScreen("modeselect");
