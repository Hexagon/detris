import type { Player } from "../server/player.ts";

/**
 * Represents a generic game that can handle different game modes and manage multiple players.
 *
 * Use this to extend a game mode class in /mode/. Do NOT use this class directly, except as a type.
 *
 * @typeparam TMode The type of game mode.
 */
export class Game {
  private players: Player[] = [];
  private gameId = crypto.randomUUID();
  private changeId = 0;

  /**
   * Creates a new Game instance.
   * @param gameId The ID of the game.
   */
  constructor(
    private mode: string,
  ) {
    // Initialize the game instance
  }

  /**
   * Adds a player to the game.
   * @param player The player to add.
   */
  incrementChange(): void {
    this.changeId += 1;
  }

  /**
   * Adds a player to the game.
   * @param player The player to add.
   */
  getChangeId(): number {
    return this.changeId;
  }

  /**
   * Adds a player to the game.
   * @param player The player to add.
   */
  getData(): unknown {
    throw new Error("getData not implemented");
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

  /**
   * Starts the game.
   */
  start(): void {
    throw new Error("start not implemented");
  }
}
