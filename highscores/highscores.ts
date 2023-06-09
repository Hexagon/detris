// highscores/highscores.ts

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

interface HighscoreMessageToday {
  today: Highscore[];
  now: number;
}

const kv = await Deno.openKv(Deno.env.get("DETRIS_PERSIST_PATH"));

export async function write(mode: string, h: Highscore): Promise<boolean> {
  try {
    const key = ["highscores", mode, h.tsInit];
    await kv.set(key, h);
    return true;
  } catch (error) {
    console.error("Error writing highscores", error);
    return false;
  }
}

export async function read(mode: string): Promise<HighscoreMessage | null> {
  let ath: Highscore[] = [];
  let week: Highscore[] = [];

  // 1 week before now
  const weekBefore = new Date();
  weekBefore.setDate(weekBefore.getDate() - 7);

  for await (const entry of kv.list({ prefix: ["highscores", mode] })) {
    const hs: Highscore = entry.value as Highscore;
    if (hs.ts >= weekBefore) {
      week.push(hs);
    }
    ath.push(hs);
  }
  ath = ath.filter((b) => b.score > 0);
  week = ath.filter((b) => b.score > 0);
  ath.sort((a, b) => b.score - a.score);
  week.sort((a, b) => b.score - a.score);

  return { ath: ath.slice(0, 9), week: week.slice(0, 9), now: Date.now() };
}

export async function readPlaying(
  mode: string,
): Promise<HighscoreMessageNow | null> {
  let playing: Highscore[] = [];

  // 1 week before now
  const oneDayBefore = Date.now() - 24 * 60 * 60 * 1_000,
    tenSecondsBefore = new Date(Date.now() - 10_000);

  for await (
    const entry of kv.list({
      start: ["highscores", mode, oneDayBefore],
      end: ["highscores", mode, Date.now() + 1],
    })
  ) {
    const hs: Highscore = entry.value as Highscore;
    if (hs.ts >= tenSecondsBefore) {
      playing.push(hs);
    }
  }
  playing = playing.filter((b) => b.score > 0);
  playing.sort((a, b) => b.score - a.score);

  return { playing: playing.slice(0, 9), now: Date.now() };
}

export async function readToday(
  mode: string,
): Promise<HighscoreMessageToday | null> {
  let today: Highscore[] = [];

  // 1 week before now
  const oneDayBefore = Date.now() - 24 * 60 * 60 * 1_000;

  for await (
    const entry of kv.list({
      start: ["highscores", mode, oneDayBefore],
      end: ["highscores", mode, Date.now() + 24 * 60 * 60 * 1_000],
    })
  ) {
    const hs: Highscore = entry.value as Highscore;
    today.push(hs);
  }

  today = today.filter((b) => b.score > 0);
  today.sort((a, b) => b.score - a.score);

  return { today: today.slice(0, 9), now: Date.now() };
}
