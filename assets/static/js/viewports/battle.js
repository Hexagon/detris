/**
 * Takes care of rendering the current game onto the viewport in PvP mode
 *
 * @file static/js/viewports/battle.js
 */

import { Canvas } from "../common/canvas.js";

class Viewport {
  constructor(destinationElmId, gf, width, height) {
    // Create new canvas
    this.canvas = new Canvas();

    // Place canvas in DOM
    if (!this.canvas.place(destinationElmId, gf, width, height)) {
      console.error("Could not create canvas, bailing out.");
      return;
    }

    this.dimensions = {
      width,
      height,
    };

    // Canvas was resized
    /*this.canvas.on("resize", (inDimensions) => {
      this.dimensions = inDimensions;
    });*/

    this.context = this.canvas.getContext();
  }

  #drawBackground() {
    const { context, dimensions } = this;

    // Player 1
    context.fillStyle = "rgb(32, 33, 34)";
    context.fillRect(100, 10, 220, dimensions.height - 60);

    context.fillStyle = "rgb(10, 11, 12)";
    context.fillRect(105, 15, 210, dimensions.height - 70);

    // Player 2
    context.fillStyle = "rgb(32, 33, 34)";
    context.fillRect(100 + 230, 10, 220, dimensions.height - 60);

    context.fillStyle = "rgb(10, 11, 12)";
    context.fillRect(105 + 230, 15, 210, dimensions.height - 70);
  }

  #drawHider() {
    const { context } = this;
    // Create gradient
    const grd = context.createLinearGradient(95, 15, 225, 30);
    grd.addColorStop(0, "rgb(8,8,8)");
    grd.addColorStop(0.8, "rgba(32,32,32,0)");

    context.fillStyle = grd;
    context.fillRect(175, 15, 210, 30);

    // Create player 2 gradient
    const grd2 = context.createLinearGradient(95 + 230, 15, 225, 30);
    grd2.addColorStop(0, "rgb(8,8,8)");
    grd2.addColorStop(0.8, "rgba(32,32,32,0)");

    context.fillStyle = grd2;
    context.fillRect(175 + 230, 15, 210, 30);
  }

  #fillWithGradient(color, px, py) {
    const { context } = this;
    const size = 19; // size of the block

    // Draw lighter top edge
    const topGradient = context.createLinearGradient(px, py, px, py + size);
    topGradient.addColorStop(0, color[0]);
    topGradient.addColorStop(1, color[1]);
    context.fillStyle = topGradient;
    context.beginPath();
    context.moveTo(px, py);
    context.lineTo(px + size, py);
    context.lineTo(px + size - 5, py + 5);
    context.lineTo(px + 5, py + 5);
    context.closePath();
    context.fill();

    // Draw lighter left edge
    const leftGradient = context.createLinearGradient(px, py, px + size, py);
    leftGradient.addColorStop(0, color[0]);
    leftGradient.addColorStop(1, color[1]);
    context.fillStyle = leftGradient;
    context.beginPath();
    context.moveTo(px, py);
    context.lineTo(px, py + size);
    context.lineTo(px + 5, py + size - 5);
    context.lineTo(px + 5, py + 5);
    context.closePath();
    context.fill();

    // Draw darker bottom edge
    const bottomGradient = context.createLinearGradient(px, py + size, px, py);
    bottomGradient.addColorStop(0, color[2]);
    bottomGradient.addColorStop(1, color[1]);
    context.fillStyle = bottomGradient;
    context.beginPath();
    context.moveTo(px, py + size);
    context.lineTo(px + size, py + size);
    context.lineTo(px + size - 5, py + size - 5);
    context.lineTo(px + 5, py + size - 5);
    context.closePath();
    context.fill();

    // Draw darker right edge
    const rightGradient = context.createLinearGradient(px + size, py, px, py);
    rightGradient.addColorStop(0, color[2]);
    rightGradient.addColorStop(1, color[1]);
    context.fillStyle = rightGradient;
    context.beginPath();
    context.moveTo(px + size, py);
    context.lineTo(px + size, py + size);
    context.lineTo(px + size - 5, py + size - 5);
    context.lineTo(px + size - 5, py + 5);
    context.closePath();
    context.fill();

    // Draw inner square
    context.fillStyle = color[1];
    context.fillRect(px + 5, py + 5, size - 10, size - 10);
  }

  #drawTetromino(position, rotation, tetromino, ghost, game, playerIndex) {
    const { context } = this;
    const dx = position.X;
    const dy = position.Y;
    const spritesData = tetromino.Sprites[rotation].Data;

    // Loop over all sprite indexes (si == sprite index)
    for (let si = 0; si < spritesData.length; si++) {
      const currentSprite = spritesData[si];

      // Destination position in pixels
      if (dy + currentSprite.Y > 1) {
        const px = 110 + (playerIndex === 0 ? 0 : 230) +
          (dx + currentSprite.X) * 20;
        const py = 20 + (dy + currentSprite.Y - 2) * 20;
        context.save();
        if (ghost) context.globalAlpha = 0.3;
        this.#fillWithGradient(game.colors[tetromino.Type], px, py);
        context.restore();
      }
    }
  }

  #drawData(playerIndex, game) {
    if (
      game && game.data && game.data.Grid[playerIndex] &&
      game.data.Grid[playerIndex].Data
    ) {
      const data = game.data.Grid[playerIndex].Data;
      for (let y = 0; y < 22; y++) {
        for (let x = 0; x < 10; x++) {
          if (y > 1 && data[x + y * 10]) {
            const px = 110 + (playerIndex === 0 ? 0 : 230) + x * 20;
            const py = 20 + (y - 2) * 20;

            this.#fillWithGradient(game.colors[data[x + y * 10]], px, py);
          }
        }
      }
    }
  }

  #drawTexts(game) {
    const { context } = this;
    context.font = "200 16px Raleway";
    context.fillStyle = "rgb(196,196,196)";

    context.fillText("QUEUE", 0, 80);
    context.fillText("QUEUE", 550, 80);
    context.fillText("SCORE", 0, 310);
    context.fillText("LEVEL", 0, 340);
    context.fillText("LINES", 0, 380);

    context.font = "200 24px Raleway";

    context.fillText(game.data?.Score[0] || "0", 0, 340);
    context.fillText(game.data?.Level[0] || "0", 0, 370);
    context.fillText(game.data?.Lines[0] || "0", 0, 410);

    context.fillText("Player 1", 0, 30);
    context.fillText("Player 2", 550, 30);
  }

  redraw(gameData) {
    if (gameData && this.context) {
      const { context, dimensions } = this;
      const game = gameData;
      if (game.playing && game.data) {
        context.clearRect(0, 0, dimensions.width, dimensions.height);

        this.#drawBackground();
        this.#drawData(0, game);
        this.#drawData(1, game);

        this.#drawTetromino(
          game.data.Position[0],
          game.data.Rotation[0],
          game.data.Tetrominoes[0][0],
          false,
          game,
          0,
        );
        this.#drawTetromino(
          game.data.GhostPosition[0],
          game.data.Rotation[0],
          game.data.Tetrominoes[0][0],
          true,
          game,
          0,
        );

        this.#drawTetromino(
          game.data.Position[1],
          game.data.Rotation[1],
          game.data.Tetrominoes[1][0],
          false,
          game,
          1,
        );
        this.#drawTetromino(
          game.data.GhostPosition[1],
          game.data.Rotation[1],
          game.data.Tetrominoes[1][0],
          true,
          game,
          1,
        );

        this.#drawHider();
        this.#drawTexts(game);

        // Draw queue
        context.save();
        context.globalAlpha = 0.8;
        this.#drawTetromino(
          { X: -5, Y: 6 },
          0,
          game.data.Tetrominoes[0][1],
          false,
          game,
          0,
        );
        context.restore();
        context.save();
        context.globalAlpha = 0.6;
        this.#drawTetromino(
          { X: -5, Y: 9 },
          0,
          game.data.Tetrominoes[0][2],
          false,
          game,
          0,
        );
        context.restore();
        context.save();
        context.globalAlpha = 0.4;
        this.#drawTetromino(
          { X: -5, Y: 12 },
          0,
          game.data.Tetrominoes[0][3],
          false,
          game,
          0,
        );
        context.restore();
        context.save();
        context.globalAlpha = 0.8;
        this.#drawTetromino(
          { X: 12, Y: 6 },
          0,
          game.data.Tetrominoes[1][1],
          false,
          game,
          1,
        );
        context.restore();
        context.save();
        context.globalAlpha = 0.6;
        this.#drawTetromino(
          { X: 12, Y: 9 },
          0,
          game.data.Tetrominoes[1][2],
          false,
          game,
          1,
        );
        context.restore();
        context.save();
        context.globalAlpha = 0.4;
        this.#drawTetromino(
          { X: 12, Y: 12 },
          0,
          game.data.Tetrominoes[1][3],
          false,
          game,
          1,
        );
        context.restore();
      }
    }
  }
}

export { Viewport };
