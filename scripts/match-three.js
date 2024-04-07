import { GameEvent } from "./GameEvent.js";
class Point {
    _x;
    get x() {
        return this._x;
    }
    set x(v) {
        this._x = v;
        this.onUpdate.trigger();
    }
    _y;
    get y() {
        return this._y;
    }
    set y(v) {
        this._y = v;
        this.onUpdate.trigger();
    }
    constructor(x, y) {
        this._x = x;
        this._y = y;
    }
    onUpdate = new GameEvent();
    get OnUpdate() { return this.onUpdate.expose(); }
}
export class MatchThreeGame {
    // TODO: Add subclass for the board and it's functions
    onTileTurnIn = new GameEvent();
    get TileTurnIn() { return this.onTileTurnIn.expose(); }
    onCheckBoard = new GameEvent();
    get CheckBoard() { return this.onCheckBoard.expose(); }
    onUpdateBoard = new GameEvent();
    get UpdateBoard() { return this.onUpdateBoard.expose(); }
    onTransitionFinished = new GameEvent();
    get OnTransitionFinished() { return this.onTransitionFinished.expose(); }
    onInputLockChange = new GameEvent();
    get OnInputLockChange() { return this.onInputLockChange.expose(); }
    //tileTypes: TileType[];
    disableInput = false;
    inputBlocked = false;
    _tiles = [];
    _container;
    _rows = 1;
    _columns = 1;
    removedTiles = [];
    _selectedTile = null;
    combo = 1;
    transitioningTiles = [];
    swappedTiles = undefined;
    turnedinTiles = [];
    discardTiles = [];
    errorType = new TileType('overflow', './images/tiles/junk.png', '#000000', (tile) => { return false; });
    tileBag;
    get inputAllowed() {
        return this.transitioningTiles.length == 0; //return !this.disableInput && !this.inputBlocked;
    }
    get selectedTile() {
        return this._selectedTile;
    }
    get container() {
        return this._container;
    }
    get rows() {
        return this._rows;
    }
    get columns() {
        return this._columns;
    }
    get tiles() {
        return this._tiles;
    }
    constructor(rows, colunms, container, tileTypes) {
        this.tileBag = tileTypes;
        shuffleArray(this.tileBag);
        //this.tileTypes = tileTypes;
        this._container = container;
        this._rows = rows;
        this._columns = colunms;
        this.OnTransitionFinished.subscribe(this.doubleCheckBoard);
        this.createGrid(rows, colunms);
    }
    selectTile(tile) {
        this._selectedTile = tile;
    }
    /*
    addTileType(tileType:TileType) {
        this.tileTypes.push(tileType);
    }

    removeTileType(tileType:TileType){
        this.tileTypes = this.tileTypes.filter((t : TileType) => {t.name !== tileType.name});
    }
    */
    createGrid(numRows, numCols) {
        this._tiles = [];
        for (var y = numRows - 1; y >= 0; y--) {
            for (var x = 0; x < numCols; x++) {
                //var tileColumn : any = [];
                var t = this.createNewTile(x, y);
                if (this.tiles.length <= x)
                    this._tiles.push([]);
                this._tiles[x].unshift(t);
                console.log(this.tiles[x][y] == t);
            }
        }
    }
    createNewTile(x, y) {
        var t = new Tile(this, this.PullFromTileBag(), x, y);
        return t;
    }
    PullFromTileBag = () => {
        if (this.tileBag.length === 0) {
            //if (this.discardTiles.length < (this.rows * this.columns) * .15){
            //if (this.discardTiles.length < 9){
            if (this.discardTiles.length === 0 || this.discardTiles.every(t => t == this.discardTiles[0])) {
                console.warn("Tile bag empty!");
                return this.errorType; // If the array is empty, return undefined
            }
            else {
                console.info('Shuffling Discard Bag');
                this.tileBag = this.discardTiles;
                shuffleArray(this.tileBag);
                this.discardTiles = [];
            }
        }
        return this.tileBag.pop();
        //return this.removeRandomElement(this.tileBag) as TileType;
    };
    ReturnToBag = (type) => {
        if (type.name == 'overflow')
            return;
        this.discardTiles.push(type);
    };
    Reset = () => {
        this.combo = 1;
        this.createGrid(this._rows, this._columns);
        setTimeout(this.doubleCheckBoard, 200);
    };
    swapTiles(tile1, tile2, check) {
        console.log("Swap Tiles");
        if (tile1 == null || tile2 == null)
            return false;
        this.tiles[tile1.point.x][tile1.point.y] = tile2;
        this.tiles[tile2.point.x][tile2.point.y] = tile1;
        var x = tile1.point.x;
        var y = tile1.point.y;
        tile1.point.x = tile2.point.x;
        tile1.point.y = tile2.point.y;
        tile2.point.x = x;
        tile2.point.y = y;
        this.combo = 1;
        return true;
    }
    doubleCheckBoard = () => {
        console.log("Board Check");
        if (this.collapseGroups())
            this.waterfall();
        else
            this.onInputLockChange.trigger(false);
    };
    collapseGroups = () => {
        var groups = [];
        this.onCheckBoard.trigger(groups);
        for (let i = 0; i < groups.length; i++) {
            for (let j = 0; j < groups[i].length; j++) {
                if (groups[i][j] !== undefined) {
                    var clearedTile = groups[i][j];
                    if (!this.removedTiles.includes(clearedTile)) {
                        this._tiles[clearedTile.point.x][clearedTile.point.y] = null;
                        clearedTile.element.style.opacity = '0';
                        this.removedTiles.push(clearedTile);
                    }
                }
            }
        }
        if (this.removedTiles.length > 0) {
            this.turnInClearedTiles();
            return true;
        }
        return false;
    };
    turnInClearedTiles = () => {
        console.log("Turning In Cleared Tiles");
        if (this.removedTiles.length < 0)
            return;
        var tempTiles = this.removedTiles;
        while (tempTiles.length > 0) {
            this.onTileTurnIn.trigger({ tileType: tempTiles[0].type, tileCount: tempTiles.filter((t) => t.type.name === tempTiles[0].type.name).length + 1, combo: this.combo });
            tempTiles = tempTiles.filter((t) => t.type.name !== tempTiles[0].type.name);
        }
        this.removedTiles.forEach(t => { this.ReturnToBag(t.type); });
        this.removedTiles = [];
        this.combo++;
    };
    waterfall = () => {
        console.log("Waterfall");
        this._tiles.forEach((column, x) => {
            column = column.filter((t) => t !== null && t !== undefined);
            while (column.length < this._rows) {
                var t = this.createNewTile(x, column.length - this._rows);
                column.unshift(t);
            }
            for (let y = 0; y < column.length; y++) {
                var tile = column[y];
                if (tile !== null)
                    tile.point.y = y;
            }
            this._tiles[x] = column;
        });
    };
    updateBoard = () => {
        this.onUpdateBoard.trigger();
    };
    registerTransition(tile) {
        if (this.transitioningTiles.includes(tile))
            return;
        this.transitioningTiles.push(tile);
        if (this.transitioningTiles.length == 1) {
            this.onInputLockChange.trigger(true);
        }
    }
    unregisterTransition(tile) {
        if (this.transitioningTiles.includes(tile))
            this.transitioningTiles = this.transitioningTiles.filter(t => t !== tile);
        if (this.transitioningTiles.length == 0) {
            console.log('Transition Ended');
            this.onTransitionFinished.trigger();
        }
    }
    kill = () => {
        this.tiles.forEach(a => { a.forEach(t => { if (t !== null) {
            t.element.style.opacity = '0';
        } }); });
        setTimeout(() => {
            this._tiles = [];
            this.updateBoard();
        }, 1000);
    };
}
export class TileType {
    name;
    src;
    color;
    match = (tile) => { return this.name === tile.name; };
    constructor(name, src, color, match) {
        this.name = name;
        this.color = color;
        this.src = src;
        if (match === undefined)
            return;
        this.match = match;
    }
}
export class Tile {
    point;
    type;
    game;
    element; // Use the custom interface here
    tileStartY = -5;
    // Controls
    xDown = null;
    yDown = null;
    constructor(game, type, x, y) {
        this.game = game;
        this.type = type;
        var div = document.createElement('div');
        //div.style.fontSize = '3em';
        //div.style.textAlign = 'center';
        //div.style.verticalAlign = 'middle';
        div.classList.add('select-tile');
        this.element = div;
        this.element.addEventListener('click', this.ClickHandler);
        this.element.addEventListener('touchstart', this.SwipeStartHandler);
        this.element.addEventListener('touchend', this.SwipeEndHandler);
        this.element.ontransitionstart = (event) => { this.game.registerTransition(this); };
        this.element.ontransitionend = (event) => { this.Transitioned(); };
        //this.element.on = (event) => {console.log("Loaded Tile Div");};   
        game.CheckBoard.subscribe(this.Solve);
        game.UpdateBoard.subscribe(this.Update);
        var img = document.createElement('img');
        img.src = type.src;
        img.style.height = '100%';
        img.style.width = '100%';
        img.style.backgroundColor = type.color;
        img.onload = (event) => { this.Reposition(); this.point.OnUpdate.subscribe(this.Reposition); };
        this.element.appendChild(img);
        this.element.tile = this;
        game.container.appendChild(div);
        this.point = new Point(x, this.tileStartY);
        this.Reposition();
        this.point.y = y;
    }
    Transitioned = () => {
        this.Update();
        this.game.unregisterTransition(this);
    };
    Solve = (output) => {
        if (output == undefined)
            return;
        const neighbors = this.GetNeighbors();
        this.RegisterMatches(output, neighbors[0], neighbors[1]);
        this.RegisterMatches(output, neighbors[2], neighbors[3]);
    };
    RegisterMatches = (output, neighborA, neighborB) => {
        if ((neighborA?.type.match(this.type) && neighborB?.type.match(this.type)) == true) {
            let vArr = [neighborA, this, neighborB];
            output.forEach((line, i) => {
                const intersection = vArr.filter(t => line.includes(t));
                if (intersection.length == 2) {
                    vArr.filter(t => !intersection.includes(t)).forEach(t => output[i].push(t));
                    vArr = [];
                }
            });
            if (vArr.length == 3)
                output.push(vArr);
        }
    };
    Update = () => {
        console.log("Updating Tile");
        if (this.game.tiles.length > this.point.x && this.game.tiles[this.point.x][this.point.y] == this) {
            this.Reposition();
        }
        else {
            this.Destroy();
        }
    };
    Destroy = () => {
        //this.game.ReturnToBag(this.type);
        this.game.CheckBoard.unsubscribe(this.Solve);
        this.game.UpdateBoard.unsubscribe(this.Update);
        this.game.unregisterTransition(this);
        this.element.remove();
    };
    Reposition = () => {
        this.element.style.top = `${0 + this.point.y * (100 / this.game.rows)}%`;
        this.element.style.left = `${0 + this.point.x * (100 / this.game.columns)}%`;
    };
    GetNeighbors = () => {
        var neighbors = [];
        var allTiles = this.game.tiles;
        var y = this.point.y;
        var x = this.point.x;
        //check top
        neighbors.push((allTiles[x][y - 1] !== undefined ? allTiles[x][y - 1] : null));
        //check bottom
        neighbors.push((allTiles[x][y + 1] !== undefined ? allTiles[x][y + 1] : null));
        //check right
        neighbors.push((allTiles[x + 1] !== undefined && allTiles[x + 1][y] !== undefined ? allTiles[x + 1][y] : null));
        //check left
        neighbors.push((allTiles[x - 1] !== undefined && allTiles[x - 1][y] !== undefined ? allTiles[x - 1][y] : null));
        return neighbors;
    };
    isAdjacent = (tile) => {
        var xDiff = Math.abs(this.point.x - tile.point.x);
        var yDiff = Math.abs(this.point.y - tile.point.y);
        return ((xDiff == 0 && yDiff == 1) || (yDiff == 0 && xDiff == 1));
    };
    ClickHandler = () => {
        if (!this.game.inputAllowed)
            return;
        this.selectTile(this);
    };
    SwipeStartHandler = (event) => {
        event.target.style.animation = 'pulse .5s';
        event.target.style.animationIterationCount = 'infinite';
        this.xDown = event.changedTouches[0].screenX;
        this.yDown = event.changedTouches[0].screenY;
    };
    SwipeEndHandler = (event) => {
        event.target.style.animation = '';
        if (!this.xDown || !this.yDown) {
            return;
        }
        if (!this.game.inputAllowed)
            return;
        this.game.disableInput = true;
        const deadZone = 10;
        var xUp = event.changedTouches[0].screenX;
        var yUp = event.changedTouches[0].screenY;
        var xDiff = this.xDown - xUp;
        var yDiff = this.yDown - yUp;
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
            }
            else {
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
        if (this.handleSwipe(event.target.tile, dir))
            if (this.game.selectedTile !== null)
                this.deselectTile(this);
        /* reset values */
        this.xDown = null;
        this.yDown = null;
    };
    handleSwipe = (tile, dir) => {
        if (dir < 0)
            return false;
        var neighbors = this.GetNeighbors();
        var directions = ['up', 'down', 'left', 'right'];
        //console.log('Swiped ' + directions[dir]);
        if (this.game.swapTiles(tile, neighbors[dir])) {
        }
        else {
            return false;
        }
        return true;
    };
    deselectTile(tile) {
        if (tile == null)
            return false;
        if (this.game.selectedTile !== tile)
            return;
        tile.element.style.animation = '';
        this.game.selectTile(null);
    }
    selectTile(tile) {
        if (this.game.selectedTile == null) {
            tile.element.style.animation = 'pulse .5s';
            tile.element.style.animationIterationCount = 'infinite';
            this.game.selectTile(tile);
            return;
        }
        if (this.game.selectedTile === tile) {
            this.deselectTile(tile);
            return;
        }
        if (this.isAdjacent(this.game.selectedTile)) {
            // pause player control
            this.game.disableInput = true;
            var tempTile = this.game.selectedTile;
            this.deselectTile(this.game.selectedTile);
            this.game.swapTiles(tile, tempTile);
        }
        else {
            this.deselectTile(this.game.selectedTile);
            this.game.selectTile(tile);
        }
    }
}
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
}
