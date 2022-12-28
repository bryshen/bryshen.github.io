// The main mechanics of the game
// Use events to update HTML elements
import { getDefaultWeapon, getRandomWeapon, getWeaponList, Weapon } from './weapons.js';

var globalDamageMultiplier = 0.5;

export class GameEvent {
    constructor() {
        this.subscribers = [];
    }

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
    constructor() {
        this.deltaTime = 1000;
        this.interval = null;
        this.value = 0;
        this.onTick = new GameEvent();
    }
    start() {
        this.interval = setInterval(() => {
            this.timerTick();
        }, this.deltaTime);
    }
    pause() {
        clearInterval(this.interval);
    }
    stop() {
        clearInterval(this.interval);
        this.value = 0;
    }
    timerTick() {
        this.value++;
        this.onTick.triggerEvent(this.value);
    }
}

export class GameSession {
    constructor() {
        this.timer = new Timer();
        this.players = []; // TODO: Fill this with generated players and local player
        this.localPlayer = new Player('You');
        this.storm = new Storm(this);
    }
    start() {
        this.timer.start();
        console.log('Timer: ' + this.storm.stormCountdown);
        // this.timer.onTick.subscribe(function(){this.storm.tick();});
    }
}

export class Resource {
    constructor(name, maxValue, currentValue) {
      this.name = name;
      this.maxValue = maxValue;
      this.currentValue = currentValue;

      this.onValueChange = new GameEvent();
    }
  
    changeValue(amount) {
      if (this.currentValue + amount > this.maxValue) {
        this.currentValue = this.maxValue;
      } else if (this.currentValue + amount < 0) {
        this.currentValue = 0;
      } else {
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
    constructor(name) {
      this.name = name;
      this.health = new Resource('health', 100, 100);
      this.shield = new Resource('shield', 100, 100);
      this.ammo = new Resource('ammo', 100, 100);
      this.weapon = getDefaultWeapon();
    
      this.encounter = null;
      this.eliminations = 0;

      // Events
      this.onHurt = new GameEvent(); // function(damage) {};
      this.onDeath = new GameEvent();
      this.onWeaponChange = new GameEvent();
      this.onEnemeyEliminated = new GameEvent();
    }
    changeWeapon(weapon){
      if (this.weapon === weapon)
        return;
      this.weapon = weapon;
      this.onWeaponChange.triggerEvent();
    }
    hurt(damage) {
      if (damage <= 0)
        return false;
      if (this.shield.currentValue > 0) {
        this.shield.changeValue(-damage);
      } else {
        this.health.changeValue(-damage);
      }
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

class Storm{
    constructor(session){
        this.totalProgress = 0;
        this.targetProgress = 0;
        this.stage = 0;
        this.isMoving = false;
        this.stormCountdown = 30;
        this.session = session;
        this.onProgressChange = new GameEvent();
        this.onCountdownTick = new GameEvent();
        this.session.timer.onTick.subscribe(this.tick.bind(this));
    };
    damage(){
      const d = [1, 1, 2, 5, 8, 10, 10, 10, 10, 10, 10, 10];
      return d[this.stage];
    };
    advanceStorm(){
      
    };
    tick(total){
        this.stormCountdown--;
        if (this.stormCountdown < 0){
            this.isMoving = !this.isMoving;
            this.stormCountdown = this.isMoving ? 10 : 30;
        }
        if (this.isMoving){
            this.totalProgress += 1;
            this.onProgressChange.triggerEvent(this.totalProgress);
        }
        this.onCountdownTick.triggerEvent(this.stormCountdown);
    };
}