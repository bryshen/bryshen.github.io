// Storm moves every 30 seconds, then a rest period, then it moves again

//https://static.wikia.nocookie.net/fortnite_gamepedia/images/6/6e/Storm_holding_icon.png
//https://static.wikia.nocookie.net/fortnite_gamepedia/images/e/e1/Storm_moving_icon.gif

import { getDefaultWeapon, getRandomWeapon, getWeaponList, Weapon } from './weapons.js';
import { GameEvent, GameSession, Player, Tile, TileType } from './match3-br.js';
import { DragDropObject } from './draggable.js';
const mapSource = './images/map.jpg';
const stormWaitImg = './images/storm_holding_icon.webp';
const stormMoveImg = './images/storm_moving_icon.webp'

// const mapSource = 'https://pbs.twimg.com/media/FjHqlfPaAAAFOPR?format=jpg&name=large';
const costumeImages = ['https://static.wikia.nocookie.net/fortnite/images/9/90/Blue_Squire_%28New%29_-_Outfit_-_Fortnite.png', 'https://static.wikia.nocookie.net/fortnite/images/d/d5/New_Sparkle_Specialist.png', 'https://static.wikia.nocookie.net/fortnite/images/1/11/Rust_Lord_%28New%29_-_Outfit_-_Fortnite.png', 'https://static.wikia.nocookie.net/fortnite/images/d/d9/Elite_Agent_%28New%29_-_Outfit_-_Fortnite.png', 'https://static.wikia.nocookie.net/fortnite/images/6/62/Zoey_%28New%29_-_Outfit_-_Fortnite.png', 'https://static.wikia.nocookie.net/fortnite/images/4/47/The_Visitor_%28New%29_-_Outfit_-_Fortnite.png', 'https://static.wikia.nocookie.net/fortnite/images/f/f2/Redline_%28New%29_-_Outfit_-_Fortnite.png', 'https://static.wikia.nocookie.net/fortnite/images/d/d8/Rook_%28New%29_-_Outfit_-_Fortnite.png', 'https://static.wikia.nocookie.net/fortnite/images/7/7f/DJ_Yonder_%28New%29_-_Outfit_-_Fortnite.png', 'https://static.wikia.nocookie.net/fortnite_gamepedia/images/3/38/The_Autumn_Queen.png', 'https://static.wikia.nocookie.net/fortnite_gamepedia/images/1/1d/T-Soldier-HID-825-Athena-Commando-F-SportsFashion-L.png', 'https://static.wikia.nocookie.net/fortnite_gamepedia/images/5/5e/New_Ice_Queen.png', 'https://static.wikia.nocookie.net/fortnite_gamepedia/images/f/fc/New_Cloacked_Star.png', 'https://static.wikia.nocookie.net/fortnite_gamepedia/images/1/1a/New_Kuno.png', 'https://static.wikia.nocookie.net/fortnite_gamepedia/images/f/fe/T_Kairos_ConstructorM_L.png', 'https://static.wikia.nocookie.net/fortnite_gamepedia/images/c/cf/New_Lynx.png', 'https://static.wikia.nocookie.net/fortnite_gamepedia/images/5/5e/Newer_Raptor.png', 'https://static.wikia.nocookie.net/fortnite_gamepedia/images/8/8e/Rue.png', 'https://static.wikia.nocookie.net/fortnite_gamepedia/images/5/51/New_Fishstick.png'];
const openChestImage = 'https://static.wikia.nocookie.net/fortnite_gamepedia/images/9/96/Treasure_chest_%28tier_1%29.png/revision/latest?cb=20180312205812';

var tileYOffset = 1;
var tileXOffset = 0;
var inputAllowed = true;

