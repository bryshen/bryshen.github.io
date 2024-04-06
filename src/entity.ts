import { GameEvent } from "./GameEvent.js";

class IDamageable{
    value : number;
    max : number;
    constructor(max : number, value ? : number){
        this.max = max;
        this.value = value == undefined ? max : value;
    }

    private readonly onHealed = new GameEvent<number>();
    public get OnHeal() { return this.onHealed.expose();}

    heal = (amount : number) => {

    }

    hurt = (amount : number, attacker ? : Entity) => {

    }
}

export class Entity{
    name : string;
    health : IDamageable;
    shield : IDamageable = new IDamageable(999, 0);

    constructor(name : string, health : number){
        this.name = name;
        this.health = new IDamageable(health);
    }

    private readonly onDeath = new GameEvent();
    public get OnDeath() { return this.onDeath.expose();}


    hurt(damage: number): void {
        if (damage <= 0)
            return;
        if (this.shield.value > 0) {
            this.shield.hurt(damage);
        } else {
            this.health.hurt(damage);
        }
        //this.onHurt.triggerEvent(damage);
        if (!this.isAlive())
            this.onDeath.trigger();
    }

    isAlive(): boolean {
        return this.health.value > 0;
    }
}

export class PlayerEntity extends Entity{
    
}
