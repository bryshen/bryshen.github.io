import { Player } from "./entity.js";


export class GameSession {
    localPlayer: Player = new Player('You');
    players: Player[] = [this.localPlayer];

}