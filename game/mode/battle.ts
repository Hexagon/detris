// game/mode/battle.ts

import { Game } from "../game.ts";
import { Tetromino, TetrominoFactory, Vector } from "../tetromino.ts";
import { GameGrid } from "../grid.ts";
import { Player } from "../../server/player.ts";

/**
 * Represents a PvP battle game with two players.
 */
export class BattleGame extends Game {
  // The 10x22 grid of history, the first two lines should be hidden in visualization
  grid: GameGrid[];

  // Five position array per player of tetrominoes, where first index is playerIndex, and second index is upcoming tetromino index

  Tetrominoes: Tetromino[][];
  factory: TetrominoFactory;

  // Base offset of dropping tetromino for player 1
  // Can be outside of grid if current tetromino sprite has blank rows/columns
  Position: Vector[];
  GhostPosition: Vector[];
  Rotation: number[];

  // Internal stuff below
  Score: number[];
  Level: number[];
  Lines: number[];

  timerModified: Date[];
  lastScore: number[];

  winnerIndex = -1;

  /**
   * Creates a new BattleGame instance.
   */
  constructor(code?: string) {
    super("battle", code);

    this.grid = [];

    this.factory = new TetrominoFactory();

    this.Score = [];
    this.Level = [];
    this.Lines = [];

    this.lastScore = [];

    this.Tetrominoes = [];
    this.Position = [];
    this.GhostPosition = [];
    this.Rotation = [];

    this.timerModified = [];

    for (let i = 0; i < 2; i++) {
      const newGrid = new GameGrid(10, 22);
      newGrid.Clear();

      this.grid.push(newGrid);

      this.Score.push(0);
      this.Level.push(0);
      this.Lines.push(0);

      // Keep track if score has changed since last call to scoreChanged()
      this.lastScore.push(0);

      this.Tetrominoes.push([]);
      this.Position.push({ X: 0, Y: 0 });
      this.GhostPosition.push({ X: 0, Y: 0 });
      this.Rotation.push(0);

      this.timerModified[i] = new Date();

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

  sendData() {
    for (const player of this.listPlayers()) {
      player.sendMessage(
        JSON.stringify(this.getData(this.getPlayerIndex(player))),
      );
    }
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

    while (this.validMove(currentSprite, bogusPosition, playerIndex)) {
      this.GhostPosition[playerIndex] = structuredClone(bogusPosition);
      bogusPosition.Y += 1;
    }

    this.sendData();
  }

  getData(playerIndex?: number): unknown {
    return {
      Position: this.Position,
      Level: this.Level,
      Lines: this.Lines,
      Score: this.Score,
      GhostPosition: this.GhostPosition,
      Rotation: this.Rotation,
      Tetrominoes: this.Tetrominoes,
      Grid: this.grid,
      Winner: this.winnerIndex,
      PlayerIndex: playerIndex,
    };
  }

  getDataNew(playerIndex?: number | undefined): unknown {
    return this.getData(playerIndex);
  }

  moveX(d: number, playerIndex: number): boolean {
    this.resetTimerIfLanded(playerIndex); // Assuming resetTimerIfLanded() method is implemented in Game class

    const currentSprite =
      this.Tetrominoes[playerIndex][0].Sprites[this.Rotation[playerIndex]].Data;

    const bogusPosition: Vector = { ...this.Position[playerIndex] };
    bogusPosition.X += d;

    if (this.validMove(currentSprite, bogusPosition, playerIndex)) {
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

  iterateDelayMs(playerIndex: number): number {
    // Reduce 25 ms for each level, bottom out on 110ms
    return Math.max(500 - 25 * this.Level[playerIndex], 100);
  }

  iterate(): boolean {
    const currentTime = new Date().getTime();
    for (
      let playerIndex = 0;
      playerIndex < this.listPlayers().length;
      playerIndex++
    ) {
      const iterateDelay = this.iterateDelayMs(playerIndex);
      const timeDifference = currentTime -
        this.timerModified[playerIndex].getTime();
      if (timeDifference > iterateDelay) {
        this.timerModified[playerIndex] = new Date();
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

    if (this.validMove(currentSprite, bogusPosition, playerIndex)) {
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

    if (this.validMove(currentSprite, bogusPosition, playerIndex)) {
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

    while (this.validMove(currentSprite, bogusPosition, playerIndex)) {
      this.Position[playerIndex] = structuredClone(bogusPosition);
      dropOffset += 1;
      bogusPosition.Y += 1;
    }

    this.addScore(dropOffset * 2, true, playerIndex);

    this.lockdown(playerIndex);
  }

  scoreChanged(): boolean {
    let changed = false;
    for (let i = 0; i < this.listPlayers().length; i++) {
      const newScore = this.Score[i] !== this.lastScore[i];
      this.lastScore[i] = this.Score[i];
      if (newScore) changed = true;
    }
    return changed;
  }

  addRowsToPlayer(rows: number, playerIndex: number) {
    // Available colors for the blocks
    const tetrominoColors = ["O", "I", "T", "S", "Z", "J", "L"];

    // Add the rows to the bottom of the player's grid and remove the same number of rows from the top
    for (let i = 0; i < rows; i++) {
      // Generate a new row with random blocks for each iteration
      const newRow = Array(this.grid[playerIndex].width).fill(undefined);
      let blocksCount = 0; // Count of blocks in a row

      for (let j = 0; j < newRow.length; j++) {
        if (Math.random() < 0.5) {
          newRow[j] =
            tetrominoColors[Math.floor(Math.random() * tetrominoColors.length)];
          blocksCount++;
        }
      }

      // Ensure at least 1 and at most (width - 1) blocks are in the row
      if (blocksCount === 0) {
        newRow[Math.floor(Math.random() * newRow.length)] =
          tetrominoColors[Math.floor(Math.random() * tetrominoColors.length)];
      } else if (blocksCount === newRow.length) {
        newRow[Math.floor(Math.random() * newRow.length)] = undefined;
      }

      this.grid[playerIndex].Data = [
        ...this.grid[playerIndex].Data.slice(
          this.grid[playerIndex].width,
          this.grid[playerIndex].Data.length,
        ),
        ...newRow,
      ];
    }
  }

  lockdown(playerIndex: number): boolean {
    // Double check validity, mostly for multiplayer games where blocks can be "inserted" during the drop delay
    while (
      !this.validMove(
        this.Tetrominoes[playerIndex][0].Sprites[this.Rotation[playerIndex]]
          .Data,
        this.Position[playerIndex],
        playerIndex,
      )
    ) {
      // Kick up
      this.Position[playerIndex].Y -= 1;
      // Not possible?
      if (this.Position[playerIndex].Y < 0) {
        return false;
      }
    }

    const clearedRows = this.grid[playerIndex].ApplySprite(
      this.Tetrominoes[playerIndex][0].Sprites[this.Rotation[playerIndex]].Data,
      this.Position[playerIndex],
      this.Tetrominoes[playerIndex][0].Type,
    );

    const opponentIndex = (playerIndex + 1) % 2; // Get the other player's index

    // End condition ?
    if (clearedRows == -1) {
      this.winnerIndex = opponentIndex;
      // Send an extra update
      this.sendData();
      return false;
    }

    // Count cleared lines
    this.Lines[playerIndex] += clearedRows;

    // Add score for cleared rows and add rows to opponent
    if (clearedRows == 1) {
      this.addScore(40, true, playerIndex);
    } else if (clearedRows == 2) {
      this.addScore(40 * 2 * 2, true, playerIndex); // x2
    } else if (clearedRows == 3) {
      this.addScore(40 * 3 * 4, true, playerIndex); // x4
      this.addRowsToPlayer(1, opponentIndex); // Add 1 row to opponent
    } else if (clearedRows == 4) {
      this.addScore(40 * 4 * 8, true, playerIndex); // x8
      this.addRowsToPlayer(2, opponentIndex); // Add 2 rows to opponent
    }

    // Time to level up?
    if (this.Lines[playerIndex] > (this.Level[playerIndex] + 1) * 5) {
      this.Level[playerIndex] += 1;
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
    this.Position[playerIndex] = { X: 3, Y: 0 };
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

    if (
      this.validMove(currentSprite, this.Position[playerIndex], playerIndex)
    ) {
      this.Rotation[playerIndex] = bogusRotation;
      this.changed(playerIndex);
      return;
    }

    for (const kick of [-1, 1, -2, 2]) {
      const bogusPosition: Vector = { ...this.Position[playerIndex] };
      bogusPosition.X += kick;
      if (this.validMove(currentSprite, bogusPosition, playerIndex)) {
        this.Rotation[playerIndex] = structuredClone(bogusRotation);
        this.Position[playerIndex] = structuredClone(bogusPosition);
        this.changed(playerIndex);
        return;
      }
    }
  }

  validMove(s: Vector[], p: Vector, playerIndex: number): boolean {
    for (const v of s) {
      // Check that there is space below
      const targetX = v.X + p.X;
      const targetY = v.Y + p.Y; // Increment Y position by 1
      const outOfRange = targetX < 0 ||
        targetX > this.grid[playerIndex].width - 1 ||
        targetY < 0 ||
        targetY > this.grid[playerIndex].height - 1 ||
        (this.grid[playerIndex]
          .Data[targetX + targetY * this.grid[playerIndex].width] !==
          undefined);
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
      this.timerModified[playerIndex] = new Date();
    }
  }

  addScore(baseScore: number, levelBoost: boolean, playerIndex: number) {
    let newScore = 0;
    if (levelBoost) {
      newScore += baseScore * (this.Level[playerIndex] + 1);
    } else {
      newScore += baseScore;
    }
    this.Score[playerIndex] += newScore;
  }
}