var loot = new TileType('loot', '💰', 'https://static.wikia.nocookie.net/fortnite/images/9/94/Chest_%28Old%29_-_Chest_-_Fortnite.png');
var health = new TileType('health', '💊', 'https://static.wikia.nocookie.net/fortnite_gamepedia/images/0/0e/Consumable_bandage.png');
var shield = new TileType('shield', '🛡️', 'https://static.wikia.nocookie.net/fortnite/images/d/d9/Shield_Potion_-_Item_-_Fortnite.png');
var ammo = new TileType('ammo', '🔫', 'https://static.wikia.nocookie.net/fortnite/images/d/da/Ammo_Box_-_Container_-_Fortnite.png');
var mats = new TileType('mats', '🪵', 'https://static.wikia.nocookie.net/fortnite_gamepedia/images/f/f2/Wood_icon.png');
var movement = new TileType('movement', '👟', 'https://static.wikia.nocookie.net/fortnite_gamepedia/images/f/f2/Wood_icon.png');
var tileTypes = [loot, health, shield, ammo, movement];

var attackTimeMultiplier = 5000;
var gameRows = 7;
var gameColumns = 7;
var tiles;
var selectedTile;
var removedTiles = [];

var enemy = null;

var siteContainer;


var stormTrackerContainer;
var visualContainer;
var map;
var itemsContainer;
var puzzleContainer;
var enemyAvatar;
var weaponAvatar;

var weaponContainer;

var stormScreen;
var stormStateIndicator;
var stormStateIndicatorImg;
var runningMan;

// Controls
var xDown = null;
var yDown = null;

var weapons;
var session;

var matchTimer;
document.addEventListener("DOMContentLoaded", startGame);


spawnItem(item){
  var itemDiv = document.createElement('div');

  container.appendChild(itemDiv);
  var dragObj = new DragDropObject(itemDiv);
  dragObj.onDragDrop.subscribe(function(d, e){
    d.element.remove();
    e.style.backgroundColor = 'blue';
  })
}

setupDraggableTest();

function setupDraggableTest(){
  var dragThing = new DragDropObject(document.getElementById('draggable-test'));
  dragThing.onDragDrop.subscribe(function(d, e){
    d.element.remove();
    e.style.backgroundColor = 'blue';
  })
}

function setupStormTracker() {

  stormTrackerContainer = document.getElementById('storm-tracker-container');
  runningMan = document.createElement('img');

  runningMan.src = '/images/running-man.png';
  runningMan.classList.add('storm-tracker-icon');
  runningMan.left = 0;
  stormTrackerContainer.appendChild(runningMan);
  session.localPlayer.onTravelled.subscribe(function (t) { runningMan.style.left = t + '%'; });



  stormScreen = document.createElement('div');
  stormScreen.style.width = '0%';
  stormScreen.classList.add('storm-tracker-screen');
  stormTrackerContainer.appendChild(stormScreen);

  session.storm.onProgressChange.subscribe(function (progress) { stormScreen.style.width = progress + '%' });

}

function setupVisualBlock() {

  visualContainer = document.getElementById('visual-container')

  map = document.getElementById('map');
  map.src = mapSource;
  var r = Math.floor(Math.random() * 360);
  map.style.transform = 'rotate(' + r + 'deg)';
  //map.style.bottom = (Math.floor(Math.random() * 1) + 50) + 'vmx';
  map.style.top = "0";
  map.style.bottom = "0";
  map.style.left = "0";
  map.style.right = "0";

}

function setupMatchInfo() {
  var matchInfo = document.getElementById('match-info-container');

  stormStateIndicator = document.createElement('div');
  stormStateIndicator.classList.add('match-info-section');
  // stormStateIndicator.classList.add('storm-state-icon');
  // stormStateIndicator.innerText = 'fuck';
  // session.storm.onStormMovementChanged.subscribe(function(state){stormStateIndicator.classList.toggle('moving', state)})
  matchInfo.appendChild(stormStateIndicator);

  stormStateIndicatorImg = document.createElement('img');
  stormStateIndicatorImg.classList.add('storm-state-icon');
  stormStateIndicatorImg.src = stormWaitImg;
  stormStateIndicator.appendChild(stormStateIndicatorImg);

  session.storm.onStormMovementChanged.subscribe(function (state) { stormStateIndicatorImg.src = state ? stormMoveImg : stormWaitImg });

  matchTimer = document.createElement('div');
  matchTimer.classList.add('match-info-section')
  matchTimer.innerText = "0:30";
  matchInfo.appendChild(matchTimer);

  session.storm.onCountdownTick.subscribe(function (time) { matchTimer.innerText = formatTime(time) });
}

