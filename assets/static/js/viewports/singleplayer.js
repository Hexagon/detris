/**
 * Takes care of rendering the current game onto the viewport
 *
 * @file static/js/viewports/singleplayer.js
 */

import { Canvas } from "../canvas.js";

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
    context.fillRect(80, 10, 220, dimensions.height - 60);

    context.fillStyle = "rgb(32,32,32)";
    context.fillRect(85, 15, 210, dimensions.height - 70);
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

  #drawTetromino(position, rotation, tetromino, ghost, game) {
    const { context } = this;
    const dx = position.X;
    const dy = position.Y;

    // Loop over all sprite indexes (si == sprite index)
    for (let si = 0; si < tetromino.Sprites[rotation].Data.length; si++) {
      const currentSprite = tetromino.Sprites[rotation].Data[si];

      // Destination position in pixels
      if (dy + currentSprite.Y > 1) {
        const px = 90 + (dx + currentSprite.X) * 20;
        const py = 20 + (dy + currentSprite.Y - 2) * 20;

        // Create gradient
        const grd = context.createRadialGradient(
          px + 10,
          py + 10,
          0,
          px + 10,
          py + 10,
          50,
        );
        grd.addColorStop(0, game.colors[tetromino.Type]);
        grd.addColorStop(1, "rgb(0,0,0)");

        // Fill with gradient
        if (ghost) {
          context.save();
          context.globalAlpha = 0.3;
          context.fillStyle = grd;
          context.fillRect(px, py, 20, 20);
          context.restore();
        } else {
          context.fillStyle = grd;
          context.fillRect(px, py, 20, 20);
        }
      }
    }
  }

  #drawData(game) {
    const { context } = this;
    if (game && game.data && game.data.Grid && game.data.Grid.Data) {
      const data = game.data.Grid.Data;

      for (let y = 0; y < 22; y++) {
        for (let x = 0; x < 10; x++) {
          // First two rows are hidden
          if (y > 1 && data[x + y * 10]) {
            const px = 90 + x * 20;
            const py = 20 + (y - 2) * 20;

            // Create gradient
            const grd = context.createRadialGradient(
              px + 10,
              py + 10,
              0,
              px + 10,
              py + 10,
              50,
            );
            grd.addColorStop(0, game.colors[data[x + y * 10]]);
            grd.addColorStop(1, "rgb(0,0,0)");

            context.fillStyle = grd;
            context.fillRect(px, py, 20, 20);
          }
        }
      }
    }
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
          game.data.Position,
          game.data.Rotation,
          game.data.Tetrominoes[0],
          false,
          game,
        );
        this.#drawTetromino(
          game.data.GhostPosition,
          game.data.Rotation,
          game.data.Tetrominoes[0],
          true,
          game,
        );

        this.#drawHider();

        context.font = "200 16px Raleway";
        context.fillStyle = "rgb(196,196,196)";

        context.fillText("QUEUE", 0, 50);
        context.fillText("SCORE", 330, 50);
        context.fillText("LEVEL", 330, 120);
        context.fillText("LINES", 330, 190);

        context.font = "200 24px Raleway";

        // ToDo: Get from player insted
        context.fillText(game.state?.Score || "0", 330, 80);
        context.fillText(game.data?.Level || "0", 330, 150);
        context.fillText(game.data?.Lines || "0", 330, 220);

        context.save();
        context.globalAlpha = 0.8;
        this.#drawTetromino(
          { X: -5, Y: 5 },
          0,
          game.data.Tetrominoes[1],
          false,
          game,
        );
        context.restore();
        context.save();
        context.globalAlpha = 0.6;
        this.#drawTetromino(
          { X: -5, Y: 8 },
          0,
          game.data.Tetrominoes[2],
          false,
          game,
        );
        context.restore();
        context.save();
        context.globalAlpha = 0.4;
        this.#drawTetromino(
          { X: -5, Y: 11 },
          0,
          game.data.Tetrominoes[3],
          false,
          game,
        );
        context.restore();
      }
    }
  }
}

export { Viewport };
