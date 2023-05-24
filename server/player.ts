import { Game } from "../game/game.ts";
import * as highscores from "../highscores/highscores.ts";

// player.ts
function validateNickname(n: string): string | undefined {
  if (typeof n !== "string") {
    return "Nickname is of invalid type";
  }
  if (n.length < 2) {
    return "Nickname too short, need to be at least 2 characters";
  } else if (n.length > 15) {
    return "Nickname too long, need to be at most 15 characters";
  }
}

export async function Player(
  socket: WebSocket,
  kv: Deno.Kv,
) {
  let g: Game;

  // Player is not ready yet!
  let ready = false;

  const loop = () => {
    if (ready && !g.iterate()) {
      // End condition
      try {
        socket.send('{ "gameOver": true }');
      } catch (e) {
        console.error("Lost connection to client ...")
      }

      // Write highscore
      try {
        highscores.write({
          nickname: g.Nickname,
          score: g.Score,
          level: g.Level,
          lines: g.Lines,
          ts: new Date(),
        });
      } catch (e) {
        console.error("Could not write highscores ...")
      }

      // End game
      ready = false;

      return;
    }

    // Recurse!
    if (ready) {
      setTimeout(() => loop(), 1500);
    }
  };

  socket.addEventListener("open", async () => {
    // Register player
    console.log("A client connected!");

    // Give the user an unique id
    const uuid = crypto.randomUUID();

    // Store user in kv
    await kv.set(["status", uuid], { status: "connected", ts: new Date() });
  });

  // Handle incoming messages
  socket.addEventListener("message", (event) => {
    let data = null;
    try {
      data = JSON.parse(event.data);
    } catch (_e) {
      /* ignore */
    }
    //try {
    if (data?.packet === "ready") {
      const nickname = data.nickname;
      const validationError = validateNickname(nickname);
      if (validationError) {
        socket.send(JSON.stringify(
          { ready: false, error: validationError },
        ));
      } else {
        console.log(nickname, " is ready to play");
        g = new Game(nickname, socket);
        ready = true;
        loop();
        socket.send(JSON.stringify(
          { ready: true },
        ));
      }
    } else if (data?.packet === "key") {
      if (ready) {
        g.setKey(data?.data.key, data?.data.state);
      }
    }
    /*} catch (e) {
      console.error(`Error handling incoming websocket packet: ${e.message}`)
    }*/
  });
}
