import { GameEvent } from "./GameEvent.js";
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
