import { Game } from "../game/game.ts";

export class BasePlayer {
  public g: Game | null;
  private nickname = "Undef";
  public controls: { [key: string]: boolean } = {};

  constructor(_socket: WebSocket | null, _games: Game[]) {
    this.g = null;
  }

  public setNickname(nickname: string) {
    this.nickname = nickname;
  }

  public setGame(g: Game | null) {
    this.g = g;
  }

  public setKeyState(key: string, value: boolean) {
    this.controls[key] = value;
    if (this.g) this.g.act(this, key, value);
  }

  public validateNickname(n: string): string | undefined {
    if (typeof n !== "string") {
      return "Nickname is of invalid type";
    }
    if (n.length < 2) {
      return "Nickname too short, need to be at least 2 characters";
    } else if (n.length > 15) {
      return "Nickname too long, need to be at most 15 characters";
    }
  }

  public getNickname(): string {
    return this.nickname;
  }

  public sendMessage(_m: string): void {
  }

  getControls(): { [key: string]: boolean } {
    return this.controls;
  }
}
