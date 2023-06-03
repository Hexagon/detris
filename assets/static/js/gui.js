/**
 * Everything related to dom, except the canvas
 *
 * @file js/gui.js
 */

import { debounce, htmlEscape } from "./utils.js";

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

    // Battle screen
    battlegame: document.getElementById("viewBattleGame"),
    battlehighscore: document.getElementById("viewBattleHighscore"),
  },
  labels: {
    status: document.getElementById("lblStarting"),
  },
  inputs: {
    nickname: document.getElementById("txtNickname"),
    checkprivate: document.getElementById("chkPrivate"),
    checkai: document.getElementById("chkAI"),
    code: document.getElementById("txtCode"),
  },
  buttons: {
    singleplayer: document.getElementById("btnSingleplayer"),
    singleplayernewgame: document.getElementById("btnSingleplayerNewGame"),
    singleplayermainmenu: document.getElementById("btnSingleplayerMainMenu"),

    coop: document.getElementById("btnCoop"),
    coopstart: document.getElementById("btnCoopStart"),
    coopmainmenu: document.getElementById("btnCoopMainMenu"),

    abortedmainmenu: document.getElementById("btnAbortedMainMenu"),

    // Battle buttons
    battle: document.getElementById("btnBattle"),
    battlemainmenu: document.getElementById("btnBattleMainMenu"),
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
    hsCoopAllTime: document.getElementById("hsCoopAllTime"),
    hsCoopLast7Days: document.getElementById("hsCoopLast7Days"),

    /* Battle highscore view */
    hsBattleYourScore: document.getElementById("hsBattleYourScore"),
    hsBattleAllTime: document.getElementById("hsBattleAllTime"),
    hsBattleLast7Days: document.getElementById("hsBattleLast7Days"),
  },
};

const events = {};

// Define initializers for each screen
const validateNickname = (n) => {
  if (n.length < 2) {
    return "Nickname too short, need to be at least 2 characters";
  } else if (n.length > 15) {
    return "Nickname too long, need to be at most 15 characters";
  }
};
const initializers = {
  modeselect: () => {
    elements.buttons.singleplayer.addEventListener("click", function () {
      const validationResult = validateNickname(elements.inputs.nickname.value);
      if (validationResult === undefined) {
        events.modeselect.singleplayer(elements.inputs.nickname.value);
      }
    });
    elements.buttons.coop.addEventListener("click", function () {
      const validationResult = validateNickname(elements.inputs.nickname.value);
      if (validationResult === undefined) {
        events.modeselect.coop(
          elements.inputs.nickname.value,
          elements.inputs.code.value,
          !!elements.inputs.checkai.checked,
        );
      }
    });
    elements.buttons.battle.addEventListener("click", function () {
      const validationResult = validateNickname(elements.inputs.nickname.value);
      if (validationResult === undefined) {
        events.modeselect.battle(
          elements.inputs.nickname.value,
          elements.inputs.code.value,
          !!elements.inputs.checkai.checked,
        );
      }
    });
    elements.inputs.nickname.addEventListener("keyup", () => {
      debounce("nicknameValidation", () => {
        const validationResult = validateNickname(
          elements.inputs.nickname.value,
        );
        if (validationResult !== undefined) {
          console.warn("Nickname validation error: " + validationResult);
          elements.inputs.nickname.className =
            elements.inputs.nickname.className + " validation-failed";
        } else {
          elements.inputs.nickname.className = elements.inputs.nickname
            .className.replace(/validation\-failed/g, "");
        }
      });
    });
    elements.inputs.checkprivate.addEventListener("change", function (e) {
      if (e && e.target && e.target.checked) {
        elements.inputs.code.style.display = "block";
      } else {
        elements.inputs.code.value = "";
        elements.inputs.code.style.display = "none";
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
  battlehighscore: () => {
    elements.buttons.battlemainmenu.addEventListener("click", function () {
      events.battlehighscore.mainmenu(elements.inputs.nickname.value);
    });
  },
  aborted: () => {
    elements.buttons.abortedmainmenu.addEventListener("click", function () {
      events.aborted.mainmenu(elements.inputs.nickname.value);
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

    // Fetch highscore
    const xhrCoop = new XMLHttpRequest();
    xhrCoop.open("GET", "api/highscores/coop");
    xhrCoop.onload = function () {
      if (xhrCoop.status === 200) {
        const res = JSON.parse(xhrCoop.responseText);
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

        elements.containers.hsCoopAth.innerHTML = html;
      }
    };
    xhrCoop.send();

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
  coophighscore: (score) => {
    // Update your score details
    elements.containers.hsCoopYourScore.innerHTML = `
      <h5>Your Score: ${score}</h5>
      <!-- Additional score details -->
    `;

    // Fetch highscore
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "api/highscores/coop");
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

        elements.containers.hsCoopAllTime.innerHTML = html;

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

        elements.containers.hsCoopLast7Days.innerHTML = html;
      }
    };
    xhr.send();
  },
  battlehighscore: (score) => {
    // Update your score details
    if (score === undefined) {
      elements.containers.hsBattleYourScore.innerHTML = `
      <h5>You Lost!</h5>
      <!-- Additional score details -->
    `;
    } else {
      elements.containers.hsBattleYourScore.innerHTML = `
      <h5>You Won!</h5>
      <h5>Score: ${score}</h5>
      <!-- Additional score details -->
    `;
    }

    setTimeout(() => {
      // Fetch highscore
      const xhr = new XMLHttpRequest();
      xhr.open("GET", "api/highscores/battle");
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

          elements.containers.hsBattleAllTime.innerHTML = html;

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

          elements.containers.hsBattleLast7Days.innerHTML = html;
        }
      };
      xhr.send();
    }, 1500);
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
