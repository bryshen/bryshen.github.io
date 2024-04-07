import { Player } from "./entity.js";
export class GameSession {
    localPlayer = new Player('You');
    players = [this.localPlayer];
}
