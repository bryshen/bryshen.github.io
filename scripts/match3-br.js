// The main mechanics of the game
// Use events to update HTML elements
import { getDefaultWeapon, getRandomWeapon, getWeaponList, Weapon } from './weapons.js';

var globalDamageMultiplier = 0.5;


// class MatchGroup {
// 	constructor() {
// 	  this.tiles = [];
// 	  this.hMatches = 0;
// 	  this.vMatches = 0;
// 	  this.tiles = 0;
// 	}
//   }
  

export class GameEvent {
	constructor() {
		this.subscribers = [];
	}

	subscribe(callback) {
		this.subscribers.push(callback);
	}

	triggerEvent(...args) {
		this.subscribers.forEach(subscriber => subscriber(...args));
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
		this.localPlayer = new Player('You');
		this.players = [this.localPlayer]; // TODO: Fill this with generated players and local player
		this.storm = new Storm(this);
		this.timer.onTick.subscribe(this.checkStormDamage.bind(this));
	}
	start() {
		this.timer.start();
		// console.log('Timer: ' + this.storm.stormCountdown);
		// this.timer.onTick.subscribe(function(){this.storm.tick();});
	}
	checkStormDamage(){
		this.players.forEach(player => {
			if (player.travelled < this.storm.totalProgress)
				player.drain(this.storm.damage());
		});
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
		this.travelled = 0;
		this.encounter = null;
		this.eliminations = 0;
		this.inventory = [null, null, null];

		// Events
		this.onHurt = new GameEvent(); // function(damage) {};
		this.onDeath = new GameEvent();
		this.onWeaponChange = new GameEvent();
		this.onEnemeyEliminated = new GameEvent();
		this.onTravelled  = new GameEvent();
		this.onInventoryUpdate = new GameEvent();
	}
	travel(amount){
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
	drain(damage){
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
	constructor(session) {
		this.totalProgress = 0;
		this.targetProgress = 0;
		this.stage = 0;
		this.isMoving = false;
		this.stormCountdown = 30;
		this.session = session;
		this.onProgressChange = new GameEvent();
		this.onStormMovementChanged = new GameEvent();
		this.onCountdownTick = new GameEvent();
		this.session.timer.onTick.subscribe(this.tick.bind(this));
	};
	damage() {
		const d = [1, 1, 2, 5, 8, 10, 10, 10, 10, 10, 10, 10];
		return d[this.stage];
	};
	advanceStorm() {

	};
	tick(total) {
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
	};
}

export class TileType {
	constructor(name, emoji, src) {
	  this.name = name;
	  this.emoji = emoji;
	  this.src = src;
	}
  }
  
export class Tile {
	constructor(element, type, x, y) {
	  this.x = x;
	  this.y = y;
	  this.type = type;
	  this.element = element;
	  var img = document.createElement('img');
	  img.src = type.src;
	  img.style.height = '100%';
	  img.style.width = '100%';
	  //img.style.opacity = '0.5';
	  element.appendChild(img);
	  //element.innerHTML = type.emoji;
	  this.element.tile = this;
	}
  }