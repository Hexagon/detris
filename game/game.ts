// game/game.ts

import type { Player } from "../server/player.ts";

export type GameStatus = "created" | "playing" | "gameover" | "abandoned";

/**
 * Represents a generic game that can handle different game modes and manage multiple players.
 *
 * Use this to extend a game mode class in /mode/. Do NOT use this class directly, except as a type.
 *
 * @typeparam TMode The type of game mode.
 */
export class Game {
  private mode: string;
  private code?: string;
  private status: GameStatus;
  private gameId = crypto.randomUUID();
  private initializationTime: number;
  private cleanupTimer?: number;

  private players: Player[] = [];

  /**
   * Creates a new Game instance.
   * @param mode Current game mode
   */
  constructor(
    mode: string,
    code?: string,
  ) {
    this.mode = mode;
    this.code = code;
    this.status = "created";
    this.initializationTime = Date.now();
  }

  over(): void {
    this.status = "gameover";
    this.broadcast({ gameOver: true });
  }

  broadcast(_m: unknown) {
    throw new Error("Broadcast not implemented");
  }

  abandon(): void {
    this.status = "abandoned";
  }

  start(): void {
    this.status = "playing";
  }

  scoreChanged(_playerIndex?: number): boolean {
    throw new Error("scoreChanged not implemented");
  }

  getData(playerIndex?: number): unknown {
    throw new Error("getData not implemented");
  }

  getStatus(): GameStatus {
    return this.status;
  }

  getMode(): string {
    return this.mode;
  }

  getCode(): string | undefined {
    return this.code;
  }

  setCleanupTimer(): void {
    if (!this.cleanupTimer) this.cleanupTimer = Date.now();
  }

  getCleanupTimer(): number | undefined {
    return this.cleanupTimer;
  }

  getCreateTime(): number {
    return this.initializationTime;
  }

  /**
   * Adds a player to the game.
   * @param player The player to add.
   */
  addPlayer(player: Player): void {
    this.players.push(player);
    player.setGame(this);
  }

  /**
   * Removes a player from the game.
   * @param player The player to remove.
   */
  removePlayer(player: Player): void {
    const index = this.players.indexOf(player);
    if (index !== -1) {
      this.players.splice(index, 1);
      player.setGame(null);
    }
  }

  /** Get gameId */
  getId(): string {
    return this.gameId;
  }

  /**
   * Lists players in a game.
   * @resturns Array of players
   */
  listPlayers(): Player[] {
    return this.players;
  }

  /**
   * Get player index
   * @resturns Player index
   */
  getPlayerIndex(player: Player): number {
    return this.players.indexOf(player);
  }

  /**
   * Act when player control changes
   */
  act(_player: Player, _key: string, _value: boolean): void {
    throw new Error("act() not implemented in game mode");
  }

  /**
   * Checks the requirements of the game. returns true or throws
   */
  checkRequirements(): boolean {
    throw new Error("checkRequirements not implemented");
  }

  /** Receive controller update from player */
  playerControl(_p: Player, _key: string, _state: boolean) {
    throw new Error("playerControl not implemented");
  }

  /** Receive controller update from player */
  iterate(): boolean {
    throw new Error("iterate not implemented");
  }
}
