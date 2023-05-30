/**
 * Takes care of rendering the current game onto the viewport
 *
 * @file static/js/viewports/singleplayer.js
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
    context.fillStyle = "rgb(64,64,64)";
    context.fillRect(100, 10, 430, dimensions.height - 60);

    context.fillStyle = "rgb(32,32,32)";
    context.fillRect(105, 15, 420, dimensions.height - 70);
  }

  #drawHider() {
    const { context } = this;
    // Create gradient
    const grd = context.createLinearGradient(95, 15, 225, 30);
    grd.addColorStop(0, "rgb(8,8,8)");
    grd.addColorStop(0.8, "rgba(32,32,32,0)");

    context.fillStyle = grd;
    context.fillRect(175, 15, 210, 30);
  }

  #fillWithGradient(color, px, py) {
    const { context } = this;
    const grd = context.createRadialGradient(
      px + 10,
      py + 10,
      0,
      px + 10,
      py + 10,
      50,
    );
    grd.addColorStop(0, color);
    grd.addColorStop(1, "rgb(0,0,0)");

    context.fillStyle = grd;
    context.fillRect(px, py, 20, 20);
  }

  #drawTetromino(position, rotation, tetromino, ghost, game) {
    const { context } = this;
    const dx = position.X;
    const dy = position.Y;
    const spritesData = tetromino.Sprites[rotation].Data;

    // Loop over all sprite indexes (si == sprite index)
    for (let si = 0; si < spritesData.length; si++) {
      const currentSprite = spritesData[si];

      // Destination position in pixels
      if (dy + currentSprite.Y > 1) {
        const px = 110 + (dx + currentSprite.X) * 20;
        const py = 20 + (dy + currentSprite.Y - 2) * 20;
        context.save();
        if (ghost) context.globalAlpha = 0.3;
        this.#fillWithGradient(game.colors[tetromino.Type], px, py);
        context.restore();
      }
    }
  }

  #drawData(game) {
    const { context } = this;
    if (game && game.data && game.data.Grid && game.data.Grid.Data) {
      const data = game.data.Grid.Data;

      for (let y = 0; y < 22; y++) {
        for (let x = 0; x < 20; x++) {
          // First two rows are hidden
          if (y > 1 && data[x + y * 20]) {
            const px = 110 + x * 20;
            const py = 20 + (y - 2) * 20;
            const grd = this.#fillWithGradient(
              game.colors[data[x + y * 20]],
              px,
              py,
            );

            context.fillStyle = grd;
            context.fillRect(px, py, 20, 20);
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
    context.fillText("LEVEL", 550, 310);
    context.fillText("LINES", 550, 380);

    context.font = "200 24px Raleway";

    context.fillText(game.data?.Score || "0", 0, 340);
    context.fillText(game.data?.Level || "0", 550, 340);
    context.fillText(game.data?.Lines || "0", 550, 410);

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
        this.#drawData(game);

        this.#drawTetromino(
          game.data.Position1,
          game.data.Rotation1,
          game.data.Tetrominoes[0][0],
          false,
          game,
        );
        this.#drawTetromino(
          game.data.GhostPosition1,
          game.data.Rotation1,
          game.data.Tetrominoes[0][0],
          true,
          game,
        );

        this.#drawTetromino(
          game.data.Position2,
          game.data.Rotation2,
          game.data.Tetrominoes[1][0],
          false,
          game,
        );
        this.#drawTetromino(
          game.data.GhostPosition2,
          game.data.Rotation2,
          game.data.Tetrominoes[1][0],
          true,
          game,
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
        );
        context.restore();
        context.save();
        context.globalAlpha = 0.8;
        this.#drawTetromino(
          { X: 22, Y: 6 },
          0,
          game.data.Tetrominoes[1][1],
          false,
          game,
        );
        context.restore();
        context.save();
        context.globalAlpha = 0.6;
        this.#drawTetromino(
          { X: 22, Y: 9 },
          0,
          game.data.Tetrominoes[1][2],
          false,
          game,
        );
        context.restore();
        context.save();
        context.globalAlpha = 0.4;
        this.#drawTetromino(
          { X: 22, Y: 12 },
          0,
          game.data.Tetrominoes[1][3],
          false,
          game,
        );
        context.restore();
      }
    }
  }
}

export { Viewport };
