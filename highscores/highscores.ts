interface Highscore {
  nickname: string;
  score: number;
  level: number;
  lines: number;
  ts: Date;
}

interface HighscoreMessage {
  ath: Highscore[];
  week: Highscore[];
}

const kv = await Deno.openKv();

export async function write(h: Highscore): Promise<boolean> {
  try {
    const key = ["highscores", h.nickname, new Date().getTime()];
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

  return { ath: ath.slice(0, 9), week: week.slice(0, 9) };
}
