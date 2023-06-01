// server/AIPlayer.ts
import { Game } from "../game/game.ts";
import { GameGrid } from "../game/grid.ts";
import { Vector } from "../game/tetromino.ts";
import { BasePlayer } from "./baseplayer.ts";

class AIPlayer extends BasePlayer {
  private aiInterval: number | undefined;

  private BOT_NICKNAME = "AI-BOT";
  private BASE_DECISION_DELAY_MS = 200;
  private RANDOM_DECISION_DELAY_MAX_MS = 500;

  // deno-lint-ignore no-explicit-any
  constructor(games: Game[], config: any) {
    super(null, games); // null socket
    this.setNickname(this.BOT_NICKNAME);

    // Custom config
    if (config) {
      if (config.BOT_NICKNAME) this.BOT_NICKNAME = config.BOT_NICKNAME;
      if (config.BASE_DECISION_DELAY_MS) {
        this.BASE_DECISION_DELAY_MS = config.BASE_DECISION_DELAY_MS;
      }
      if (config.RANDOM_DECISION_DELAY_MAX_MS) {
        this.RANDOM_DECISION_DELAY_MAX_MS = config.RANDOM_DECISION_DELAY_MAX_MS;
      }
    }

    // Cap custom config
    if (this.BASE_DECISION_DELAY_MS < 50) this.BASE_DECISION_DELAY_MS = 50;
    if (this.RANDOM_DECISION_DELAY_MAX_MS < 50) {
      this.RANDOM_DECISION_DELAY_MAX_MS = 50;
    }
  }

  public connect(game: Game) {
    if (!(game.getMode() === "battle" || game.getMode() === "coop")) {
      throw new Error("Bot only supports battle or coop games");
    }
    this.setGame(game);
    this.g?.addPlayer(this);
    this.startAI();
  }

  public setKeyState(key: string, value: boolean) {
    this.controls[key] = value;
    if (this.g) this.g.act(this, key, value);
  }

  private startAI() {
    this.aiInterval = setInterval(
      () => {
        const controls = this.calculateAIControls();
        for (const key in controls) {
          this.setKeyState(key, controls[key]);
        }

        if (this.g?.getStatus() === "gameover") {
          clearInterval(this.aiInterval);
        }
      },
      this.BASE_DECISION_DELAY_MS +
        (Math.random() * this.RANDOM_DECISION_DELAY_MAX_MS),
    ); // AI decision every xms
  }

  private calculateAIControls(): { [key: string]: boolean } {
    const controls: { [key: string]: boolean } = {
      "up": false,
      "down": false,
      "left": false,
      "right": false,
      "rotCW": false,
      "rotCCW": false,
      "drop": false,
    };

    if (!this.g) {
      return controls;
    }

    const playerIndex = this.g.getPlayerIndex(this);
    // deno-lint-ignore no-explicit-any
    const gameData: any = this.g.getDataNew();

    const currentTetromino = gameData.Tetrominoes[playerIndex][0];
    const _nextTetromino = gameData.Tetrominoes[playerIndex][1];

    const currentPosition = gameData.Position[playerIndex];
    const currentRotation = gameData.Rotation[playerIndex];

    const grid: GameGrid = this.g.getMode() === "battle"
      ? gameData.Grid[playerIndex]
      : gameData.Grid;

    let leastSpaceBelow = Infinity;
    let lowestLowPoint = Infinity;
    let lowestHighPoint = Infinity;
    let bestMove = null;

    // Try different rotations
    for (let rotation = 0; rotation < 4; rotation++) {
      // Extract rotated tetromino sprite
      const bogusSprite = currentTetromino.Sprites[rotation].Data;

      // Try different positions, start at -2 to ensure that tetrominoes beginning with empty columns can be placed
      for (let x = -2; x < grid.width; x++) {
        // Drop tetromino
        let y = currentPosition.Y;
        let bogusY = y + 1;
        while (this.validMove(grid, bogusSprite, { X: x, Y: bogusY })) {
          y = bogusY;
          bogusY += 1;
        }

        // Check for least space below
        if (this.validMove(grid, bogusSprite, { X: x, Y: y })) {
          const lowPoint = y + Math.max(...bogusSprite.map((v: Vector) => v.Y)); // Higher is better
          const highPoint = y +
            Math.min(...bogusSprite.map((v: Vector) => v.Y)); // Higher is better
          const spaceBelow = this.countEmptySpaces(grid, bogusSprite, {
            X: x,
            Y: y,
          });
          if (
            (
              spaceBelow < leastSpaceBelow ||
              (spaceBelow - 1 < leastSpaceBelow &&
                lowPoint > lowestLowPoint + 2) || // Allow placing a tetromino with 1 empty slot below, if this will make it place 2 rows lower in the grid
              (spaceBelow - 2 < leastSpaceBelow &&
                lowPoint > lowestLowPoint + 4) // Allow placing a tetromino with 2 empty slots below, if this will make it place 4 rows lower in the grid
            ) ||
            (spaceBelow === leastSpaceBelow && (lowPoint > lowestLowPoint) ||
              (spaceBelow === leastSpaceBelow &&
                (lowPoint === lowestLowPoint) && highPoint > lowestHighPoint))
          ) {
            leastSpaceBelow = spaceBelow;
            lowestLowPoint = lowPoint;
            lowestHighPoint = highPoint;
            bestMove = { x, rotation };
          }
        }
      }
    }

    if (bestMove) {
      // Try to get to the best move
      controls.rotCW = bestMove.rotation > currentRotation;
      controls.rotCCW = bestMove.rotation < currentRotation;
      controls.left = bestMove.x < currentPosition.X;
      controls.right = bestMove.x > currentPosition.X;

      // Already there?
      controls.drop = bestMove.x === currentPosition.X &&
        bestMove.rotation === currentRotation;
    }

    return controls;
  }

  validMove(grid: GameGrid, s: Vector[], p: Vector): boolean {
    for (const v of s) {
      // Check that there is space below
      const targetX = v.X + p.X;
      const targetY = v.Y + p.Y; // Increment Y position by 1
      const outOfRange = targetX < 0 ||
        targetX > grid.width - 1 ||
        targetY < 0 ||
        targetY > grid.height - 1 ||
        (grid.Data[targetX + targetY * grid.width] !==
          undefined);
      if (outOfRange) { // Check for undefined instead of null
        return false;
      }
    }
    return true;
  }

  private countEmptySpaces(grid: GameGrid, s: Vector[], p: Vector): number {
    let emptySpaces = 0;

    for (const spriteVector of s) {
      // First, check that the sprite itself does not cover the vector below
      const vectorBelow = { X: spriteVector.X, Y: spriteVector.Y + 1 };
      if (!s.some((v) => v.X === vectorBelow.X && v.Y === vectorBelow.Y)) {
        // The sprite doesn't cover the vector below, now check the grid

        // Then check that the grid doesnt cover the vector below
        const targetX = spriteVector.X + p.X;
        const targetY = spriteVector.Y + p.Y + 1;
        const targetArrayIndex = grid.width * targetY + targetX;
        if (targetArrayIndex < grid.Data.length) {
          if (grid.Data[targetArrayIndex] === undefined) {
            // There is empty space below!
            emptySpaces++;
          }
        }
      }
    }

    return emptySpaces;
  }

  public disconnect() {
    if (this.aiInterval) {
      clearInterval(this.aiInterval);
      this.aiInterval = undefined;
    }
    this.g?.removePlayer(this);
    this.setGame(null);
  }
}

export { AIPlayer };
