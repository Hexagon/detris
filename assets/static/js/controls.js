// deno-lint-ignore-file no-window-prefix
/**
 * Keeps track of player controls
 *
 * @file static/js/controls.js
 */

class Controls {
  #handleChange = null;
  #touchControlsEnabled = false

  constructor() {
    this.listenKeys = [
      "ArrowUp",
      "ArrowLeft",
      "ArrowRight",
      "ArrowDown",
      "KeyA",
      "KeyD",
      "Space",
    ];

    this.#initialize();
  }

  enableTouch() {
    this.touchControlsEnabled = true
  } 

  diableTouch() {
    this.touchControlsEnabled = false
  } 

  #setState(prop, val, _isEvent) {
    if (this.#handleChange) {
      this.#handleChange({ key: prop, state: val });
    }
  }

  #handleKeyDown(e) {
    if (this.listenKeys.includes(e.code)) {
      if (e.code === "Space") this.#setState("drop", true);
      if (e.code === "ArrowUp") this.#setState("rotCW", true);
      if (e.code === "KeyA") this.#setState("rotCCW", true);
      if (e.code === "KeyD") this.#setState("rotCW", true);
      if (e.code === "ArrowLeft") this.#setState("left", true);
      if (e.code === "ArrowRight") this.#setState("right", true);
      if (e.code === "ArrowDown") this.#setState("down", true);
    }
  }

  #handleKeyUp(e) {
    if (this.listenKeys.includes(e.code)) {
      if (e.code === "Space") this.#setState("drop", false);
      if (e.code === "ArrowUp") this.#setState("rotCW", false);
      if (e.code === "KeyA") this.#setState("rotCCW", false);
      if (e.code === "KeyD") this.#setState("rotCW", false);
      if (e.code === "ArrowLeft") this.#setState("left", false);
      if (e.code === "ArrowRight") this.#setState("right", false);
      if (e.code === "ArrowDown") this.#setState("down", false);
    }
  }
  #handleTouchStart(e) {
    if (this.touchControlsEnabled) {
      for(const touch of e.touches) {
        const screenCenterX = window.innerWidth / 2;
        const screenCenterY = window.innerHeight / 2;
        if (touch.clientY < screenCenterY) {
          this.#setState("rotCW", true);
        } else if (touch.clientX < screenCenterX / 2) {
          this.#setState("rotCCW", true);
        } else if (touch.clientX < screenCenterX) {
          this.#setState("down", true);
        } else {
          this.#setState("drop", true);
        }
      }
    }
  }

  #handleTouchEnd(e) {
    if (this.#touchControlsEnabled) {
      for(const touch of e.touches) {
        const screenCenterX = window.innerWidth / 2;
        const screenCenterY = window.innerHeight / 2;
        if (touch.clientY < screenCenterY) {
          this.#setState("rotCW", false);
        } else if (touch.clientX < screenCenterX / 2) {
          this.#setState("rotCCW", false);
        } else if (touch.clientX < screenCenterX) {
          this.#setState("down", false);
        } else {
          this.#setState("drop", false);
        }
      }
    }
  }

  #initialize() {
    window.addEventListener("keydown", (e) => this.#handleKeyDown(e));
    window.addEventListener("keyup", (e) => this.#handleKeyUp(e));
    if (window.DocumentTouch && document instanceof DocumentTouch) {
      window.addEventListener("touchstart", (e) => this.#handleTouchStart(e));
      window.addEventListener("touchend", (e) => this.#handleTouchEnd(e));
      window.addEventListener("touchcancel", (e) => this.#handleTouchEnd(e));
      for(const elm of document.querySelectorAll(".touch")) {
        elm.style.display = "block"
      }
    }
  }

  setHandleChange(callback) {
    this.#handleChange = callback;
  }
}

export { Controls };
