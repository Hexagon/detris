/**
 * Keeps track of the state of the current game regardless of mode
 *
 * And for some unknown reason, the colors of the tetrominos is defined here.
 *
 * @file static/js/common/game.js
 */

export class Game {
  constructor() {
    this.colors = {
      I: ["rgb(0,255,255)", "rgb(0,230,230)", "rgb(0,205,205)"], // Cyan
      O: ["rgb(255,255,0)", "rgb(230,230,0)", "rgb(205,205,0)"], // Yellow
      T: ["rgb(128,0,128)", "rgb(108,0,108)", "rgb(88,0,88)"], // Purple
      S: ["rgb(0,128,0)", "rgb(0,108,0)", "rgb(0,88,0)"], // Green
      Z: ["rgb(255,0,0)", "rgb(230,0,0)", "rgb(205,0,0)"], // Red
      J: ["rgb(0,0,255)", "rgb(0,0,230)", "rgb(0,0,205)"], // Blue
      L: ["rgb(255,165,0)", "rgb(230,150,0)", "rgb(205,135,0)"], // Orange
    };
    this.data = null;
    this.playing = true;
    this.gameOver = null;
    this.viewport = null;
  }
  getData() {
    return this.data;
  }
  getPlaying() {
    return this.playing;
  }
  getViewport() {
    return this.viewport;
  }

  setData(d) {
    this.data = d;
  }
  setPlaying(p) {
    this.playing = p;
  }
  setGameOver() {
    this.gameOver && this.gameOver();
  }
  setViewport(v) {
    this.viewport = v;
  }

  async play() {
    const gamePromise = new Promise((resolve, _reject) => {
      this.gameOver = resolve;
    });
    return await gamePromise;
  }
}

export default Game;
