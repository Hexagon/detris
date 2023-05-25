import { Game } from "../game.ts";
import { Tetromino, TetrominoFactory, Vector } from "../tetromino.ts";
import { GameGrid } from "../grid.ts";
import type { Player } from "../../server/player.ts";

/**
 * Represents a single-player game.
 */
export class SinglePlayerGame extends Game {
  // The 10x22 grid of history, the first two lines should be hidden in visualization
  grid: GameGrid;

  // Five position array of tetrominoes, where index
  //  0: Current dropping tetromino
  //  1: Coming up 1
  //  2: Coming up 2
  //  3: Coming up 3
  //  -- 4: On hold (TODO)
  Tetrominoes: Tetromino[];
  factory: TetrominoFactory;

  // Base offset of dropping tetromino
  // Can be outside of grid if current tetromino sprite has blank rows/columns
  Position: Vector;
  GhostPosition: Vector;

  // Rotation of dropping tetromino
  // Should be >0 and <4
  Rotation: number;

  // Internal stuff below
  Score: number;
  Level: number;
  Lines: number;
  keyStates: Map<string, boolean>;

  timerReal: Date;
  timerModified: Date;
  initializationTime: number;

  /**
   * Creates a new SinglePlayerGame instance.
   */
  constructor() {
    super("singleplayer");

    this.grid = new GameGrid();
    this.factory = new TetrominoFactory();
    this.Tetrominoes = [];

    this.Position = { X: 0, Y: 0 };
    this.GhostPosition = { X: 0, Y: 0 };

    this.Rotation = 0;
    this.Score = 0;
    this.Level = 0;
    this.Lines = 0;
    this.keyStates = new Map<string, boolean>();

    this.timerReal = new Date();
    this.timerModified = new Date();

    this.grid.Clear();
    this.Tetrominoes[1] = this.factory.Next();
    this.Tetrominoes[2] = this.factory.Next();
    this.Tetrominoes[3] = this.factory.Next();

    this.nextTetromino();

    // Used as the highscore key
    this.initializationTime = Date.now();

    // Initial game update
    this.changed();
  }

  checkRequirements(): boolean {
    // Check player count
    if (this.listPlayers().length !== 1) {
      throw new Error("Wrong number of players for a single player game");
    }

    return true;
  }

  start(): void {
  }

  playerControl(_player: Player, key: string, state: boolean) {
    // This is a single player game, just act
    this.setKey(key, state);
  }

  broadcast(m: unknown) {
    // This is a single player game, just broadcast
    for (const player of this.listPlayers()) {
      player.sendMessage(JSON.stringify(m));
    }
  }

  changed(): void {
    this.incrementChange();

    const currentSprite = this.Tetrominoes[0].Sprites[this.Rotation].Data;

    const bogusPosition: Vector = { ...this.Position };
    bogusPosition.Y += 1;

    while (this.validMove(currentSprite, bogusPosition)) {
      this.GhostPosition = structuredClone(bogusPosition);
      bogusPosition.Y += 1;
    }

    this.broadcast(this.getData());
  }

  getData(): unknown {
    return {
      Position: this.Position,
      Level: this.Level,
      Lines: this.Lines,
      GhostPosition: this.GhostPosition,
      Rotation: this.Rotation,
      Tetrominoes: this.Tetrominoes,
      Grid: this.grid,
    };
  }

  moveX(d: number): boolean {
    this.resetTimerIfLanded(); // Assuming resetTimerIfLanded() method is implemented in Game class

    const currentSprite = this.Tetrominoes[0].Sprites[this.Rotation].Data;

    const bogusPosition: Vector = { ...this.Position };
    bogusPosition.X += d;

    if (this.validMove(currentSprite, bogusPosition)) {
      this.Position = structuredClone(bogusPosition);
      this.changed();
      return true;
    }

    return false;
  }

  setKeyStates(kss: Map<string, boolean>): void {
    this.keyStates = kss;
  }

  private setKey(key: string, state: boolean): void {
    if (state) {
      switch (key) {
        case "right":
          this.moveX(1);
          break;

        case "left":
          this.moveX(-1);
          break;

        case "drop":
          this.drop();
          break;

        case "rotCW":
          this.rotate(1);
          break;

        case "rotCCW":
          this.rotate(-1);
          break;

        case "down":
          this.moveDown();
          break;
      }
    }
  }

  iterate(): boolean {
    const currentTime = new Date().getTime();
    const timeDifference = currentTime - this.timerModified.getTime();
    const iterateDelay = this.iterateDelayMs();
    if (timeDifference > iterateDelay) {
      // Reset timer
      this.timerReal = new Date();
      this.timerModified = new Date();

      if (!this.moveDown()) {
        return this.lockdown();
      }
    }

    return true;
  }

