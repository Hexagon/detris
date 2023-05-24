interface Highscore {
  nickname: string;
  score: number;
  level: number;
  lines: number;
  ts: Date;
  tsInit: number;
}

interface HighscoreMessage {
  ath: Highscore[];
  week: Highscore[];
  now: number;
}

interface HighscoreMessageNow {
  playing: Highscore[];
  now: number;
}


const kv = await Deno.openKv(Deno.env.get("DETRIS_PERSIST_PATH"));

export async function write(h: Highscore): Promise<boolean> {
  try {
    const key = ["highscores", h.tsInit];
    await kv.set(key, h);
    return true;
  } catch (error) {
    console.error("Error writing highscores", error);
    return false;
  }
}

export async function read(): Promise<HighscoreMessage | null> {
  const ath: Highscore[] = [];
  const week: Highscore[] = [];

  // 1 week before now
  const weekBefore = new Date();
  weekBefore.setDate(weekBefore.getDate() - 7);

  for await (const entry of kv.list({ prefix: ["highscores"] })) {
    const hs: Highscore = entry.value as Highscore;
    if (hs.ts >= weekBefore) {
      week.push(hs);
    }
    ath.push(hs);
  }

  ath.sort((a, b) => b.score - a.score);
  week.sort((a, b) => b.score - a.score);

  return { ath: ath.slice(0, 9), week: week.slice(0, 9), now: Date.now() };
}

export async function readPlaying(): Promise<HighscoreMessageNow | null> {
  const playing: Highscore[] = [];

  // 1 week before now
  const oneDayBefore = Date.now()-24*60*60*1_000,
    tenSecondsBefore = new Date(Date.now() - 10_000);

  for await (const entry of kv.list({ start: ["highscores", oneDayBefore], end: ["highscores", Date.now()+1] })) {
    const hs: Highscore = entry.value as Highscore;
    if (hs.ts >= tenSecondsBefore) {
      playing.push(hs);
    }
  }

  playing.sort((a, b) => b.score - a.score);

  return { playing: playing.slice(0, 9), now: Date.now() };
}