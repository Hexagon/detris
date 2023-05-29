import { Game } from "../game.ts";
import { Tetromino, TetrominoFactory, Vector } from "../tetromino.ts";
import { GameGrid } from "../grid.ts";
import type { Player } from "../../server/player.ts";

/**
 * Represents a co-op game with two players.
 */
export class CoopGame extends Game {
  // The 20x22 grid of history, the first two lines should be hidden in visualization
  grid: GameGrid;

  // Five position array per player of tetrominoes, where first index is playerIndex, and second index is upcoming tetromino index

  Tetrominoes: Tetromino[][];
  factory: TetrominoFactory;

  // Base offset of dropping tetromino for player 1
  // Can be outside of grid if current tetromino sprite has blank rows/columns
  Position1: Vector;
  GhostPosition1: Vector;
  Rotation1: number;

  // Base offset of dropping tetromino for player 2
  // Can be outside of grid if current tetromino sprite has blank rows/columns
  Position2: Vector;
  GhostPosition2: Vector;
  Rotation2: number;

  // Internal stuff below
  Score: number;
  Level: number;
  Lines: number;
  keyStates1: Map<string, boolean>;
  keyStates2: Map<string, boolean>;

  timerReal: Date;
  timerModified: Date;

  /**
   * Creates a new CoOpGame instance.
   */
  constructor(code?: string) {
    super("coop", code);

    this.grid = new GameGrid(20, 22);
    this.factory = new TetrominoFactory();

    this.Tetrominoes = [];
    this.Tetrominoes[0] = [];
    this.Tetrominoes[1] = [];

    this.Position1 = { X: 0, Y: 0 };
    this.GhostPosition1 = { X: 0, Y: 0 };
    this.Rotation1 = 0;

    this.Position2 = { X: 0, Y: 0 };
    this.GhostPosition2 = { X: 0, Y: 0 };
    this.Rotation2 = 0;

    this.Score = 0;
    this.Level = 0;
    this.Lines = 0;
    this.keyStates1 = new Map<string, boolean>();
    this.keyStates2 = new Map<string, boolean>();

    this.timerReal = new Date();
    this.timerModified = new Date();

    this.grid.Clear();

    this.Tetrominoes[0][1] = this.factory.Next();
    this.Tetrominoes[0][2] = this.factory.Next();
    this.Tetrominoes[0][3] = this.factory.Next();
    this.nextTetromino(0);

    this.Tetrominoes[1][1] = this.factory.Next();
    this.Tetrominoes[1][2] = this.factory.Next();
    this.Tetrominoes[1][3] = this.factory.Next();
    this.nextTetromino(1);

    // Initial game update
    this.changed();
  }

  checkRequirements(): boolean {
    return (this.listPlayers().length === 2);
  }

  playerControl(player: Player, key: string, state: boolean) {
    const playerIndex = this.listPlayers().indexOf(player);
    if (playerIndex === 0) {
      this.setKey(this.keyStates1, key, state, playerIndex);
    } else if (playerIndex === 1) {
      this.setKey(this.keyStates2, key, state, playerIndex);
    }
  }

  broadcast(m: unknown) {
    for (const player of this.listPlayers()) {
      player.sendMessage(JSON.stringify(m));
    }
  }

  changed(): void {

    const currentSprite1 = this.Tetrominoes[0][0].Sprites[this.Rotation1].Data;
    const currentSprite2 = this.Tetrominoes[1][0].Sprites[this.Rotation2].Data;

    const bogusPosition1: Vector = { ...this.Position1 };
    const bogusPosition2: Vector = { ...this.Position2 };

    bogusPosition1.Y += 1;
    while (this.validMove(currentSprite1, bogusPosition1)) {
      this.GhostPosition1 = structuredClone(bogusPosition1);
      bogusPosition1.Y += 1;
    }

    bogusPosition2.Y += 1;
    while (this.validMove(currentSprite2, bogusPosition2)) {
      this.GhostPosition2 = structuredClone(bogusPosition2);
      bogusPosition2.Y += 1;
    }

    this.broadcast(this.getData());
  }

