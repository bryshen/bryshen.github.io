// TODO
// Refactor player and enemies base class
// Add different enemy types
// Create enemy list increaing in difficulty
// Add screens between fights
// Dynamic size for puzzle area
// Add tile reward screen
// Scroll background when moving to next fight
// Add Health Bar / Shield to enemy avatar, count down to next attack
// Feeback for all tile matches, enemy intents and attack
import { MatchThreeGame, TileType } from './match-three.js';
import { getRandomWeapon, getWeaponList } from './weapons.js';
import { GameSession, Player } from './match3.js';
import { PlayerEntity } from './entity.js';
const mapSource = './images/map.jpg';
const stormWaitImg = './images/storm_holding_icon.webp';
const stormMoveImg = './images/storm_moving_icon.webp';
const costumeImages = [
    './images/zombies/001.png'
];
//let loot: TileType = new TileType('loot', '💰', 'https://static.wikia.nocookie.net/fortnite/images/9/94/Chest_%28Old%29_-_Chest_-_Fortnite.png', (tile: TileType) => {return tile.name == 'health' || tile.name == 'loot';});
let health = new TileType('health', './images/tiles/heal.png', '#64d72ae6');
let shield = new TileType('shield', './images/tiles/shield.png', '#03a7dce6');
let attack = new TileType('attack', './images/tiles/attack.png', '#ffa500');
//let tileTypes: TileType[] = [loot, health, shield, ammo, movement];
let tileTypes = [attack, attack, attack, attack, attack, attack, attack, attack, attack, shield, shield, shield, shield, shield, shield, shield, shield, shield, health, health, health];
let attackTimeMultiplier = 5000;
let gameRows = 4;
let gameColumns = 4;
let enemy = null;
let siteContainer;
let stormTrackerContainer;
let visualContainer;
let map;
let itemsContainer;
let puzzleContainer;
let enemyAvatar;
let weaponAvatar;
let weaponContainer;
let stormScreen;
let stormStateIndicator;
let stormStateIndicatorImg;
let runningMan;
let weapons;
let session;
let matchTimer;
let match3Game;
document.addEventListener("DOMContentLoaded", startGame);
document.addEventListener("keydown", (event) => {
    if (event.key == 'r' || event.key == 'R') {
        console.log('Restart');
        match3Game.Reset();
    }
});
let player = new PlayerEntity("Fuckface", 200);
function startGame() {
    console.log("Start Game!");
    session = new GameSession();
    weapons = getWeaponList();
    siteContainer = document.getElementById('container');
    //setupStormTracker();
    setupVisualBlock();
    //setupMatchInfo();
    setupPlayerLife();
    //setupPlayerInvetory();
    setupPuzzleArea();
    session.localPlayer.health.changeValue(100);
    session.localPlayer.shield.setValue(0);
    session.localPlayer.ammo.setValue(0);
    session.start();
    //Waited 1 second after dying to reload page
    session.localPlayer.onDeath.subscribe(function () { setTimeout(() => { location.reload(); }, 1000); });
    session.localPlayer.onHurt.subscribe(function () { shakeIt(runningMan); });
    match3Game = new MatchThreeGame(gameRows, gameColumns, puzzleContainer, tileTypes);
    match3Game.TileTurnIn.subscribe(TurnInTiles);
    match3Game.OnInputLockChange.subscribe((locked) => { if (locked)
        puzzleContainer.classList.add('locked');
    else
        puzzleContainer.classList.remove('locked'); });
    startEncounter();
    //setTimeout(startEncounter, 3000);
}
function setupStormTracker() {
    stormTrackerContainer = document.getElementById('storm-tracker-container');
    runningMan = document.createElement('img');
    runningMan.src = '/images/truck.png';
    runningMan.classList.add('storm-tracker-icon');
    runningMan.style.left = '0';
    stormTrackerContainer.appendChild(runningMan);
    session.localPlayer.onTravelled.subscribe(function (t) { runningMan.style.left = t + '%'; });
    stormScreen = document.createElement('div');
    stormScreen.style.width = '0%';
    stormScreen.classList.add('storm-tracker-screen');
    stormTrackerContainer.appendChild(stormScreen);
    session.storm.onProgressChange.subscribe(function (progress) { stormScreen.style.width = progress + '%'; });
}
function setupVisualBlock() {
    visualContainer = document.getElementById('visual-container');
    map = document.createElement('img');
    map.src = mapSource;
    const r = Math.floor(Math.random() * 360);
    map.style.transform = `rotate(${r}deg)`;
    map.style.top = "0";
    map.style.bottom = "0";
    map.style.left = "0";
    map.style.right = "0";
    visualContainer.appendChild(map);
}
function setupMatchInfo() {
    const matchInfo = document.getElementById('match-info-container');
    stormStateIndicator = document.createElement('div');
    stormStateIndicator.classList.add('match-info-section');
    matchInfo.appendChild(stormStateIndicator);
    stormStateIndicatorImg = document.createElement('img');
    stormStateIndicatorImg.classList.add('storm-state-icon');
    stormStateIndicatorImg.src = stormWaitImg;
    stormStateIndicator.appendChild(stormStateIndicatorImg);
    session.storm.onStormMovementChanged.subscribe(function (state) { stormStateIndicatorImg.src = state ? stormMoveImg : stormWaitImg; });
    matchTimer = document.createElement('div');
    matchTimer.classList.add('match-info-section');
    matchTimer.innerText = "0:30";
    matchInfo.appendChild(matchTimer);
    session.storm.onCountdownTick.subscribe(function (time) { matchTimer.innerText = formatTime(time); });
}
function setupPlayerLife() {
    const playerlifeContainer = document.getElementById('player-life-container');
    addResourceBar(session.localPlayer.shield, playerlifeContainer);
    addResourceBar(session.localPlayer.health, playerlifeContainer);
}
function setupPlayerInvetory() {
    itemsContainer = document.getElementById('items-container');
    weaponContainer = document.createElement('div');
    weaponContainer.className = 'weapon-container';
    weaponContainer.classList.add('inventory-slot');
    itemsContainer.appendChild(weaponContainer);
    const rscCounter = createResourceCounter(session.localPlayer.ammo, weaponContainer);
    weaponAvatar = document.createElement('img');
    weaponAvatar.classList.add('weapon-image');
    weaponAvatar.src = session.localPlayer.weapon.imgSrc;
    weaponContainer.appendChild(weaponAvatar);
    session.localPlayer.onWeaponChange.subscribe(function () { weaponAvatar.src = session.localPlayer.weapon.imgSrc; });
    for (let i = 0; i < 3; i++) {
        const slot = document.createElement('div');
        slot.classList.add('inventory-slot');
        itemsContainer.appendChild(slot);
    }
}
function setupPuzzleArea() {
    puzzleContainer = document.getElementById('puzzle-container');
}
function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let remainderSeconds = seconds % 60;
    if (remainderSeconds < 10) {
        remainderSeconds = '0' + remainderSeconds;
    }
    return minutes + ':' + remainderSeconds;
}
function startEncounter() {
    if (enemy !== null) {
        //Still fighting an enemy
        return;
    }
    enemy = generateEnemy();
    if (enemyAvatar != null)
        enemyAvatar.remove();
    enemyAvatar = createAvatar(costumeImages[Math.floor(Math.random() * costumeImages.length)], visualContainer);
    enemy.onHurt.subscribe(function (damage) {
        shakeIt(enemyAvatar);
        const damNum = createDamageNumber(damage, (Math.random() * 4 + 10) + '%', (Math.random() * 15 + 60) + 'vw', visualContainer);
    });
    enemy.onDeath.subscribe(function () {
        enemyAvatar.className = 'enemy-avatar-dead';
        enemy = null;
        //match3Game.kill();
        setTimeout(() => {
            enemyAvatar.remove();
            startEncounter();
            //match3Game.Reset();
        }, 2000);
        //setTimeout(startEncounter, 15000);
    });
    enemyAvatar.style.animation = 'enemySpawn .5s';
    enemyAvatar.style.animationIterationCount = '1';
    setTimeout(function () {
        enemyAvatar.style.animation = '';
    }.bind(enemyAvatar), 500);
    //setTimeout(triggerAttack, 1000, session.localPlayer, enemy);
    setTimeout(triggerAttack, 1000, enemy, session.localPlayer);
}
function triggerAttack(attacker, victim) {
    if (attacker.isAlive() && victim.isAlive())
        attacker.shoot(victim);
    // console.log('attack: ' + attacker.weapon.firerate);
    setTimeout(triggerAttack, attackTimeMultiplier / attacker.weapon.firerate, attacker, victim);
}
function generateEnemy() {
    var e = new Player('Bot');
    e.ammo.setValue(Math.floor(Math.random() * 99));
    e.shield.setValue(Math.floor(Math.random() * 99));
    e.health.setValue(50);
    e.weapon = getRandomWeapon();
    return e;
}
function createResourceCounter(resource, container) {
    const resourceDiv = document.createElement('div');
    resourceDiv.className = 'resource-item-' + resource.name;
    container.appendChild(resourceDiv);
    resource.onValueChange.subscribe(function () {
        resourceDiv.innerHTML = resource.currentValue.toString();
    });
    return resourceDiv;
}
function createAvatar(src, container) {
    var img = document.createElement('img');
    img.src = src;
    img.className = 'enemy-avatar';
    container.appendChild(img);
    return img;
}
function createDamageNumber(text, top, left, container) {
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
function addResourceBar(resource, container) {
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
    resource.onValueChange.subscribe(function (value) {
        resourceBarFill.style.width = (resource.currentValue / resource.maxValue) * 100 + '%';
    });
}
function shakeIt(e) {
    if (e == undefined)
        return;
    e.style.animation = 'shake 0.5s';
    e.style.animationIterationCount = 'infinite';
    setTimeout(function () {
        e.style.animation = '';
    }.bind(e), 500);
}
function TurnInTiles(data) {
    if (data === undefined)
        return;
    turnInTile(data.tileType, data.tileCount, data.combo);
}
function turnInTile(tileType, count, combo) {
    console.log("Turning in " + tileType.name);
    switch (tileType.name) {
        case 'health':
            session.localPlayer.health.changeValue(2 * count * combo);
            break;
        case 'shield':
            session.localPlayer.shield.changeValue(3 * count * combo);
            break;
        case 'ammo':
            session.localPlayer.ammo.changeValue(1);
            break;
        case 'loot':
            var gift = getRandomWeapon();
            //console.log(gift);
            if (bestWeapon(session.localPlayer.weapon, gift) === gift)
                //if (gift.name == 'Drum Gun')
                session.localPlayer.changeWeapon(gift);
            //console.log('Player was given a ' + gift.name);
            break;
        case 'attack':
            enemy?.hurt(2 * count * combo);
            break;
        default:
            console.log(`No Reward for ${tileType.name}.`);
    }
}
function bestWeapon(weapon1, weapon2) {
    if (weapon1 == undefined || weapon2 == undefined)
        return null;
    var dps1 = weapon1.damage * weapon1.firerate;
    var dps2 = weapon2.damage * weapon2.firerate;
    if (dps1 < dps2)
        return weapon2;
    return weapon1;
}
