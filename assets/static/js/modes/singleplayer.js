import { Viewport } from "../viewports/singleplayer.js";
import { elements, showScreen } from "../gui.js";
import { Game } from "../game.js";
import { htmlEscape } from "../utils.js";

let viewport;

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

const StartSingleplayer = (nickname, network) => {
  showScreen("loading");

  let game = new Game();

  // Run setup in "background"
  setTimeout(async () => {
    // Set up viewport
    viewport = new Viewport("#game", "gf", 400, 480);
    game.setViewport(viewport);

    network.sendPlayerReady(nickname);

    // Start highscore updater
    updateLiveHighscore();

    // Start playing
    showScreen("singleplayergame");
    try {
      await game.play();
    } catch (_e) {
      console.error("An error occurred while playing.");
    } finally {
      // Stop highscore updater
      clearTimeout(updateHsTimer);
    }

    // Get score
    if (game.getState().Score > 0) {
      showScreen("singleplayerhighscore", game.getState().Score);
    } else {
      showScreen("aborted");
    }

    // Reset game
    game = null;
  }, 100);

  return game;
};

export { StartSingleplayer };
