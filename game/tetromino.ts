function getRandomInt(max: number) {
  return Math.round(Math.random() * max);
}

type Vector = {
  X: number;
  Y: number;
};

type Sprite = {
  Data: Vector[];
};

const implementedTetrominos: string[] = ["I", "J", "L", "O", "S", "T", "Z"];

type Tetromino = {
  Type: string;
  Sprites: Sprite[];
};

class TetrominoFactory {
  Inventory: Tetromino[] = [];

  getTetromino(tt: string): Tetromino {
    switch (tt) {
      case "I":
        return {
          Type: tt,
          Sprites: [
            {
              Data: [{ X: 0, Y: 1 }, { X: 1, Y: 1 }, { X: 2, Y: 1 }, {
                X: 3,
                Y: 1,
              }],
            },
            {
              Data: [{ X: 2, Y: 0 }, { X: 2, Y: 1 }, { X: 2, Y: 2 }, {
                X: 2,
                Y: 3,
              }],
            },
            {
              Data: [{ X: 0, Y: 2 }, { X: 1, Y: 2 }, { X: 2, Y: 2 }, {
                X: 3,
                Y: 2,
              }],
            },
            {
              Data: [{ X: 1, Y: 0 }, { X: 1, Y: 1 }, { X: 1, Y: 2 }, {
                X: 1,
                Y: 3,
              }],
            },
          ],
        };
      case "J":
        return {
          Type: tt,
          Sprites: [
            {
              Data: [{ X: 0, Y: 0 }, { X: 0, Y: 1 }, { X: 1, Y: 1 }, {
                X: 2,
                Y: 1,
              }],
            },
            {
              Data: [{ X: 1, Y: 0 }, { X: 2, Y: 0 }, { X: 1, Y: 1 }, {
                X: 1,
                Y: 2,
              }],
            },
            {
              Data: [{ X: 0, Y: 1 }, { X: 1, Y: 1 }, { X: 2, Y: 1 }, {
                X: 2,
                Y: 2,
              }],
            },
            {
              Data: [{ X: 1, Y: 0 }, { X: 1, Y: 1 }, { X: 1, Y: 2 }, {
                X: 0,
                Y: 2,
              }],
            },
          ],
        };
      //...
      case "L":
        return {
          Type: tt,
          Sprites: [
            {
              Data: [{ X: 2, Y: 0 }, { X: 0, Y: 1 }, { X: 1, Y: 1 }, {
                X: 2,
                Y: 1,
              }],
            },
            {
              Data: [{ X: 1, Y: 0 }, { X: 2, Y: 2 }, { X: 1, Y: 1 }, {
                X: 1,
                Y: 2,
              }],
            },
            {
              Data: [{ X: 0, Y: 1 }, { X: 1, Y: 1 }, { X: 2, Y: 1 }, {
                X: 0,
                Y: 2,
              }],
            },
            {
              Data: [{ X: 1, Y: 0 }, { X: 1, Y: 1 }, { X: 1, Y: 2 }, {
                X: 0,
                Y: 0,
              }],
            },
          ],
        };
      case "O":
        return {
          Type: tt,
          Sprites: [
            {
              Data: [{ X: 1, Y: 0 }, { X: 2, Y: 0 }, { X: 1, Y: 1 }, {
                X: 2,
                Y: 1,
              }],
            },
            {
              Data: [{ X: 1, Y: 0 }, { X: 2, Y: 0 }, { X: 1, Y: 1 }, {
                X: 2,
                Y: 1,
              }],
            },
            {
              Data: [{ X: 1, Y: 0 }, { X: 2, Y: 0 }, { X: 1, Y: 1 }, {
                X: 2,
                Y: 1,
              }],
            },
            {
              Data: [{ X: 1, Y: 0 }, { X: 2, Y: 0 }, { X: 1, Y: 1 }, {
                X: 2,
                Y: 1,
              }],
            },
          ],
        };
      case "S":
        return {
          Type: tt,
          Sprites: [
            {
              Data: [{ X: 0, Y: 1 }, { X: 1, Y: 1 }, { X: 1, Y: 0 }, {
                X: 2,
                Y: 0,
              }],
            },
            {
              Data: [{ X: 1, Y: 0 }, { X: 1, Y: 1 }, { X: 2, Y: 1 }, {
                X: 2,
                Y: 2,
              }],
            },
            {
              Data: [{ X: 0, Y: 2 }, { X: 1, Y: 2 }, { X: 1, Y: 1 }, {
                X: 2,
                Y: 1,
              }],
            },
            {
              Data: [{ X: 0, Y: 0 }, { X: 0, Y: 1 }, { X: 1, Y: 1 }, {
                X: 1,
                Y: 2,
              }],
            },
          ],
        };
      case "T":
        return {
          Type: tt,
          Sprites: [
            {
              Data: [{ X: 0, Y: 1 }, { X: 1, Y: 1 }, { X: 1, Y: 0 }, {
                X: 2,
                Y: 1,
              }],
            },
            {
              Data: [{ X: 1, Y: 0 }, { X: 1, Y: 1 }, { X: 2, Y: 1 }, {
                X: 1,
                Y: 2,
              }],
            },
            {
              Data: [{ X: 0, Y: 1 }, { X: 1, Y: 2 }, { X: 1, Y: 1 }, {
                X: 2,
                Y: 1,
              }],
            },
            {
              Data: [{ X: 1, Y: 0 }, { X: 0, Y: 1 }, { X: 1, Y: 1 }, {
                X: 1,
                Y: 2,
              }],
            },
          ],
        };
      case "Z":
        return {
          Type: tt,
          Sprites: [
            {
              Data: [{ X: 0, Y: 0 }, { X: 1, Y: 1 }, { X: 1, Y: 0 }, {
                X: 2,
                Y: 1,
              }],
            },
            {
              Data: [{ X: 2, Y: 0 }, { X: 1, Y: 1 }, { X: 2, Y: 1 }, {
                X: 1,
                Y: 2,
              }],
            },
            {
              Data: [{ X: 0, Y: 1 }, { X: 1, Y: 2 }, { X: 1, Y: 1 }, {
                X: 2,
                Y: 2,
              }],
            },
            {
              Data: [{ X: 1, Y: 0 }, { X: 0, Y: 1 }, { X: 1, Y: 1 }, {
                X: 0,
                Y: 2,
              }],
            },
          ],
        };
      default:
        throw new Error("Tried to initialize unknown tetromino type");
    }
  }

  Next(): Tetromino {
    // Refill factory ?
    if (this.Inventory.length === 0) {
      for (let i = 0; i < 7; i++) {
        this.Inventory.push(this.getTetromino(implementedTetrominos[i]));
      }
    }

    // Draw next
    // - Get a random index between 0 and <no of tetrominoes left>
    const ri = getRandomInt(this.Inventory.length - 1);

    // - Store reference to found tetromino before removing it from factory
    const next = this.Inventory.splice(ri, 1)[0];

    return next;
  }
}

export { TetrominoFactory };
export type { Sprite, Tetromino, Vector };