  iterateDelayMs(): number {
    // Reduce 25 ms for each level, bottom out on 110ms
    return Math.min(500 - 25 * this.Level, 100);
  }

  moveDown(): boolean {
    const currentSprite = this.Tetrominoes[0].Sprites[this.Rotation].Data;

    const bogusPosition: Vector = { ...this.Position };
    bogusPosition.Y += 1;

    this.resetTimerIfLanded();

    if (this.validMove(currentSprite, bogusPosition)) {
      this.Position = structuredClone(bogusPosition);
      this.changed();
      return true;
    } else {
      return false;
    }
  }

  hasLanded(): boolean {
    const currentSprite = this.Tetrominoes[0].Sprites[this.Rotation].Data;

    const bogusPosition: Vector = { ...this.Position };
    bogusPosition.Y += 1;

    if (this.validMove(currentSprite, bogusPosition)) {
      return false;
    } else {
      return true;
    }
  }

  drop(): void {
    const currentSprite = this.Tetrominoes[0].Sprites[this.Rotation].Data;

    const bogusPosition: Vector = { ...this.Position };
    bogusPosition.Y += 1;

    let dropOffset = 0;

    while (this.validMove(currentSprite, bogusPosition)) {
      this.Position = structuredClone(bogusPosition);
      dropOffset += 1;
      bogusPosition.Y += 1;
    }

    this.addScore(dropOffset * 2, true);

    this.lockdown();
  }

  lockdown(): boolean {
    const clearedRows = this.grid.ApplySprite(
      this.Tetrominoes[0].Sprites[this.Rotation].Data,
      this.Position,
      this.Tetrominoes[0].Type,
    );

    // End condition ?
    if (clearedRows == -1) {
      return false;
    }

    // Count cleared lines
    this.Lines += clearedRows;

    // Add score for cleared rows
    if (clearedRows == 1) {
      this.addScore(40, true);
    } else if (clearedRows == 2) {
      this.addScore(40 * 2 * 2, true); // x2
    } else if (clearedRows == 3) {
      this.addScore(40 * 3 * 4, true); // x4
    } else if (clearedRows == 4) {
      this.addScore(40 * 4 * 8, true); // x8
    }

    // Time to level up?
    if (this.Lines > (this.Level + 1) * 5) {
      this.Level += 1;
    }

    // Spawn new tetromino!
    this.nextTetromino();

    // Reset drop button
    if (this.keyStates.get("down")) {
      this.keyStates.set("down", false);
    }

    // Notify that stuf has changed
    this.changed();

    return true;
  }

  addScore(baseScore: number, levelBoost: boolean) {
    let newScore = 0;
    if (levelBoost) {
      newScore += baseScore * (this.Level + 1);
    } else {
      newScore += baseScore;
    }
    // Assign the score to all connected players
    for (const player of this.listPlayers()) {
      player.addScore(newScore);
    }
  }

  resetTimerIfLanded(): void {
    if (this.hasLanded()) {
      if (Date.now() - this.timerReal.getTime() < 2000) {
        this.timerModified = new Date();
      }
    }
  }

  nextTetromino(): void {
    this.Position = { X: 3, Y: 0 };
    this.Rotation = 0;
    this.Tetrominoes[0] = this.Tetrominoes[1];
    this.Tetrominoes[1] = this.Tetrominoes[2];
    this.Tetrominoes[2] = this.Tetrominoes[3];
    this.Tetrominoes[3] = this.factory.Next();
  }

  rotate(d: number): void {
    this.resetTimerIfLanded();

    let bogusRotation = this.Rotation + d;

    if (bogusRotation < 0) {
      bogusRotation = 4 - 1;
    } else if (bogusRotation > 4 - 1) {
      bogusRotation = 0;
    }

    const currentSprite = this.Tetrominoes[0].Sprites[bogusRotation].Data;

    if (this.validMove(currentSprite, this.Position)) {
      this.Rotation = bogusRotation;
      this.changed();
      return;
    }

    for (const kick of [-1, 1, -2, 2]) {
      const bogusPosition: Vector = { ...this.Position };
      bogusPosition.X += kick;
      if (this.validMove(currentSprite, bogusPosition)) {
        this.Rotation = structuredClone(bogusRotation);
        this.Position = structuredClone(bogusPosition);
        this.changed();
        return;
      }
    }
  }

  validMove(s: Vector[], p: Vector): boolean {
    for (const v of s) {
      // Check that there is space below
      const targetX = v.X + p.X;
      const targetY = v.Y + p.Y; // Increment Y position by 1
      const outOfRange = targetX < 0 || targetX > 10 - 1 || targetY < 0 ||
        targetY > 22 - 1 ||
        (this.grid.Data[targetX + targetY * 10] !== undefined);
      if (outOfRange) { // Check for undefined instead of null
        return false;
      }
    }

    return true;
  }
}
