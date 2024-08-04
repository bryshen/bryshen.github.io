import {
  MatchThreeGame,
  TileType,
  TileTurnInData
} from './match-three.js'

import {
    getDefaultWeapon
} from './weapons.js';

import { getEnemies } from './enemies.js';

import { Entity, Player, PlayerEntity, Resource } from './entity.js';
import { GameSession } from './gamesession.js';

const mapSource: string = './images/map.jpg';

const enemies = getEnemies();
//console.log(enemies);
const costumeImages: string[] = enemies.map((e: any) => `../images/enemies/${e.img}`);
//const costumeImages: string[] = [
//    './images/enemies/imp.png'
//];
//console.log(costumeImages);

let health: TileType = new TileType('health', './images/tiles/heal.png', '#76B041');
let shield: TileType = new TileType('shield', './images/tiles/shield.png', '#17BEBB');
let attack : TileType = new TileType('attack', './images/tiles/attack.png', '#FFC914');

let tileTypes: TileType[] = [attack, attack, attack, attack, attack, attack, attack, attack, attack, shield, shield, shield, shield, shield, shield, shield, shield, shield, health, health, health];

let attackTimeMultiplier: number = 5000;
let gameRows: number = 4;
let gameColumns: number = 4;

let enemy: Player | null = null;

let siteContainer: HTMLElement;

let visualContainer: HTMLElement;
let map: HTMLImageElement;
let puzzleContainer: HTMLElement;
let enemyAvatar: HTMLImageElement | null;

let runningMan: HTMLImageElement | null;

let session: GameSession;

let match3Game : MatchThreeGame;

document.addEventListener("DOMContentLoaded", startGame);

document.addEventListener("keydown", (event) => {
    if (event.key == 'r' || event.key == 'R'){
        console.log('Restart');
        match3Game.Reset();
    }
})

let player  : PlayerEntity = new PlayerEntity("Player", 200);


function startGame(): void {
    console.log("Start Game!");
    session = new GameSession();

    siteContainer = document.getElementById('container')!;

    setupVisualBlock();
    setupPlayerLife();
    setupPuzzleArea();

    session.localPlayer.health.changeValue(100);
    session.localPlayer.shield.setValue(0);
    session.localPlayer.ammo.setValue(0);

    //Waited 1 second after dying to reload page
    session.localPlayer.onDeath.subscribe(function () { setTimeout(() => { location.reload(); }, 1000); });
    session.localPlayer.onHurt.subscribe(function () { shakeIt(runningMan!); });

    match3Game = new MatchThreeGame(gameRows, gameColumns, puzzleContainer, tileTypes);

    match3Game.TileTurnIn.subscribe(TurnInTiles);

    match3Game.OnInputLockChange.subscribe((locked) => { if (locked) puzzleContainer.classList.add('locked'); else puzzleContainer.classList.remove('locked') })

    startEncounter();
    //setTimeout(startEncounter, 3000);
}

function setupVisualBlock(): void {
    visualContainer = document.getElementById('visual-container')!;

    map = document.createElement('img');
    map.src = mapSource;
    const r: number = Math.floor(Math.random() * 360);
    map.style.transform = `rotate(${r}deg)`;
    map.style.top = "0";
    map.style.bottom = "0";
    map.style.left = "0";
    map.style.right = "0";

    visualContainer.appendChild(map);
}

function setupPlayerLife(): void {
    const playerlifeContainer: HTMLElement = document.getElementById('player-life-container')!;
    addResourceBar(session.localPlayer.shield, playerlifeContainer);
    addResourceBar(session.localPlayer.health, playerlifeContainer);
}

function setupPuzzleArea(): void {
    puzzleContainer = document.getElementById('puzzle-container')!;
}

