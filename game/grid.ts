// grid/grid.ts

import { Vector } from "./tetromino.ts";

export class GameGrid {
  Data: Array<string | undefined>;

  // Standard tetris game field is 10 units wide and 22 units high, with the topmost 2 rows hidden
  constructor(public width = 10, public height = 22) {
    this.Data = new Array(width * height).fill(undefined);
  }

  // Grid methods
  Clear() {
    // Reset game field
    for (let i = 0; i < this.Data.length; i++) {
      this.Data[i] = undefined;
    }
  }

  ApplySprite(s: Array<Vector>, p: Vector, t: string): number {
    let clearedRows = 0;

    // Do the applying
    for (const v of s) {
      const targetX = v.X + p.X;
      const targetY = v.Y + p.Y;

      this.Data[targetX + targetY * this.width] = t;

      // End condition, return -1!
      if (targetY < 2) {
        return -1;
      }
    }

    // Check if we shall pop a row
    for (let y = 2; y < this.height; y++) {
      let fullRow = true;

      for (let x = 0; x < this.width; x++) {
        if (this.Data[x + y * this.width] === undefined) {
          fullRow = false;
        }
      }

      if (fullRow) {
        for (let y2 = y; y2 >= 1; y2--) {
          for (let x = 0; x < this.width; x++) {
            this.Data[x + y2 * this.width] =
              this.Data[x + (y2 - 1) * this.width];
          }
        }
        clearedRows += 1;
      }
    }

    return clearedRows;
  }
}
