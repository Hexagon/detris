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

// Set up viewport
const viewport = new Viewport("#game", "gf", 400, 480);

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
await network.connect("/ws", onNetworkMessage);

// Set up controller
const controls = new Controls();
controls.setHandleChange((c) => {
  network.sendControlsChange(c);
});

// Function which updates the live highscore
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

      elements.containers.hsToday.innerHTML = html;
    }
  };
  xhr.send();
};

// Function which starts a new game
const newGame = async (nickname) => {
  showScreen("loading");

  // New game
  currentGame = new Game();
  network.sendPlayerReady(nickname);

  // Start highscore updater
  const updateHsTimer = setInterval(updateLiveHighscore, 5_000);
  updateLiveHighscore();

  // Start playing
  showScreen("game");
  try {
    await currentGame.play();
  } catch (_e) {
    console.error("An error occurred while playing.");
  } finally {
    // Stop highscore updater
    clearInterval(updateHsTimer);
  }

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
}, 1000);
