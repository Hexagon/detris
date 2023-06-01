// game/mode/coop.ts

import { Game } from "../game.ts";
import { Tetromino, TetrominoFactory, Vector } from "../tetromino.ts";
import { GameGrid } from "../grid.ts";
import { Player } from "../../server/player.ts";

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
  Position: Vector[];
  GhostPosition: Vector[];
  Rotation: number[];

  // Internal stuff below
  Score: number;
  Level: number;
  Lines: number;

  timerModified: Date[];
  timerResets: number[];

  lastScore: number;

  /**
   * Creates a new CoOpGame instance.
   */
  constructor(code?: string) {
    super("coop", code);

    this.grid = new GameGrid(20, 22);
    this.factory = new TetrominoFactory();

    this.Tetrominoes = [];
    this.Position = [];
    this.GhostPosition = [];
    this.Rotation = [];

    this.Score = 0;
    this.Level = 0;
    this.Lines = 0;

    // Keep track if score has changed since last call to scoreChanged()
    this.lastScore = -1;

    this.timerModified = [];
    this.timerResets = [];

    this.grid.Clear();

    for (let i = 0; i < 2; i++) {
      this.Tetrominoes.push([]);
      this.Position.push({ X: 0, Y: 0 });
      this.GhostPosition.push({ X: 0, Y: 0 });
      this.Rotation.push(0);

      this.timerModified[i] = new Date();
      this.timerResets[i] = 0;

      this.Tetrominoes[i][1] = this.factory.Next();
      this.Tetrominoes[i][2] = this.factory.Next();
      this.Tetrominoes[i][3] = this.factory.Next();

      this.nextTetromino(i);

      // Initial game update
      this.changed(i);
    }
  }

  checkRequirements(): boolean {
    return (this.listPlayers().length === 2);
  }

  broadcast(m: unknown) {
    for (const player of this.listPlayers()) {
      player.sendMessage(JSON.stringify(m));
    }
  }

  changed(playerIndex: number): void {
    const currentSprite =
      this.Tetrominoes[playerIndex][0].Sprites[this.Rotation[playerIndex]].Data;

    const bogusPosition: Vector = { ...this.Position[playerIndex] };
    bogusPosition.Y += 1;

    while (this.validMove(currentSprite, bogusPosition)) {
      this.GhostPosition[playerIndex] = structuredClone(bogusPosition);
      bogusPosition.Y += 1;
    }

    this.broadcast(this.getData());
  }

  getData(): unknown {
    return {
      Position1: this.Position[0],
      Position2: this.Position[1],
      Level: this.Level,
      Lines: this.Lines,
      Score: this.Score,
      GhostPosition1: this.GhostPosition[0],
      GhostPosition2: this.GhostPosition[1],
      Rotation1: this.Rotation[0],
      Rotation2: this.Rotation[1],
      Tetrominoes: this.Tetrominoes,
      Grid: this.grid,
    };
  }

  getDataNew(): unknown {
    return {
      Position: this.Position,
      Level: this.Level,
      Lines: this.Lines,
      Score: this.Score,
      GhostPosition: this.GhostPosition,
      Rotation: this.Rotation,
      Tetrominoes: this.Tetrominoes,
      Grid: this.grid,
    };
  }

  moveX(d: number, playerIndex: number): boolean {
    this.resetTimerIfLanded(playerIndex); // Assuming resetTimerIfLanded() method is implemented in Game class

    const currentSprite =
      this.Tetrominoes[playerIndex][0].Sprites[this.Rotation[playerIndex]].Data;

    const bogusPosition: Vector = { ...this.Position[playerIndex] };
    bogusPosition.X += d;

    if (this.validMove(currentSprite, bogusPosition)) {
      this.Position[playerIndex] = structuredClone(bogusPosition);
      this.changed(playerIndex);
      return true;
    }

    return false;
  }

  public act(
    player: Player,
    key: string,
    state: boolean,
  ): void {
    const playerIndex = this.getPlayerIndex(player);
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
  }

  iterateDelayMs(): number {
    // Reduce 25 ms for each level, bottom out on 110ms
    return Math.max(500 - 25 * this.Level, 100);
  }

  iterate(): boolean {
    const currentTime = new Date().getTime();
    const iterateDelay = this.iterateDelayMs();
    for (
      let playerIndex = 0;
      playerIndex < this.listPlayers().length;
      playerIndex++
    ) {
      const timeDifference = currentTime -
        this.timerModified[playerIndex].getTime();
      if (timeDifference > iterateDelay) {
        this.timerModified[playerIndex] = new Date();
        this.timerResets[playerIndex] = 0;
        if (!this.moveDown(playerIndex)) {
          const lockDownResult = this.lockdown(playerIndex);
          if (!lockDownResult) return lockDownResult;
        }
      }
    }
    return true;
  }

  moveDown(playerIndex: number): boolean {
    const currentSprite =
      this.Tetrominoes[playerIndex][0].Sprites[this.Rotation[playerIndex]].Data;

    const bogusPosition: Vector = { ...this.Position[playerIndex] };
    bogusPosition.Y += 1;

    this.resetTimerIfLanded(playerIndex);

    if (this.validMove(currentSprite, bogusPosition)) {
      this.Position[playerIndex] = structuredClone(bogusPosition);
      this.changed(playerIndex);
      return true;
    } else {
      return false;
    }
  }

  hasLanded(playerIndex: number): boolean {
    const currentSprite =
      this.Tetrominoes[playerIndex][0].Sprites[this.Rotation[playerIndex]].Data;

    const bogusPosition: Vector = { ...this.Position[playerIndex] };
    bogusPosition.Y += 1;

    if (this.validMove(currentSprite, bogusPosition)) {
      return false;
    } else {
      return true;
    }
  }

  drop(playerIndex: number): void {
    const currentSprite =
      this.Tetrominoes[playerIndex][0].Sprites[this.Rotation[playerIndex]].Data;

    const bogusPosition: Vector = { ...this.Position[playerIndex] };
    bogusPosition.Y += 1;

    let dropOffset = 0;

    while (this.validMove(currentSprite, bogusPosition)) {
      this.Position[playerIndex] = structuredClone(bogusPosition);
      dropOffset += 1;
      bogusPosition.Y += 1;
    }

    this.addScore(dropOffset * 2, true);

    this.lockdown(playerIndex);
  }

  scoreChanged(): boolean {
    const newScore = this.Score !== this.lastScore;
    this.lastScore = this.Score;
    return newScore;
  }

  lockdown(playerIndex: number): boolean {
    // Double check validity, mostly for multiplayer games where blocks can be "inserted" during the drop delay
    while (
      !this.validMove(
        this.Tetrominoes[playerIndex][0].Sprites[this.Rotation[playerIndex]]
          .Data,
        this.Position[playerIndex],
      )
    ) {
      // Kick up
      this.Position[playerIndex].Y -= 1;
      // Not possible?
      if (this.Position[playerIndex].Y < 0) {
        return false;
      }
    }

    const clearedRows = this.grid.ApplySprite(
      this.Tetrominoes[playerIndex][0].Sprites[this.Rotation[playerIndex]].Data,
      this.Position[playerIndex],
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
    this.listPlayers()[playerIndex].setKeyState("down", false);

    // Notify that stuf has changed
    this.changed(playerIndex);

    return true;
  }

  nextTetromino(playerIndex: number): void {
    this.Position[playerIndex] = { X: playerIndex * 10 + 3, Y: 0 };
    this.Rotation[playerIndex] = 0;
    this.Tetrominoes[playerIndex][0] = this.Tetrominoes[playerIndex][1];
    this.Tetrominoes[playerIndex][1] = this.Tetrominoes[playerIndex][2];
    this.Tetrominoes[playerIndex][2] = this.Tetrominoes[playerIndex][3];
    this.Tetrominoes[playerIndex][3] = this.factory.Next();
  }

  rotate(d: number, playerIndex: number): void {
    this.resetTimerIfLanded(playerIndex);

    let bogusRotation = this.Rotation[playerIndex] + d;

    if (bogusRotation < 0) {
      bogusRotation = 4 - 1;
    } else if (bogusRotation > 4 - 1) {
      bogusRotation = 0;
    }

    const currentSprite =
      this.Tetrominoes[playerIndex][0].Sprites[bogusRotation].Data;

    if (this.validMove(currentSprite, this.Position[playerIndex])) {
      this.Rotation[playerIndex] = bogusRotation;
      this.changed(playerIndex);
      return;
    }

    for (const kick of [-1, 1, -2, 2]) {
      const bogusPosition: Vector = { ...this.Position[playerIndex] };
      bogusPosition.X += kick;
      if (this.validMove(currentSprite, bogusPosition)) {
        this.Rotation[playerIndex] = structuredClone(bogusRotation);
        this.Position[playerIndex] = structuredClone(bogusPosition);
        this.changed(playerIndex);
        return;
      }
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
      if (this.timerResets[playerIndex] < 15) {
        this.timerModified[playerIndex] = new Date();
      }
      this.timerResets[playerIndex]++;
    }
  }

  addScore(baseScore: number, levelBoost: boolean) {
    let newScore = 0;
    if (levelBoost) {
      newScore += baseScore * (this.Level + 1);
    } else {
      newScore += baseScore;
    }
    this.Score += newScore;
  }
}
