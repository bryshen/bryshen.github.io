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

var weapons;

export function getWeaponList(){
  console.log([weaponList[0]]);
  return null;
  if (weapons == null){
    weapons = JSON.parse(weaponList);
  }
  
  return weapons;
}