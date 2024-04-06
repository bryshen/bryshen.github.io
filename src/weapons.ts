import weaponList from '../data/weapons.json' with {type : "json"};

export interface Weapon {
    name: string;
    damage: number;
    firerate: number;
    magazine: number;
    reloadTime: number;
    imgSrc: string;
}

export function getWeaponList(): Weapon[] {
    return weaponList;
}

export function getDefaultWeapon(): Weapon {
    return weaponList[0];
}

export function getRandomWeapon(): Weapon {
    const i = Math.floor(Math.random() * (weaponList.length - 1) + 1);
    return weaponList[i];
}
