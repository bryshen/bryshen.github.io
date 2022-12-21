import weaponList from '../data/weapons.json' assert {type: 'json'};


export class Weapon{
    constructor(name, damage, firerate, magazine, reloadTime, imgsrc) {
        this.name = name;
        this.damage = damage;
        this.firerate = firerate;
        this.magazine = magazine;
        this.reloadTime = reloadTime;
        this.imgsrc = imgsrc;
      }
}

export function getWeaponList(){
  return weaponList;
}

export function getDefaultWeapon(){
  return weaponList[0];
}

export function getRandomWeapon(){
  var i = Math.floor(Math.random() * (weaponList.length - 1) + 1);
  return weaponList[i];
}