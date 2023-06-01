// server/player.ts

import { Game } from "../game/game.ts";

import { SinglePlayerGame } from "../game/mode/singleplayer.ts";
import { CoopGame } from "../game/mode/coop.ts";
import { BattleGame } from "../game/mode/battle.ts";
import { AIPlayer } from "./aiplayer.ts";
import { BasePlayer } from "./baseplayer.ts";

const FindGame = async (
  games: Game[],
  gameType: string,
  maxPlayers: number,
  code?: string,
  firstCheck?: number,
): Promise<Game | undefined> => {
  console.log("Looking for game");

  // Look for a suitable game
  for (const g of games) {
    if (
      g.getStatus() == "created" && g.listPlayers().length <= maxPlayers &&
      g.getMode() == gameType
    ) {
      // Check code
      // Undefined == Public in both store and input parameter
      if (g.getCode() === code) {
        console.log("Game found");
        return g;
      }
    }
  }

  // Bail out after 5 seconds
  if (firstCheck && (Date.now() - firstCheck) > 5_000) {
    console.log("Game not found after 5 seconds, bailing out");
    return undefined;
  }

  // Wait 2 seconds
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Not first check anymore
  if (!firstCheck) firstCheck = Date.now();

  // Recurse
  return await FindGame(games, gameType, maxPlayers, code, firstCheck);
};

class Player extends BasePlayer {
  private socket: WebSocket | null;
  public controls: { [key: string]: boolean } = {};

  constructor(socket: WebSocket | null, games: Game[]) {
    super(socket, games);

    this.socket = socket;

    // Handle incoming messages
    this.socket?.addEventListener("message", async (event) => {
      let data = null;

      try {
        data = JSON.parse(event.data);
      } catch (_e) {
        /* ignore */
      }

      // Server connected
      if (data?.packet === "ready" && data?.mode) {
        const nickname = data.nickname;
        const validationError = this.validateNickname(nickname);
        if (validationError) {
          this.socket?.send(
            JSON.stringify({ ready: false, error: validationError }),
          );
        } else {
          console.log(nickname, " is ready to play");

          // Set nickname
          this.setNickname(nickname);

          // Create new singleplayer game
          if (data.mode === "singleplayer") {
            this.g = new SinglePlayerGame(data.code);
            games.push(this.g);

            // Join Co-Op game
          } else if (data.mode === "coop") {
            // Find game
            if (!data.ai) {
              const foundGame = await FindGame(games, "coop", 1, data.code);
              if (foundGame) {
                this.g = foundGame;
              } else {
                // Create game
                this.g = new CoopGame(data.code);
                games.push(this.g);
              }
            } else {
              // Create game
              this.g = new CoopGame("ai-game");
              games.push(this.g);
            }
            // Join Battle game
          } else if (data.mode === "battle") {
            // Find game
            if (!data.ai) {
              const foundGame = await FindGame(games, "battle", 1, data.code);
              if (foundGame) {
                this.g = foundGame;
              } else {
                // Create game
                this.g = new BattleGame(data.code);
                games.push(this.g);
              }
            } else {
              // Create game
              this.g = new BattleGame("ai-game");
              games.push(this.g);
            }
          } else {
            throw new Error("Invalid game mode requested: " + data.mode);
          }

          if (!this.g) {
            throw new Error("Unknown error: Game not found or created");
          }

          // Attach player to game
          this.g.addPlayer(this);

          if (data.ai) {
            // Attach ai player
            const ai = new AIPlayer(games, data.ai);
            ai.connect(this.g);
          }

          // Notify server that everything is ready
          this.socket?.send(JSON.stringify({ ready: true }));
        }

        // React to key presses
      } else if (data?.packet === "key") {
        this.setKeyState(data.data.key, data.data.state);
      }
    });
  }

  public sendMessage(stringifiedMessage: string) {
    try {
      this.socket?.send(stringifiedMessage);
    } catch (_e) {
      /* Ignore */
    }
  }
}

export { Player };