  getData(): unknown {
    return {
      Position1: this.Position1,
      Position2: this.Position2,
      Level: this.Level,
      Lines: this.Lines,
      GhostPosition1: this.GhostPosition1,
      GhostPosition2: this.GhostPosition2,
      Rotation1: this.Rotation1,
      Rotation2: this.Rotation2,
      Tetrominoes: this.Tetrominoes,
      Grid: this.grid,
    };
  }

  moveX(d: number, playerIndex: number): boolean {
    this.resetTimerIfLanded(playerIndex);

    const currentSprite = this.Tetrominoes[playerIndex][0].Sprites[
      playerIndex === 0 ? this.Rotation1 : this.Rotation2
    ].Data;

    const bogusPosition: Vector = playerIndex === 0
      ? { ...this.Position1 }
      : { ...this.Position2 };
    bogusPosition.X += d;

    if (this.validMove(currentSprite, bogusPosition)) {
      if (playerIndex === 0) {
        this.Position1 = structuredClone(bogusPosition);
      } else {
        this.Position2 = structuredClone(bogusPosition);
      }
      this.changed();
      return true;
    }

    return false;
  }

  private setKey(
    keyStates: Map<string, boolean>,
    key: string,
    state: boolean,
    playerIndex: number
  ): void {
    if (state) {
      switch (key) {
        case "right":
          this.moveX(1, playerIndex);
          break;

        case "left":
          this.moveX(-1, playerIndex);
          break;

        case "drop":
          this.drop(playerIndex);
          break;

        case "rotCW":
          this.rotate(1, playerIndex);
          break;

        case "rotCCW":
          this.rotate(-1, playerIndex);
          break;

        case "down":
          this.moveDown(playerIndex);
          break;
      }
    }

    keyStates.set(key, state);
  }

  iterateDelayMs(): number {
    // Reduce 25 ms for each level, bottom out on 110ms
    return Math.max(500 - 25 * this.Level, 100);
  }

  iterate(): boolean {
    const currentTime = new Date().getTime();
    const timeDifference = currentTime - this.timerModified.getTime();
    const iterateDelay = this.iterateDelayMs();
    if (timeDifference > iterateDelay) {
      this.timerReal = new Date();
      this.timerModified = new Date();

      if (!this.moveDown(0)) {
        return this.lockdown(0);
      }

      if (!this.moveDown(1)) {
        return this.lockdown(1);
      }
    }

    return true;
  }

  moveDown(playerIndex: number): boolean {
    const currentSprite = this.Tetrominoes[playerIndex][0].Sprites[
      playerIndex === 0 ? this.Rotation1 : this.Rotation2
    ].Data;

    const bogusPosition: Vector = playerIndex === 0
      ? { ...this.Position1 }
      : { ...this.Position2 };
    bogusPosition.Y += 1;

    this.resetTimerIfLanded(playerIndex);

    if (this.validMove(currentSprite, bogusPosition)) {
      if (playerIndex === 0) {
        this.Position1 = structuredClone(bogusPosition);
      } else {
        this.Position2 = structuredClone(bogusPosition);
      }
      this.changed();
      return true;
    } else {
      return false;
    }
  }

  hasLanded(playerIndex: number): boolean {
    const currentSprite = this.Tetrominoes[playerIndex][0].Sprites[
      playerIndex === 0 ? this.Rotation1 : this.Rotation2
    ].Data;

    const bogusPosition: Vector = playerIndex === 0
      ? { ...this.Position1 }
      : { ...this.Position2 };
    bogusPosition.Y += 1;

    if (this.validMove(currentSprite, bogusPosition)) {
      return false;
    } else {
      return true;
    }
  }

  drop(playerIndex: number): void {
    const currentSprite = this.Tetrominoes[playerIndex][0].Sprites[
      playerIndex === 0 ? this.Rotation1 : this.Rotation2
    ].Data;

    const bogusPosition: Vector = playerIndex === 0
      ? { ...this.Position1 }
      : { ...this.Position2 };
    bogusPosition.Y += 1;

    let dropOffset = 0;

    while (this.validMove(currentSprite, bogusPosition)) {
      if (playerIndex === 0) {
        this.Position1 = structuredClone(bogusPosition);
      } else {
        this.Position2 = structuredClone(bogusPosition);
      }
      dropOffset += 1;
      bogusPosition.Y += 1;
    }

    this.addScore(dropOffset * 2, true);

    this.lockdown(playerIndex);
  }

