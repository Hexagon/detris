/**
 * Everything related to dom, except the canvas
 *
 * @file js/gui.js
 */

import { htmlEscape } from "./utils.js";

// Define all screens and elements
const elements = {
  screens: {
    login: document.getElementById("viewMenu"),
    game: document.getElementById("viewGame"),
    highscore: document.getElementById("viewHighscore"),
    loading: document.getElementById("viewLoading"),
    aborted: document.getElementById("viewAborted"),
  },
  inputs: {
    nickname: document.getElementById("txtNickname"),
  },
  buttons: {
    start: document.getElementById("btnStart"),
    newGame: document.getElementById("btnNewGame"),
  },
  containers: {
    hsAth: document.getElementById("hsAth"),
    hsWeek: document.getElementById("hsWeek"),
    message: document.getElementById("message"),
    hsYourScore: document.getElementById("hsYourScore"),
    hsAllTime: document.getElementById("hsAllTime"),
    hsLast7Days: document.getElementById("hsLast7Days"),
    hsToday: document.getElementById("hsToday")
  },
};

const events = {
  login: {
    done: () => {},
    show: () => {},
  },
  highscore: {
    show: () => {},
    newgame: () => {},
  },
};

// Define initializers for each screen
const initializers = {
  login: () => {
    elements.inputs.nickname.addEventListener("keydown", function (e) {
      if (e.code == "Enter") {
        events.login.done(elements.inputs.nickname.value);
      }
    });
    elements.buttons.start.addEventListener("click", function () {
      events.login.done(elements.inputs.nickname.value);
    });
  },
  highscore: () => {
    elements.buttons.newGame.addEventListener("click", function () {
      events.highscore.newgame(elements.inputs.nickname.value);
    });
  },
  game: () => {
  },
};

// Define updater functions for each screen, run each time a screen is shown
const updaters = {
  login: () => {
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

        elements.containers.hsAth.innerHTML = html;

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

        elements.containers.hsWeek.innerHTML = html;
      }
    };
    xhr.send();

    // Focus on nickname
    elements.inputs.nickname.focus();
  },
  highscore: (score) => {
    // Update your score details
    elements.containers.hsYourScore.innerHTML = `
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

        elements.containers.hsAllTime.innerHTML = html;

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

        elements.containers.hsLast7Days.innerHTML = html;
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

export { onScreenEvent, showScreen, elements };
