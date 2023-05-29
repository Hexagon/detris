/**
 * Everything related to dom, except the canvas
 *
 * @file js/gui.js
 */

import { htmlEscape } from "./utils.js";

// Define all screens and elements
const elements = {
  screens: {
    modeselect: document.getElementById("viewModeselect"),

    singleplayergame: document.getElementById("viewSingleplayerGame"),
    singleplayerhighscore: document.getElementById("viewSingleplayerHighscore"),

    coopgame: document.getElementById("viewCoopGame"),
    coophighscore: document.getElementById("viewCoopHighscore"),

    loading: document.getElementById("viewLoading"),
    starting: document.getElementById("viewStarting"),
    aborted: document.getElementById("viewAborted"),
  },
  labels: {
    status: document.getElementById("lblStarting"),
  },
  inputs: {
    nickname: document.getElementById("txtNickname"),
    checkprivate: document.getElementById("chkPrivate"),
    code: document.getElementById("txtCode"),
  },
  buttons: {
    singleplayer: document.getElementById("btnSingleplayer"),
    singleplayernewgame: document.getElementById("btnSingleplayerNewGame"),
    singleplayermainmenu: document.getElementById("btnSingleplayerMainMenu"),

    coop: document.getElementById("btnCoop"),
    coopstart: document.getElementById("btnCoopStart"),
    coopmainmenu: document.getElementById("btnCoopMainMenu"),
  },
  containers: {
    /* Mode select view */
    hsSingleplayerAth: document.getElementById("hsSingleplayerAth"),
    hsCoopAth: document.getElementById("hsCoopAth"),

    /* Single player game view */
    hsSingleplayerToday: document.getElementById("hsSingleplayerToday"),

    /* Co-Op game view */
    hsCoopToday: document.getElementById("hsCoopToday"),

    /* Single player highscore view */
    hsSingleplayerYourScore: document.getElementById("hsSingleplayerYourScore"),
    hsSingleplayerAllTime: document.getElementById("hsSingleplayerAllTime"),
    hsSingleplayerLast7Days: document.getElementById("hsSingleplayerLast7Days"),

    /* Co-op highscore view */
    hsCoopYourScore: document.getElementById("hsCoopYourScore"),
    hsCoopAllTime: document.getElementById("hsSingleplayerAllTime"),
    hsCoopLast7Days: document.getElementById("hsSingleplayerLast7Days"),
  },
};

const events = {};

// Define initializers for each screen
const initializers = {
  modeselect: () => {
    elements.buttons.singleplayer.addEventListener("click", function () {
      events.modeselect.singleplayer(elements.inputs.nickname.value);
    });
    elements.buttons.coop.addEventListener("click", function () {
      events.modeselect.coop(
        elements.inputs.nickname.value,
        elements.inputs.code.value,
      );
    });
    elements.inputs.checkprivate.addEventListener("change", function (e) {
      if (e.checked) {
        elements.inputs.code.style.display = "none";
      } else {
        elements.inputs.code.style.display = "block";
      }
    });
  },
  singleplayerhighscore: () => {
    elements.buttons.singleplayernewgame.addEventListener("click", function () {
      events.singleplayerhighscore.newgame(
        elements.inputs.nickname.value,
      );
    });
    elements.buttons.singleplayermainmenu.addEventListener(
      "click",
      function () {
        events.singleplayerhighscore.mainmenu(
          elements.inputs.nickname.value,
        );
      },
    );
  },
  coophighscore: () => {
    elements.buttons.coopmainmenu.addEventListener("click", function () {
      events.coophighscore.mainmenu(elements.inputs.nickname.value);
    });
  },
  singleplayergame: () => {
    /* Lots of empty */
  },
};

// Define updater functions for each screen, run each time a screen is shown
const updaters = {
  modeselect: () => {
    // Fetch highscore
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "api/highscores/singleplayer");
    xhr.onload = function () {
      if (xhr.status === 200) {
        const res = JSON.parse(xhr.responseText);
        let html = "";
        let current = 0;
        const max = 10;
        if (res.ath) {
          res.ath.forEach(function (hs) {
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

        elements.containers.hsSingleplayerAth.innerHTML = html;
      }
    };
    xhr.send();

    // Focus on nickname
    elements.inputs.nickname.focus();
  },
  singleplayerhighscore: (score) => {
    // Update your score details
    elements.containers.hsSingleplayerYourScore.innerHTML = `
      <h5>Your Score: ${score}</h5>
      <!-- Additional score details -->
    `;

    // Fetch highscore
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "api/highscores/singleplayer");
    xhr.onload = function () {
      if (xhr.status === 200) {
        const res = JSON.parse(xhr.responseText);
        let html = "";
        let current = 0;
        const max = 10;
        if (res.ath) {
          res.ath.forEach(function (hs) {
            if (current++ < max) {
              html +=
                '<div class="highscore-entry"><h5 class="right no-margin">' +
                htmlEscape(hs.score) +
                '</h5><h5 class="no-margin">' +
                htmlEscape(hs.nickname) +
                "</h5></div>";
            }
          });
        }

        elements.containers.hsSingleplayerAllTime.innerHTML = html;

        html = "";
        current = 0;

        if (res.week) {
          res.week.forEach(function (hs) {
            if (current++ < max) {
              html +=
                '<div class="highscore-entry"><h5 class="right no-margin">' +
                htmlEscape(hs.score) +
                '</h5><h5 class="no-margin">' +
                htmlEscape(hs.nickname) +
                "</h5></div>";
            }
          });
        }

        elements.containers.hsSingleplayerLast7Days.innerHTML = html;
      }
    };
    xhr.send();
  },
};

// Function to show a specific screen
const showScreen = function (screenName, data) {
  // Always lowercase trimmed
  screenName = screenName.toLowerCase().trim();

  if (!elements.screens[screenName]) {
    throw new Error("Screen not found: " + screenName);
  }

  // Hide all screens
  for (const s in elements.screens) {
    elements.screens[s].style.display = "none";
  }

  // Show selected screen
  elements.screens[screenName].style.display = "block";

  // Run updater
  if (updaters[screenName]) updaters[screenName](data);
};

const onScreenEvent = (screenName, eventName, callback) => {
  screenName = screenName.toLowerCase().trim();
  eventName = eventName.toLowerCase().trim();
  if (!events[screenName]) events[screenName] = {};
  events[screenName][eventName] = callback;
};

// Run initializers
for (const screenName of Object.keys(elements.screens)) {
  if (initializers[screenName]) initializers[screenName]();
}

export { elements, onScreenEvent, showScreen };