function setupPlayerLife(){
  var playerlifeContainer = document.getElementById('player-life-container');
  addResourceBar(session.localPlayer.shield, playerlifeContainer);
  addResourceBar(session.localPlayer.health, playerlifeContainer);
}

function setupPlayerInvetory(){
  var itemsContainer = document.getElementById('items-container');
  var weaponContainer = document.createElement('div');
  weaponContainer.className = 'weapon-container';
  weaponContainer.classList.add('inventory-slot');
  itemsContainer.appendChild(weaponContainer);
  var rscCounter = createResourceCounter(session.localPlayer.ammo, weaponContainer);
  weaponAvatar = document.createElement('img');
  weaponAvatar.classList.add('weapon-image');
  weaponAvatar.src = session.localPlayer.weapon.imgSrc;
  weaponContainer.appendChild(weaponAvatar);
  session.localPlayer.onWeaponChange.subscribe(function () {
    weaponAvatar.src = session.localPlayer.weapon.imgSrc;
  });

  for (let i = 0; i < 3; i++) {
    var slot = document.createElement('div');
    slot.classList.add('inventory-slot');
    itemsContainer.appendChild(slot);
  }  
}

function setupPuzzleArea() {
  puzzleContainer = document.getElementById('puzzle-container');
  createGrid(gameRows, gameColumns, puzzleContainer);
}

function startGame() {
  session = new GameSession();
  weapons = getWeaponList();

  siteContainer = document.getElementById('container');

  setupStormTracker();
  setupVisualBlock();
  setupMatchInfo();
  setupPlayerLife();
  setupPlayerInvetory();
  setupPuzzleArea();

  session.localPlayer.health.changeValue(100);
  session.localPlayer.shield.setValue(0);
  session.localPlayer.ammo.setValue(0);

  session.start();

  //Waited 1 second after dying to reload page
  session.localPlayer.onDeath.subscribe(function(){setTimeout(() => {location.reload();}, 1000);});
  session.localPlayer.onHurt.subscribe(function(){shakeIt(runningMan)});

  doubleCheckBoard();
  setTimeout(startEncounter, 30000);

}

function updateTile(tile) {
  tile.element.style.top = `${tileYOffset + tile.y * (100 / 7)}%`;
  tile.element.style.left = `${tileXOffset + tile.x * (100 / 7)}%`;
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
    shakeIt(enemyAvatar)
    var damNum = createDamageNumber(damage, (Math.random() * 4 + 10) + '%', (Math.random() * 15 + 60) + 'vw', visualContainer);
  });
  enemy.onDeath.subscribe(function () {
    enemyAvatar.className = 'enemy-avatar-dead';
    setTimeout(function () { enemyAvatar.remove() }, 2000);
    enemy = null;
    setTimeout(startEncounter, 15000);
  });
  enemyAvatar.style.animation = 'enemySpawn .5s';
  enemyAvatar.style.animationIterationCount = '1';
  setTimeout(function () {
    enemyAvatar.style.animation = '';
  }.bind(enemyAvatar), 500);

  setTimeout(triggerAttack, 1000, session.localPlayer, enemy);
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
  e.health.setValue(Math.floor(Math.random() * 99));
  e.weapon = getRandomWeapon();
  return e;
}

