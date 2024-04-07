import { GameEvent } from "./GameEvent.js";
import { Weapon, getDefaultWeapon } from "./weapons.js";

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
        this.onValueChange.trigger(this.currentValue);
    }

    setValue(amount: number): void {
        this.changeValue(amount - this.currentValue);
        this.onValueChange.trigger(this.currentValue);
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
        this.onTravelled.trigger(this.travelled);
    }

    changeWeapon(weapon: Weapon): void {
        if (this.weapon === weapon)
            return;
        this.weapon = weapon;
        this.onWeaponChange.trigger();
    }

    hurt(damage: number): void {
        if (damage <= 0)
            return;
        if (this.shield.currentValue > 0) {
            this.shield.changeValue(-damage);
        } else {
            this.health.changeValue(-damage);
        }
        this.onHurt.trigger(damage);
        if (!this.isAlive())
            this.onDeath.trigger();
    }

    drain(damage: number): void {
        this.health.changeValue(-damage);
        this.onHurt.trigger(damage);
        if (!this.isAlive())
            this.onDeath.trigger();
    }

    shoot(e: Player): boolean {
        if (this.ammo.currentValue <= 0) {
            return false;
        }
        this.ammo.changeValue(-1);
        e.hurt(Math.floor(this.weapon.damage * 1));
        if (e.isAlive())
            this.onEnemeyEliminated.trigger(e);
        return true;
    }

    isAlive(): boolean {
        return this.health.currentValue > 0;
    }
}