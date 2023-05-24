

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

  getData() { return this.data }
  getGrid() { return this.data }
  getPlaying() { return this.data }
  
  setData(d) {
    this.data = d
  }

  setGrid(g) {
    this.grid = g
  }

  setPlaying(p) {
    this.playing = p
  }

  setGameOver() {
    this.gameOver && this.gameOver()
  }

  async play() {
    const gamePromise = new Promise((resolve, _reject) => {
      this.gameOver = resolve;
    });
    return await gamePromise;
  }

}

export default Game;
