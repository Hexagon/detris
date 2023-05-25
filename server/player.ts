// server/player.ts

import { Game } from "../game/game.ts";
import { SinglePlayerGame } from "../game/mode/singleplayer.ts";
import * as highscores from "../highscores/highscores.ts";

interface PlayerState {
  Score: number;
  Level: number;
  Lines: number;
  Winner: boolean | null;
  GameId: string | null;
  GameConnected: number | null;
  Updated: number | null;
}

class Player {
  private socket: WebSocket;
  private g: Game | null;
  private state: PlayerState;
  private nickname?: string;

  // Player is not ready yet!
  private ready = false;

  constructor(socket: WebSocket, kv: Deno.Kv) {
    this.g = null;
    this.state = this.constructState(null);

    this.socket = socket;

    const loop = () => {
      if (this.ready) {
        // Check for end condition
        if (this.g && !this.g.iterate()) {
          // End condition
          try {
            this.socket.send('{ "gameOver": true }');
          } catch (_e) {
            console.error("Lost connection to client ...");
          }

          // End game
          this.ready = false;

          return;
        }
      }

      // Recurse!
      if (this.ready) {
        setTimeout(() => loop(), 50);
      }
    };

    this.socket.addEventListener("open", async () => {
      // Register player
      console.log("A client connected!");

      // Give the user a unique id
      const uuid = crypto.randomUUID();

      // Store user in kv
      await kv.set(["status", uuid], { status: "connected", ts: new Date() });
    });

    // Handle incoming messages
    this.socket.addEventListener("message", (event) => {
      let data = null;
      try {
        data = JSON.parse(event.data);
      } catch (_e) {
        /* ignore */
      }
      if (data?.packet === "ready") {
        const nickname = data.nickname;
        const validationError = this.validateNickname(nickname);
        if (validationError) {
          this.socket.send(
            JSON.stringify({ ready: false, error: validationError }),
          );
        } else {
          console.log(nickname, " is ready to play");

          // Set nickname
          this.setNickname(nickname);

          // Create new singleplayer game
          this.g = new SinglePlayerGame();

          // Attach player to game
          this.g.addPlayer(this);

          // Mark player ready
          this.ready = true;

          // Start player loop
          loop();

          // Why?
          this.socket.send(JSON.stringify({ ready: true }));
        }
      } else if (data?.packet === "key") {
        if (this.ready && this.g) {
          this.g.playerControl(this, data?.data.key, data?.data.state);
        }
      }
    });
  }

  public sendMessage(stringifiedMessage: string) {
    // This is a single player game, just broadcast
    try {
      this.socket.send(stringifiedMessage);
    } catch (_e) {
      console.error("Tried to send to closed socket");
    }
  }

  public setNickname(nickname: string) {
    this.nickname = nickname;
  }
  private constructState(id: string | null) {
    return {
      Score: 0,
      Level: 0,
      Lines: 0,
      GameId: id,
      GameConnected: new Date().getTime(),
      Updated: new Date().getTime(),
      Winner: null,
    };
  }

  public setGame(g: Game | null) {
    if (g !== null) {
      this.state = this.constructState(g.getId());
    }
    this.g = g;
  }

  public addScore(newScore: number) {
    this.state.Score += newScore;
    this.writeHighscore();
    this.sendMessage(JSON.stringify(this.state));
  }
  public setLines(newLines: number) {
    this.state.Lines = newLines;
    this.writeHighscore();
    this.sendMessage(JSON.stringify(this.state));
  }
  public setLevel(newLevel: number) {
    this.state.Level = newLevel;
    this.writeHighscore();
    this.sendMessage(JSON.stringify(this.state));
  }

  private writeHighscore() {
    highscores.write({
      nickname: this.nickname || "undefined",
      score: this.state.Score,
      level: this.state.Level,
      lines: this.state.Lines,
      ts: new Date(this.state.Updated || Date.now()),
      tsInit: this.state.GameConnected || Date.now(),
    });
  }

  private validateNickname(n: string): string | undefined {
    if (typeof n !== "string") {
      return "Nickname is of invalid type";
    }
    if (n.length < 2) {
      return "Nickname too short, need to be at least 2 characters";
    } else if (n.length > 15) {
      return "Nickname too long, need to be at most 15 characters";
    }
  }
}

export { Player };
