// viewport.js
import { Canvas } from "./canvas.js";

class Viewport {
  constructor(destinationElmId, gf, width, height) {

    this.game = null;
    
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
    context.fillRect(190, 10, 220, dimensions.height - 60);

    context.fillStyle = "rgb(32,32,32)";
    context.fillRect(195, 15, 210, dimensions.height - 70);
  }

  #drawHider() {
    const { context } = this;
    // Create gradient
    const grd = context.createLinearGradient(195, 15, 225, 30);
    grd.addColorStop(0, "rgb(8,8,8)");
    grd.addColorStop(0.8, "rgba(32,32,32,0)");

    context.fillStyle = grd;
    context.fillRect(195, 15, 210, 30);
  }

  #drawTetromino(position, rotation, tetromino, ghost) {
    const { context, game } = this;
    const dx = position.X;
    const dy = position.Y;

    // Loop over all sprite indexes (si == sprite index)
    for (let si = 0; si < tetromino.Sprites[rotation].Data.length; si++) {
      const currentSprite = tetromino.Sprites[rotation].Data[si];

      // Destination position in pixels
      if (dy + currentSprite.Y > 1) {
        const px = 200 + (dx + currentSprite.X) * 20;
        const py = 20 + (dy + currentSprite.Y - 2) * 20;

        // Create gradient
        const grd = context.createRadialGradient(px + 10, py + 10, 0, px + 10, py + 10, 50);
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

  #drawData() {
    const { context, game } = this;
    if (game && game.grid) {
      const data = game.grid.Data;

      for (let y = 0; y < 22; y++) {
        for (let x = 0; x < 10; x++) {
          // First two rows are hidden
          if (y > 1 && data[x + y * 10]) {
            const px = 200 + x * 20;
            const py = 20 + (y - 2) * 20;

            // Create gradient
            const grd = context.createRadialGradient(px + 10, py + 10, 0, px + 10, py + 10, 50);
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
    this.game = gameData;
    if (this.game && this.game.data && this.context) {
      const { context, dimensions, game } = this;
      context.clearRect(0, 0, dimensions.width, dimensions.height);

      if (game.playing) {
        this.#drawBackground();
        this.#drawData();

        this.#drawTetromino(
          game.data.Position,
          game.data.Rotation,
          game.data.Tetrominoes[0]
        );
        this.#drawTetromino(
          game.data.GhostPosition,
          game.data.Rotation,
          game.data.Tetrominoes[0],
          true
        );

        this.#drawHider();

        context.font = "200 16px Raleway";
        context.fillStyle = "rgb(196,196,196)";

        context.fillText("QUEUE", 105, 50);
        context.fillText("SCORE", 450, 50);
        context.fillText("LEVEL", 450, 120);
        context.fillText("LINES", 450, 190);

        context.font = "200 24px Raleway";

        context.fillText(game.data.Score, 450, 80);
        context.fillText(game.data.Level, 450, 150);
        context.fillText(game.data.Lines, 450, 220);

        context.save();
        context.globalAlpha = 0.8;
        this.#drawTetromino({ X: -5, Y: 5 }, 0, game.data.Tetrominoes[1], false, true);
        context.restore();
        context.save();
        context.globalAlpha = 0.6;
        this.#drawTetromino({ X: -5, Y: 8 }, 0, game.data.Tetrominoes[2], false, true);
        context.restore();
        context.save();
        context.globalAlpha = 0.4;
        this.#drawTetromino({ X: -5, Y: 11 }, 0, game.data.Tetrominoes[3], false, true);
        context.restore();
      } else {
        this.#drawBackground();
        this.#drawData();

        // Draw overlay
        context.fillStyle = "rgba(0,0,0,0.8)";
        context.fillRect(0, 0, dimensions.width, dimensions.height);

        context.font = "80px Raleway";
        context.textAlign = "center";

        context.fillStyle = "rgb(196,196,196)";
        context.fillText("GAME OVER", dimensions.width / 2, 160);

        context.font = "20px Raleway";
        context.fillStyle = "rgb(255,255,255)";
        context.fillText("Final score", dimensions.width / 2, 250);

        context.font = "60px Raleway";
        context.fillText(game.data.Score, dimensions.width / 2, 320);
      }
    }
  }
}

export { Viewport };