  lockdown(playerIndex: number): boolean {
    const rotation = playerIndex == 0 ? this.Rotation1 : this.Rotation2;
    const position = playerIndex == 0 ? this.Position1 : this.Position2;

    const clearedRows = this.grid.ApplySprite(
      this.Tetrominoes[playerIndex][0].Sprites[rotation].Data,
      position,
      this.Tetrominoes[playerIndex][0].Type,
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
    this.nextTetromino(playerIndex);

    // Reset drop button
    const ks = playerIndex == 0 ? this.keyStates1 : this.keyStates2;

    if (ks.get("down")) {
      ks.set("down", false);
    }

    // Notify that stuf has changed
    this.changed();

    return true;
  }

  nextTetromino(playerIndex: number): void {
    if (playerIndex === 0) {
      this.Position1 = { X: 3, Y: 0 };
      this.Rotation1 = 0;
      this.Tetrominoes[0][0] = this.Tetrominoes[0][1];
      this.Tetrominoes[0][1] = this.Tetrominoes[0][2];
      this.Tetrominoes[0][2] = this.Tetrominoes[0][3];
      this.Tetrominoes[0][3] = this.factory.Next();
    } else if (playerIndex === 1) {
      this.Position2 = { X: 13, Y: 0 };
      this.Rotation2 = 0;
      this.Tetrominoes[1][0] = this.Tetrominoes[1][1];
      this.Tetrominoes[1][1] = this.Tetrominoes[1][2];
      this.Tetrominoes[1][2] = this.Tetrominoes[1][3];
      this.Tetrominoes[1][3] = this.factory.Next();
    }
  }

  rotate(d: number, playerIndex: number): void {
    this.resetTimerIfLanded(playerIndex);

    const rotation = playerIndex === 0 ? this.Rotation1 : this.Rotation2;

    const currentSprite =
      this.Tetrominoes[playerIndex][0].Sprites[rotation].Data;

    let bogusRotation = playerIndex === 0 ? this.Rotation1 : this.Rotation2;
    bogusRotation += d;
    if (bogusRotation < 0) {
      bogusRotation = this.Tetrominoes[playerIndex][0].Sprites.length - 1;
    } else if (
      bogusRotation >= this.Tetrominoes[playerIndex][0].Sprites.length
    ) {
      bogusRotation = 0;
    }

    const bogusPosition: Vector = playerIndex === 0
      ? { ...this.Position1 }
      : { ...this.Position2 };

    if (this.validMove(currentSprite, bogusPosition)) {
      if (playerIndex === 0) {
        this.Rotation1 = bogusRotation;
      } else {
        this.Rotation2 = bogusRotation;
      }
      this.changed();
    }
  }

  validMove(s: Vector[], p: Vector): boolean {
    for (const v of s) {
      // Check that there is space below
      const targetX = v.X + p.X;
      const targetY = v.Y + p.Y; // Increment Y position by 1
      const outOfRange = targetX < 0 || targetX > this.grid.width - 1 ||
        targetY < 0 ||
        targetY > this.grid.height - 1 ||
        (this.grid.Data[targetX + targetY * this.grid.width] !== undefined);
      if (outOfRange) { // Check for undefined instead of null
        return false;
      }
    }

    return true;
  }

  rotateSprite(sprite: boolean[][], rotation: number): boolean[][] {
    let rotatedSprite = sprite;
    for (let i = 0; i < rotation; i++) {
      rotatedSprite = this.rotateClockwise(rotatedSprite);
    }
    return rotatedSprite;
  }

  rotateClockwise(sprite: boolean[][]): boolean[][] {
    const rows = sprite.length;
    const cols = sprite[0].length;
    const rotated: boolean[][] = [];

    for (let y = 0; y < cols; y++) {
      const row: boolean[] = [];
      for (let x = rows - 1; x >= 0; x--) {
        row.push(sprite[x][y]);
      }
      rotated.push(row);
    }

    return rotated;
  }

  resetTimerIfLanded(playerIndex: number): void {
    if (this.hasLanded(playerIndex)) {
      this.timerModified = new Date();
    }
  }

  addScore(points: number, multiplayer: boolean): void {
    let scoreMultiplier = 1;

    if (multiplayer) {
      scoreMultiplier = 2;
    }

    this.Score += points * scoreMultiplier;
  }
}
