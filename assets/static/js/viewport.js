/**
 * The game viewport - canvas and context
 *
 * @file js/viewport.js
 */

import { canvasFactory } from "./canvas.js";

let dimensions = null,
  canvas = null,
  context = null,
  game = null

const viewport = {

  drawBackground() {
    context.fillStyle = "rgb(64,64,64)";
    context.fillRect(190, 10, 220, dimensions.height - 60);

    context.fillStyle = "rgb(32,32,32)";
    context.fillRect(195, 15, 210, dimensions.height - 70);
  },

  drawHider() {
    // Create gradient
    var grd = context.createLinearGradient(195, 15, 225, 30);
    grd.addColorStop(0, "rgb(8,8,8)");
    grd.addColorStop(0.8, "rgba(32,32,32,0");

    context.fillStyle = grd;
    context.fillRect(195, 15, 210, 30);
  },

  drawTetromino(position, rotation, tetromino, ghost, dummy) {
    var dx = position.X,
      dy = position.Y;

    // Loop over all sprite indexes (si == sprite index)
    for (var si = 0; si < tetromino.Sprites[rotation].Data.length; si++) {
      var currentSprite = tetromino.Sprites[rotation].Data[si];

      // Destination position in pixels
      if (dy + currentSprite.Y > 1) {
        var px = 200 + (dx + currentSprite.X) * 20,
          py = 20 + (dy + currentSprite.Y - 2) * 20;

        // Create gradient
        var grd = context.createRadialGradient(
          px + 10,
          py + 10,
          0,
          px + 10,
          py + 10,
          50,
        );
        grd.addColorStop(0, game.colors[tetromino.Type]);
        grd.addColorStop(1, "rgb(0,0,0");

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
  },

  drawData() {
    if (game && game.grid) {
      var data = game.grid.Data;

      for (var y = 0; y < 22; y++) {
        for (var x = 0; x < 10; x++) {
          // First two rows are hidden
          if (y > 1 && data[x + y * 10]) {
            var px = 200 + x * 20,
              py = 20 + (y - 2) * 20;

            // Create gradient
            var grd = context.createRadialGradient(
              px + 10,
              py + 10,
              0,
              px + 10,
              py + 10,
              50,
            );
            grd.addColorStop(0, game.colors[data[x + y * 10]]);
            grd.addColorStop(1, "rgb(0,0,0");

            context.fillStyle = grd;
            context.fillRect(px, py, 20, 20);
          }
        }
      }
    }
  },

  create() {
    // Create new canvas
    canvas = canvasFactory();

    // Place canvas in DOM
    if (!canvas.place("#game", "gf", 640, 480)) {
      console.error("Could not create canvas, bailing out.");
      return;
    }

    dimensions = {
      width: 640,
      height: 480,
    };

    // Canvas was resized
    canvas.on("resize", (inDimensions) => {
      dimensions = inDimensions;
    });

    context = canvas.getContext();
  },

  redraw(inGame) {
    game = inGame
    if (game && game.data && context) {
      context.clearRect(0, 0, dimensions.width, dimensions.height);

      if (game.playing) {
        viewport.drawBackground();
        viewport.drawData();

        viewport.drawTetromino(
          game.data.Position,
          game.data.Rotation,
          game.data.Tetrominoes[0],
        );
        viewport.drawTetromino(
          game.data.GhostPosition,
          game.data.Rotation,
          game.data.Tetrominoes[0],
          true,
        );

        viewport.drawHider();

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
        viewport.drawTetromino(
          { X: -5, Y: 5 },
          0,
          game.data.Tetrominoes[1],
          false,
          true,
        );
        context.restore();
        context.save();
        context.globalAlpha = 0.6;
        viewport.drawTetromino(
          { X: -5, Y: 8 },
          0,
          game.data.Tetrominoes[2],
          false,
          true,
        );
        context.restore();
        context.save();
        context.globalAlpha = 0.4;
        viewport.drawTetromino(
          { X: -5, Y: 11 },
          0,
          game.data.Tetrominoes[3],
          false,
          true,
        );
        context.restore();
      } else {
        viewport.drawBackground();
        viewport.drawData();

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
  },
};

export default viewport;
