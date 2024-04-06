import weaponList from '../data/weapons.json' with { type: "json" };
export function getWeaponList() {
    return weaponList;
}
export function getDefaultWeapon() {
    return weaponList[0];
}
export function getRandomWeapon() {
    const i = Math.floor(Math.random() * (weaponList.length - 1) + 1);
    return weaponList[i];
}
