import { GameEvent } from "./GameEvent.js";
import { getDefaultWeapon } from "./weapons.js";
class IDamageable {
    value;
    max;
    constructor(max, value) {
        this.max = max;
        this.value = value == undefined ? max : value;
    }
    onHealed = new GameEvent();
    get OnHeal() { return this.onHealed.expose(); }
    heal = (amount) => {
    };
    hurt = (amount, attacker) => {
    };
}
export class Entity {
    name;
    health;
    shield = new IDamageable(999, 0);
    constructor(name, health) {
        this.name = name;
        this.health = new IDamageable(health);
    }
    onDeath = new GameEvent();
    get OnDeath() { return this.onDeath.expose(); }
    hurt(damage) {
        if (damage <= 0)
            return;
        if (this.shield.value > 0) {
            this.shield.hurt(damage);
        }
        else {
            this.health.hurt(damage);
        }
        //this.onHurt.triggerEvent(damage);
        if (!this.isAlive())
            this.onDeath.trigger();
    }
    isAlive() {
        return this.health.value > 0;
    }
}
export class PlayerEntity extends Entity {
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
        this.onValueChange.trigger(this.currentValue);
    }
    setValue(amount) {
        this.changeValue(amount - this.currentValue);
        this.onValueChange.trigger(this.currentValue);
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
        this.onTravelled.trigger(this.travelled);
    }
    changeWeapon(weapon) {
        if (this.weapon === weapon)
            return;
        this.weapon = weapon;
        this.onWeaponChange.trigger();
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
        this.onHurt.trigger(damage);
        if (!this.isAlive())
            this.onDeath.trigger();
    }
    drain(damage) {
        this.health.changeValue(-damage);
        this.onHurt.trigger(damage);
        if (!this.isAlive())
            this.onDeath.trigger();
    }
    shoot(e) {
        if (this.ammo.currentValue <= 0) {
            return false;
        }
        this.ammo.changeValue(-1);
        e.hurt(Math.floor(this.weapon.damage * 1));
        if (e.isAlive())
            this.onEnemeyEliminated.trigger(e);
        return true;
    }
    isAlive() {
        return this.health.currentValue > 0;
    }
}