function startEncounter(): void {
    if (enemy !== null) {
        //Still fighting an enemy
        return;
    }
    enemy = generateEnemy();
    if (enemyAvatar != null)
        enemyAvatar.remove();
    enemyAvatar = createAvatar(costumeImages[Math.floor(Math.random() * costumeImages.length)], visualContainer);
    enemy.onHurt.subscribe((damage) => {
        shakeIt(enemyAvatar!);
        const damNum: HTMLElement = createDamageNumber(damage as number, (Math.random() * 4 + 10) + '%', (Math.random() * 15 + 60) + 'vw', visualContainer);
    });
    enemy.onDeath.subscribe(function () {
        enemyAvatar!.className = 'enemy-avatar-dead';
        enemy = null;
        //match3Game.kill();
        setTimeout(() => { enemyAvatar!.remove(); 
            startEncounter();
            //match3Game.Reset();
        
        }, 2000);
        //setTimeout(startEncounter, 15000);
    });
    enemyAvatar.style.animation = 'enemySpawn .5s';
    enemyAvatar.style.animationIterationCount = '1';
    setTimeout(function () {
        enemyAvatar!.style.animation = '';
    }.bind(enemyAvatar), 500);

    //setTimeout(triggerAttack, 1000, session.localPlayer, enemy);
    setTimeout(triggerAttack, 1000, enemy, session.localPlayer);
}

function triggerAttack(attacker: Player, victim: Player): void {
    if (attacker.isAlive() && victim.isAlive())
        attacker.shoot(victim);
    setTimeout(triggerAttack, attackTimeMultiplier / attacker.weapon.firerate, attacker, victim);
}

function generateEnemy(): Player {
    var e = new Player('Bot');
    e.ammo.setValue(Math.floor(Math.random() * 99));
    e.shield.setValue(Math.floor(Math.random() * 99));
    e.health.setValue(50);
    e.weapon = getDefaultWeapon() //getRandomWeapon();
    return e;
}

function createAvatar(src: string, container: HTMLElement): HTMLImageElement {
    var img = document.createElement('img');
    img.src = src;
    img.className = 'enemy-avatar';
    container.appendChild(img);
    return img;
}

function createDamageNumber(text: number, top: string, left: string, container: HTMLElement): HTMLElement {
    var div = document.createElement('div');
    div.className = 'floating-damage-indicator';
    div.style.top = top;
    div.style.left = left;
    div.innerText = text.toString();
    container.appendChild(div);
    setTimeout(function () { div.style.top = '-100px'; }, 100);
    setTimeout(function () { div.remove(); }, 2000);
    return div;
}

function addResourceBar(resource: Resource, container: HTMLElement): void {
    var resourceBar = document.createElement('div');
    resourceBar.className = 'resource-bar-' + resource.name;
    resourceBar.style.position = 'relative';
    var resourceBarFill = document.createElement('div');
    resourceBarFill.className = 'resource-bar-' + resource.name + '-fill';
    resourceBarFill.style.width = '100%';
    resourceBarFill.style.height = '100%';
    resourceBarFill.style.position = 'absolute';
    resourceBarFill.style.top = '0';
    resourceBarFill.style.left = '0';
    resourceBar.appendChild(resourceBarFill);
    container.appendChild(resourceBar);
    resource.onValueChange.subscribe(() => {
        resourceBarFill.style.width = (resource.currentValue / resource.maxValue) * 100 + '%';
    });
}

  function shakeIt(e : any) {
    if (e == undefined)
        return;
    e.style.animation = 'shake 0.5s';
    e.style.animationIterationCount = 'infinite';
    setTimeout(function () {
      e.style.animation = '';
    }.bind(e), 500);
  }

  function TurnInTiles(data : TileTurnInData | undefined){
    if (data === undefined)
        return;
    turnInTile(data.tileType, data.tileCount, data.combo);
  }

function turnInTile(tileType : TileType, count : number, combo : number) {
    console.log("Turning in " + tileType.name);
    switch (tileType.name) {
    case 'health':
        session.localPlayer.health.changeValue(2 * count * combo);
        break;
    case 'shield':
        session.localPlayer.shield.changeValue(3 * count * combo);
        break;
    case 'attack':
        enemy?.hurt(2 * count * combo);
        break;
      default:
        console.log(`No Reward for ${tileType.name}.`);
    }
  
  }