function createResourceCounter(resource, container) {

  const resourceDiv = document.createElement('div');
  //const current = document.createElement('span');
  //current.innerHTML = resource.currentValue;
  //const max = document.createElement('span');
  //max.innerHTML = resource.maxValue;
  //const slash = document.createElement('span');
  //slash.innerHTML = '/';
  resourceDiv.className = 'resource-item-' + resource.name;
  //resourceDiv.appendChild(current);
  //resourceDiv.appendChild(slash);
  //resourceDiv.appendChild(max);
  container.appendChild(resourceDiv);
  resource.onValueChange.subscribe(function () {
    resourceDiv.innerHTML = resource.currentValue;
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
  div.innerText = text;
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

function createSelectionOutline(container) {
  var div = document.createElement('div');
  div.classList.add('selection-outline');
  container.appendChild(div);
  return div;
}



function selectTile(tile) {
  if (selectedTile == null) {
    tile.element.style.animation = 'pulse .5s';
    tile.element.style.animationIterationCount = 'infinite';
    selectedTile = tile;
    return;
  }

  if (selectedTile === tile) {
    deselectTile(tile);
    return;
  }

  if (checkForAdjacent(tile, selectedTile)) {
    // pause player control
    inputAllowed = false;

    var tempTile = selectedTile;
    deselectTile(selectedTile);

    swapTiles(tile, tempTile);
    setTimeout(checkBoard, 200, tile, tempTile);
  } else {
    deselectTile(selectedTile);
    selectTile(tile);
  }
}

function waterfall() {
  for (let x = tiles.length - 1; x >= 0; x--) {
    var column = tiles[x];
    column = removeNullAndUndefined(column);
    while (column.length < gameRows) {
      var t = createNewTile(x, -5, puzzleContainer);
      column.unshift(t);
    }
    for (let y = 0; y < column.length; y++) {
      var tile = column[y];
      tile.y = y;
    }
    tiles[x] = column;
  }
}

function checkBoard(tile1, tile2) {
  if (!collapseGroups()) {
    swapTiles(tile1, tile2);
    inputAllowed = true;
    return;
  } else {
    waterfall();
    setTimeout(updateBoard, 250);
  }

}

function doubleCheckBoard() {
  if (collapseGroups()) {
    waterfall();
    setTimeout(updateBoard, 250);
  } else {
    inputAllowed = true;
  }
}

function updateBoard() {
  for (var x = 0; x < tiles.length; x++) {
    for (var y = 0; y < tiles[x].length; y++) {
      updateTile(tiles[x][y]);
      // tiles[x][y].updateElement();
    }
  }
  for (var i = 0; i < removedTiles.length; i++) {
    removedTiles[i].element.remove();
  }
  removedTiles = [];
  setTimeout(doubleCheckBoard, 250);
}


function deselectTile(tile) {
  if (tile == null)
    return false;
  if (selectedTile !== tile)
    return;
  tile.element.style.animation = '';
  selectedTile = null;
}

function checkForAdjacent(tile1, tile2) {
  var xDiff = Math.abs(tile1.x - tile2.x);
  var yDiff = Math.abs(tile1.y - tile2.y);
  return ((xDiff == 0 && yDiff == 1) || (yDiff == 0 && xDiff == 1));
}

function tileClickHandler(event) {
  if (!inputAllowed)
    return;
  selectTile(event.target.tile);
}

function tileSwipeStartHandler(event) {
  event.target.style.animation = 'pulse .5s';
  event.target.style.animationIterationCount = 'infinite';

  xDown = event.changedTouches[0].screenX;
  yDown = event.changedTouches[0].screenY;
}

function tileSwipeEndHandler(event) {
  event.target.style.animation = '';

  if (!xDown || !yDown) {
    return;
  }

  if (!inputAllowed)
    return;

  inputAllowed = false;

  const deadZone = 10;

  var xUp = event.changedTouches[0].screenX;
  var yUp = event.changedTouches[0].screenY;

  var xDiff = xDown - xUp;
  var yDiff = yDown - yUp;
  var xAbs = Math.abs(xDiff);
  var yAbs = Math.abs(yDiff);
  var dir = -1;

  if (xAbs > deadZone || yAbs > deadZone) {
    if (xAbs > yAbs) {
      /*most significant*/
      if (xDiff > 0) {
        /* right swipe */
        dir = 3;
      }
      if (xDiff < 0) {
        /* left swipe */
        dir = 2;
      }
    } else {
      if (yDiff > 0) {
        /* up swipe */
        dir = 0;
      }
      if (yDiff < 0) {
        /* down swipe */
        dir = 1;
      }
    }
  }

  if (handleSwipe(event.target.tile, dir))
    deselectTile(selectedTile);
  else
    inputAllowed = true;

  /* reset values */
  xDown = null;
  yDown = null;

}

function handleSwipe(tile, dir) {
  if (dir < 0)
    return false;
  var neighbors = getNeighbors(tiles, tile.x, tile.y);
  var directions = ['up', 'down', 'left', 'right'];
  //console.log('Swiped ' + directions[dir]);
  if (swapTiles(tile, neighbors[dir])) {
    setTimeout(checkBoard, 200, tile, neighbors[dir]);
  } else {
    return false;
  }
  return true;
}

function createGrid(numRows, numCols, container) {
  tiles = [];
  for (var x = 0; x < numCols; x++) {
    var tileColumn = [];
    for (var y = 0; y < numRows; y++) {
      var t = createNewTile(x, y, container);
      tileColumn.push(t);
    }
    tiles.push(tileColumn);
  }
}

function createNewTile(x, y, container) {
  var div = document.createElement('div');
  //div.style.fontSize = '1em';
  div.style.fontSize = '3em';
  div.style.textAlign = 'center';
  div.style.verticalAlign = 'middle';
  div.classList.add('select-tile');

  div.addEventListener('click', tileClickHandler);
  div.addEventListener('touchstart', tileSwipeStartHandler);
  div.addEventListener('touchend', tileSwipeEndHandler);

  container.appendChild(div);

  var t = new Tile(div, tileTypes[Math.floor(Math.random() * tileTypes.length)], x, y);
  updateTile(t);
  return t;

}


function swapTiles(tile1, tile2) {
  if (tile1 == null || tile2 == null)
    return false;
  var x = tile1.x;
  var y = tile1.y;

  tile1.x = tile2.x;
  tile1.y = tile2.y;

  tile2.x = x;
  tile2.y = y;

  updateTile(tile1);
  updateTile(tile2);

  tiles[tile1.x][tile1.y] = tile1;
  tiles[tile2.x][tile2.y] = tile2;

  return true;
}

// function replaceTile(oldTile, newTile) {
//   if (oldTile == undefined || newTile == undefined)
//     return;
//   newTile.x = oldTile.x;
//   newTile.y = newTile.y;
//   newTile.updateElement;
//   tiles[oldTile.x][oldTile.y] = newTile;
//   oldTile.element.remove();
// }

function collapseGroups() {
  var groups = findGroups();
  var found = false;
  for (let i = 0; i < groups.length; i++) {
    for (let j = 0; j < groups[i].length; j++) {
      if (groups[i][j] !== undefined) {
        var clearedTile = groups[i][j];
        turnInTile(clearedTile);
        tiles[clearedTile.x][clearedTile.y] = null;
        //clearedTile.element.style.color = 'transparent';
        clearedTile.element.style.opacity = '0';
        removedTiles.push(clearedTile);
        found = true
      }
    }
  }
  return found;
}

function turnInTile(tile) {
  switch (tile.type.name) {
    case 'health':
      session.localPlayer.health.changeValue(2);
      break;
    case 'shield':
      session.localPlayer.shield.changeValue(3);
      break;
    case 'ammo':
      session.localPlayer.ammo.changeValue(1);
      break;
    case 'movement':
      var p = map.style.left; // return value in px; i.e 50px
      p = p.substr(0, p.length - 2); // remove px ie : 50px becomes 50
      map.style.left = (+p) - 2 + '%' // convert p to number and add 10

      session.localPlayer.travel(0.65);
      break;
    case 'loot':
      var gift = getRandomWeapon();
      //console.log(gift);
      if (bestWeapon(session.localPlayer.weapon, gift) === gift)
        //if (gift.name == 'Drum Gun')
        session.localPlayer.changeWeapon(gift);
      //console.log('Player was given a ' + gift.name);
      break;
    default:
      console.log(`No Reward for ${tile.type.name}.`);
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

function removeNullAndUndefined(arr) {
  return arr.filter(function (item) {
    return item !== null && typeof item !== 'undefined';
  });
}

function findGroups() {
  let groups = [];
  for (let x = 0; x < tiles.length; x++) {
    for (let y = 0; y < tiles[x].length; y++) {
      var type = tiles[x][y].type;
      //check horizontal
      var group = [];
      group.push(tiles[x][y]);
      for (let x2 = x + 1; x2 < tiles.length; x2++) {
        if (tiles[x2][y].type === type) {
          group.push(tiles[x2][y]);
        } else {
          break;
        }
      }
      if (group.length >= 3) {
        groups.push(group);
      }


      //check vertical
      group = [];
      group.push(tiles[x][y]);
      for (let y2 = y + 1; y2 < tiles[x].length; y2++) {
        if (tiles[x][y2].type === type) {
          group.push(tiles[x][y2]);
        } else {
          break;
        }
      }
      if (group.length >= 3) {
        groups.push(group);
      }

    }
  }
  return groups;
}

function getNeighbors(arr, x, y) {
  var neighbors = [];
  //check top
  neighbors.push((arr[x][y - 1] !== undefined ? arr[x][y - 1] : null));
  //check bottom
  neighbors.push((arr[x][y + 1] !== undefined ? arr[x][y + 1] : null));
  //check right
  neighbors.push((arr[x + 1] !== undefined && arr[x + 1][y] !== undefined ? arr[x + 1][y] : null));
  //check left
  neighbors.push((arr[x - 1] !== undefined && arr[x - 1][y] !== undefined ? arr[x - 1][y] : null));
  return neighbors;
}


/*
function findGroups() {
  var groups = [];
  var currentGroup = [];
  var row = 0;
  var column = 0;
  var currentTile = null;

  var neighborTile = null;

  var vMatches;
  var hMatches;
  for (let x = 0; x < tiles.length; x++) {
    currentTile = tiles[x];
    currentGroup = [currentTile];


    row = Math.floor(i / gameColumns);
    column = i % gameColumns;

    hMatches = [currentTile];
    // ignore this is tile to the left is the same
    if (!tilesMatch(currentTile, tiles[i - 1])) {
      //loop looking right
      for (let j = i + 1; j < gameColumns; j++) {
        neighborTile = tiles[j];
        if (!tilesMatch(currentTile, neighborTile))
          break;

        hMatches.push(neighborTile);
      }
    }
    if (hMatches.length >= 3) {
      groups.push(hMatches);
    }
    //loop looking down
  }
  return groups;
}

function tilesMatch(tile1, tile2) {
  if (tile1 == undefined || tile2 == undefined)
    return false;
  if (tile1.type === tile2.type)
    return true;

  return false;
}
*/

///// Deprecated Functions

// function getIndexOfK(arr, k) {
//   for (var i = 0; i < arr.length; i++) {
//     var index = arr[i].indexOf(k);
//     if (index > -1) {
//       return [i, index];
//     }
//   }
// }

// function getAdjacentTiles(tile) {
//   var adjacents = [tiles[tile.y + 1][tile.x], tiles[tile.y - 1][tile.x], tiles[tile.y][tile.x + 1], tiles[tile.y][tile.x - 1]];
//   return removeNullAndUndefined(adjacents);
// }

function shakeIt(e) {
  e.style.animation = 'shake 0.5s';
  e.style.animationIterationCount = 'infinite';
  setTimeout(function () {
    e.style.animation = '';
  }.bind(e), 500);
}
