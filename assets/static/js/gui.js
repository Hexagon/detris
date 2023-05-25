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

    singleplayer: document.getElementById("viewSingleplayer"),
    singleplayergame: document.getElementById("viewSingleplayerGame"),
    singleplayerhighscore: document.getElementById("viewSingleplayerHighscore"),

    coop: document.getElementById("viewCoop"),
    coopgame: document.getElementById("viewCoopGame"),
    coophighscore: document.getElementById("viewCoopHighscore"),

    loading: document.getElementById("viewLoading"),
    aborted: document.getElementById("viewAborted"),
  },
  inputs: {
    singleplayernickname: document.getElementById("txtSingleplayerNickname"),
    coopnickname: document.getElementById("txtCoopNickname"),
  },
  buttons: {
    singleplayer: document.getElementById("btnSingleplayer"),
    singleplayerstart: document.getElementById("btnSingleplayerStart"),
    singleplayernewgame: document.getElementById("btnSingleplayerNewGame"),
    singleplayermainmenu: document.getElementById("btnSingleplayerMainMenu"),

    coop: document.getElementById("btnCoop"),
    coopstart: document.getElementById("btnCoopStart"),
    coopmainmenu: document.getElementById("btnCoopMainMenu"),
  },
  containers: {
    /* Single player menu view */
    hsSingleplayerAth: document.getElementById("hsSingleplayerAth"),
    hsSingleplayerWeek: document.getElementById("hsSingleplayerWeek"),
    hsSingleplayerToday: document.getElementById("hsSingleplayerToday"),

    /* Co-op menu view */
    hsCoopAth: document.getElementById("hsCoopAth"),
    hsCoopWeek: document.getElementById("hsCoopWeek"),
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
      events.modeselect.done("singleplayer");
    });
    elements.buttons.coop.addEventListener("click", function () {
      events.modeselect.done("coop");
    });
  },
  singleplayer: () => {
    elements.inputs.singleplayernickname.addEventListener(
      "keydown",
      function (e) {
        if (e.code == "Enter") {
          events.singleplayer.done(elements.inputs.singleplayernickname.value);
        }
      },
    );
    elements.buttons.singleplayerstart.addEventListener("click", function () {
      events.singleplayer.done(elements.inputs.singleplayernickname.value);
    });
  },
  coop: () => {
    elements.inputs.coopnickname.addEventListener("keydown", function (e) {
      if (e.code == "Enter") {
        events.coop.done(elements.inputs.coopnickname.value);
      }
    });
    elements.buttons.coopstart.addEventListener("click", function () {
      events.coop.done(elements.inputs.coopnickname.value);
    });
  },
  singleplayerhighscore: () => {
    elements.buttons.singleplayernewgame.addEventListener("click", function () {
      events.singleplayerhighscore.newgame(
        elements.inputs.singleplayernickname.value,
      );
    });
    elements.buttons.singleplayermainmenu.addEventListener(
      "click",
      function () {
        events.singleplayerhighscore.mainmenu(
          elements.inputs.singleplayernickname.value,
        );
      },
    );
  },
  coophighscore: () => {
    elements.buttons.coopmainmenu.addEventListener("click", function () {
      events.coophighscore.mainmenu(elements.inputs.coopnickname.value);
    });
  },
  singleplayergame: () => {
  },
};

// Define updater functions for each screen, run each time a screen is shown
const updaters = {
  singleplayer: () => {
    // Fetch highscore
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "api/highscores");
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

        html = "";
        current = 0;

        if (res.week) {
          res.week.forEach(function (hs) {
            if (current++ < max) {
              const playingClass = (Date.parse(hs.ts) > Date.now() - 10_000)
                ? " playing"
                : "";
              html += '<div class="highscore-entry' + playingClass +
                '"><h5 class="right no-margin">' +
                htmlEscape(hs.score) +
                '</h5><h5 class="no-margin">' +
                htmlEscape(hs.nickname) +
                "</h5></div>";
            }
          });
        }

        elements.containers.hsSingleplayerWeek.innerHTML = html;
      }
    };
    xhr.send();

    // Focus on nickname
    elements.inputs.singleplayernickname.focus();
  },
  singleplayerhighscore: (score) => {
    // Update your score details
    elements.containers.hsSingleplayerYourScore.innerHTML = `
      <h5>Your Score: ${score}</h5>
      <!-- Additional score details -->
    `;

    // Fetch highscore
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "api/highscores");
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
