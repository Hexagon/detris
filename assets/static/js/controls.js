class Controls {
  #handleChange = null;

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

  #initialize() {
    window.addEventListener("keydown", (e) => {
      this.#handleKeyDown(e);
    });
    window.addEventListener("keyup", (e) => {
      this.#handleKeyUp(e);
    });
  }

  setHandleChange(callback) {
    this.#handleChange = callback;
  }
}

export { Controls };
