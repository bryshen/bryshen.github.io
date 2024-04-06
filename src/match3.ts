// TODO: Dismantle this whole file

import { Weapon, getDefaultWeapon } from "./weapons.js";

let globalDamageMultiplier: number = 0.5;

export class GameEvent<T> {
    private subscribers: ((args: T) => void)[] = [];

    subscribe(callback: (args: T) => void): void {
        this.subscribers.push(callback);
    }

    triggerEvent(args: T): void {
        this.subscribers.forEach(subscriber => subscriber(args));
    }

    unsubscribe(callback: (args: T) => void): void {
        this.subscribers = this.subscribers.filter(subscriber => subscriber !== callback);
    }
}
 
export class Timer {
    private deltaTime: number = 1000;
    private interval: any | null = null;
    private value: number = 0;
    onTick: GameEvent<number> = new GameEvent<number>();

    start(): void {
        this.interval = setInterval(() => {
            this.timerTick();
        }, this.deltaTime);
    }

    pause(): void {
        if (this.interval) clearInterval(this.interval);
    }

    stop(): void {
        if (this.interval) clearInterval(this.interval);
        this.value = 0;
    }

    private timerTick(): void {
        this.value++;
        this.onTick.triggerEvent(this.value);
    }
}

export class GameSession {
    timer: Timer = new Timer();
    localPlayer: Player = new Player('You');
    players: Player[] = [this.localPlayer];
    storm: Storm = new Storm(this);
    
    constructor() {
        this.timer.onTick.subscribe(this.checkStormDamage.bind(this));
    }

    start(): void {
        this.timer.start();
    }

    private checkStormDamage(): void {
        this.players.forEach(player => {
            if (player.travelled < this.storm.totalProgress)
                player.drain(this.storm.damage());
        });
    }
}

export class Resource {
    name: string;
    maxValue: number;
    currentValue: number;
    onValueChange: GameEvent<number> = new GameEvent<number>();

    constructor(name: string, maxValue: number, currentValue: number) {
        this.name = name;
        this.maxValue = maxValue;
        this.currentValue = currentValue;
    }

    changeValue(amount: number): void {
        if (this.currentValue + amount > this.maxValue) {
            this.currentValue = this.maxValue;
        } else if (this.currentValue + amount < 0) {
            this.currentValue = 0;
        } else {
            this.currentValue += amount;
        }
        this.onValueChange.triggerEvent(this.currentValue);
    }

    setValue(amount: number): void {
        this.changeValue(amount - this.currentValue);
        this.onValueChange.triggerEvent(this.currentValue);
    }
}

export class Player {
    name: string;
    health: Resource = new Resource('health', 100, 100);
    shield: Resource = new Resource('shield', 100, 100);
    ammo: Resource = new Resource('ammo', 100, 100);
    weapon: Weapon = getDefaultWeapon();
    travelled: number = 0;
    encounter: any = null;
    eliminations: number = 0;
    inventory: (Weapon | null)[] = [null, null, null];

    onHurt: GameEvent<number> = new GameEvent<number>();
    onDeath: GameEvent<void> = new GameEvent<void>();
    onWeaponChange: GameEvent<void> = new GameEvent<void>();
    onEnemeyEliminated: GameEvent<Player> = new GameEvent<Player>();
    onTravelled: GameEvent<number> = new GameEvent<number>();
    onInventoryUpdate: GameEvent<void> = new GameEvent<void>();

    constructor(name: string) {
        this.name = name;
    }

    travel(amount: number): void {
        this.travelled += amount;
        this.onTravelled.triggerEvent(this.travelled);
    }

    changeWeapon(weapon: Weapon): void {
        if (this.weapon === weapon)
            return;
        this.weapon = weapon;
        this.onWeaponChange.triggerEvent();
    }

    hurt(damage: number): void {
        if (damage <= 0)
            return;
        if (this.shield.currentValue > 0) {
            this.shield.changeValue(-damage);
        } else {
            this.health.changeValue(-damage);
        }
        this.onHurt.triggerEvent(damage);
        if (!this.isAlive())
            this.onDeath.triggerEvent();
    }

    drain(damage: number): void {
        this.health.changeValue(-damage);
        this.onHurt.triggerEvent(damage);
        if (!this.isAlive())
            this.onDeath.triggerEvent();
    }

    shoot(e: Player): boolean {
        if (this.ammo.currentValue <= 0) {
            return false;
        }
        this.ammo.changeValue(-1);
        e.hurt(Math.floor(this.weapon.damage * globalDamageMultiplier));
        if (e.isAlive())
            this.onEnemeyEliminated.triggerEvent(e);
        return true;
    }

    isAlive(): boolean {
        return this.health.currentValue > 0;
    }
}

class Storm {
    totalProgress: number = 0;
    targetProgress: number = 0;
    stage: number = 0;
    isMoving: boolean = false;
    stormCountdown: number = 30;
    session: GameSession;
    onProgressChange: GameEvent<number> = new GameEvent<number>();
    onStormMovementChanged: GameEvent<boolean> = new GameEvent<boolean>();
    onCountdownTick: GameEvent<number> = new GameEvent<number>();

    constructor(session: GameSession) {
        this.session = session;
        // Timer for storm
        //this.session.timer.onTick.subscribe(this.tick.bind(this));
    }

    damage(): number {
        const d: number[] = [1, 1, 2, 5, 8, 10, 10, 10, 10, 10, 10, 10];
        return d[this.stage];
    }

    advanceStorm(): void {}

    tick(total: number): void {
        this.stormCountdown--;
        if (this.stormCountdown < 0) {
            this.isMoving = !this.isMoving;
            this.onStormMovementChanged.triggerEvent(this.isMoving);
            if (this.isMoving) this.stage++;
            this.stormCountdown = this.isMoving ? 10 : 30;
        }
        if (this.isMoving) {
            this.totalProgress += 1;
            this.onProgressChange.triggerEvent(this.totalProgress);
        }
        this.onCountdownTick.triggerEvent(this.stormCountdown);
    }
}

export class TileType {
    name: string;
    emoji: string;
    src: string;

    constructor(name: string, emoji: string, src: string) {
        this.name = name;
        this.emoji = emoji;
        this.src = src;
    }
}

// Define a custom interface extending HTMLElement
export interface TileHTMLElement extends HTMLElement {
    tile: Tile;
}

export class Tile {
    x: number;
    y: number;
    type: TileType;
    element: TileHTMLElement; // Use the custom interface here

    constructor(element: TileHTMLElement, type: TileType, x: number, y: number) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.element = element;
        var img = document.createElement('img');
        img.src = type.src;
        img.style.height = '100%';
        img.style.width = '100%';
        element.appendChild(img);
        this.element.tile = this; // No error now
    }
}
