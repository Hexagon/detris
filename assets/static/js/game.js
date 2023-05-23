import viewport from "./viewport.js";
import controls from "./controls.js";
import network from "./network.js";

export class Game {
  constructor() {
    this.colors = {
      I: "rgb(0,255,255)", // Cyan
      O: "rgb(255,255,0)", // Yellow
      T: "rgb(196,0,196)", // Purple
      S: "rgb(0,255,0)", // Green
      Z: "rgb(255,0,0)", // Red
      J: "rgb(32,32,255)", // Blue
      L: "rgb(255,165,0)", // Orange
    };
    this.data = null;
    this.grid = null;
    this.playing = true;
    this.gameOver = null;
    this.server = null;
  }

  async setup(nickname, control) {
    const self = this;
    const done = new Promise(function (resolve, reject) {
      const timeout = setTimeout(() => {
        reject(new Error("Connection timeout"));
      }, 10000);

      // Connect to the server
      self.server = network.connect(
        "/ws",
        /* onMessage */
        (o) => {
          if (o.Position) {
            self.data = o;
          } else if (o.Data) {
            self.grid = o;
          } else if (o.gameOver) {
            self.playing = false;
            self.gameOver && self.gameOver();
          }
          viewport.redraw(self);
        },
        /* onConnect */
        () => {
          clearTimeout(timeout);
          self.server.sendPlayerReady(nickname);
          resolve();
        },
        /* onDisconnect */
        () => {
        },
      );

      // Attach controls
      control.setHandleChange((c) => {
        self.server.sendControlsChange(c);
      });
    });

    return await done;
  }

  async play() {
    const gamePromise = new Promise((resolve, _reject) => {
      this.gameOver = resolve;
    });
    return await gamePromise;
  }

  cleanup() {
    // Clean up any resources, event listeners, etc.
    network.disconnect();
  }
}

export default Game;
