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
      I: "rgb(0,255,255)", // Cyan
      O: "rgb(255,255,0)", // Yellow
      T: "rgb(196,0,196)", // Purple
      S: "rgb(0,255,0)", // Green
      Z: "rgb(255,0,0)", // Red
      J: "rgb(32,32,255)", // Blue
      L: "rgb(255,165,0)", // Orange
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
