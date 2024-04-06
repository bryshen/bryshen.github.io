// TODO: Dismantle this whole file
import { getDefaultWeapon } from "./weapons.js";
let globalDamageMultiplier = 0.5;
export class GameEvent {
    subscribers = [];
    subscribe(callback) {
        this.subscribers.push(callback);
    }
    triggerEvent(args) {
        this.subscribers.forEach(subscriber => subscriber(args));
    }
    unsubscribe(callback) {
        this.subscribers = this.subscribers.filter(subscriber => subscriber !== callback);
    }
}
export class Timer {
    deltaTime = 1000;
    interval = null;
    value = 0;
    onTick = new GameEvent();
    start() {
        this.interval = setInterval(() => {
            this.timerTick();
        }, this.deltaTime);
    }
    pause() {
        if (this.interval)
            clearInterval(this.interval);
    }
    stop() {
        if (this.interval)
            clearInterval(this.interval);
        this.value = 0;
    }
    timerTick() {
        this.value++;
        this.onTick.triggerEvent(this.value);
    }
}
export class GameSession {
    timer = new Timer();
    localPlayer = new Player('You');
    players = [this.localPlayer];
    storm = new Storm(this);
    constructor() {
        this.timer.onTick.subscribe(this.checkStormDamage.bind(this));
    }
    start() {
        this.timer.start();
    }
    checkStormDamage() {
        this.players.forEach(player => {
            if (player.travelled < this.storm.totalProgress)
                player.drain(this.storm.damage());
        });
    }
}
export class Resource {
    name;
    maxValue;
    currentValue;
    onValueChange = new GameEvent();
    constructor(name, maxValue, currentValue) {
        this.name = name;
        this.maxValue = maxValue;
        this.currentValue = currentValue;
    }
    changeValue(amount) {
        if (this.currentValue + amount > this.maxValue) {
            this.currentValue = this.maxValue;
        }
        else if (this.currentValue + amount < 0) {
            this.currentValue = 0;
        }
        else {
            this.currentValue += amount;
        }
        this.onValueChange.triggerEvent(this.currentValue);
    }
    setValue(amount) {
        this.changeValue(amount - this.currentValue);
        this.onValueChange.triggerEvent(this.currentValue);
    }
}
export class Player {
    name;
    health = new Resource('health', 100, 100);
    shield = new Resource('shield', 100, 100);
    ammo = new Resource('ammo', 100, 100);
    weapon = getDefaultWeapon();
    travelled = 0;
    encounter = null;
    eliminations = 0;
    inventory = [null, null, null];
    onHurt = new GameEvent();
    onDeath = new GameEvent();
    onWeaponChange = new GameEvent();
    onEnemeyEliminated = new GameEvent();
    onTravelled = new GameEvent();
    onInventoryUpdate = new GameEvent();
    constructor(name) {
        this.name = name;
    }
    travel(amount) {
        this.travelled += amount;
        this.onTravelled.triggerEvent(this.travelled);
    }
    changeWeapon(weapon) {
        if (this.weapon === weapon)
            return;
        this.weapon = weapon;
        this.onWeaponChange.triggerEvent();
    }
    hurt(damage) {
        if (damage <= 0)
            return;
        if (this.shield.currentValue > 0) {
            this.shield.changeValue(-damage);
        }
        else {
            this.health.changeValue(-damage);
        }
        this.onHurt.triggerEvent(damage);
        if (!this.isAlive())
            this.onDeath.triggerEvent();
    }
    drain(damage) {
        this.health.changeValue(-damage);
        this.onHurt.triggerEvent(damage);
        if (!this.isAlive())
            this.onDeath.triggerEvent();
    }
    shoot(e) {
        if (this.ammo.currentValue <= 0) {
            return false;
        }
        this.ammo.changeValue(-1);
        e.hurt(Math.floor(this.weapon.damage * globalDamageMultiplier));
        if (e.isAlive())
            this.onEnemeyEliminated.triggerEvent(e);
        return true;
    }
    isAlive() {
        return this.health.currentValue > 0;
    }
}
class Storm {
    totalProgress = 0;
    targetProgress = 0;
    stage = 0;
    isMoving = false;
    stormCountdown = 30;
    session;
    onProgressChange = new GameEvent();
    onStormMovementChanged = new GameEvent();
    onCountdownTick = new GameEvent();
    constructor(session) {
        this.session = session;
        // Timer for storm
        //this.session.timer.onTick.subscribe(this.tick.bind(this));
    }
    damage() {
        const d = [1, 1, 2, 5, 8, 10, 10, 10, 10, 10, 10, 10];
        return d[this.stage];
    }
    advanceStorm() { }
    tick(total) {
        this.stormCountdown--;
        if (this.stormCountdown < 0) {
            this.isMoving = !this.isMoving;
            this.onStormMovementChanged.triggerEvent(this.isMoving);
            if (this.isMoving)
                this.stage++;
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
    name;
    emoji;
    src;
    constructor(name, emoji, src) {
        this.name = name;
        this.emoji = emoji;
        this.src = src;
    }
}
export class Tile {
    x;
    y;
    type;
    element; // Use the custom interface here
    constructor(element, type, x, y) {
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
