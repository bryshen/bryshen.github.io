import { GameEvent } from "./GameEvent.js";

class Point{
  
  private _x : number;
  public get x() : number {
    return this._x;
  }
  public set x(v : number) {
    this._x = v;
    this.onUpdate.trigger();
  }
  
  private _y : number;
  public get y() : number {
    return this._y;
  }
  public set y(v : number) {
    this._y = v;
    this.onUpdate.trigger();
  }
  
  constructor(x : number, y : number){
    this._x = x;
    this._y = y;
  }
  
  private readonly onUpdate = new GameEvent();
  public get OnUpdate() { return this.onUpdate.expose();}

}

export interface TileTurnInData{
  tileType: TileType;
  tileCount : number;
  combo : number;
}

export class MatchThreeGame{
    // TODO: Add subclass for the board and it's functions

    private readonly onTileTurnIn = new GameEvent<TileTurnInData>();
    public get TileTurnIn() { return this.onTileTurnIn.expose(); } 

    private readonly onCheckBoard = new GameEvent<Tile[][]>();
    public get CheckBoard() { return this.onCheckBoard.expose();}
    
    private readonly onUpdateBoard = new GameEvent();
    public get UpdateBoard() { return this.onUpdateBoard.expose();}

    private readonly onTransitionFinished = new GameEvent();
    public get OnTransitionFinished() { return this.onTransitionFinished.expose();}

    private readonly onInputLockChange = new GameEvent<boolean>();
    public get OnInputLockChange() { return this.onInputLockChange.expose();}

    //tileTypes: TileType[];
    disableInput : boolean = false;
    private inputBlocked : boolean = false;
    private _tiles: Tile[][] | null[][] = [];
    private _container : HTMLElement;
    private _rows : number = 1;
    private _columns : number = 1;
    private removedTiles : Tile[] = [];
    private _selectedTile : Tile | null = null;
    private combo : number = 1;
    private transitioningTiles : Tile[] = [];
    private swappedTiles : Tile[] | undefined = undefined;
    private turnedinTiles : Tile[] = [];

    private errorType: TileType = new TileType('overflow', './images/tiles/junk.png', '#000000', (tile : TileType) => {return false});

    private tileBag : TileType[];

    get inputAllowed() : boolean{
        return this.transitioningTiles.length == 0; //return !this.disableInput && !this.inputBlocked;
    }

    get selectedTile() : Tile | null{
        return this._selectedTile;
    }

    get container(): HTMLElement{
        return this._container;
    }

    get rows() : number{
        return this._rows;
    }

    get columns() :number{
        return this._columns;
    }

    get tiles(): Tile[][] | null[][]{
        return this._tiles;
    }

    constructor(rows : number, colunms: number, container : HTMLElement, tileTypes : TileType[]){
        this.tileBag = tileTypes;
        //this.tileTypes = tileTypes;
        this._container = container; 
        this._rows = rows;
        this._columns = colunms;
        this.OnTransitionFinished.subscribe(this.doubleCheckBoard);
        this.createGrid(rows, colunms);
    }

    selectTile(tile : Tile | null){
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

    private createGrid(numRows : number, numCols : number) {
        this._tiles = [];
        for (var y = numRows - 1; y >= 0; y--) {
          for (var x = 0; x < numCols; x++) {
            //var tileColumn : any = [];
            var t = this.createNewTile(x, y);
            if (this.tiles.length <= x)
              this._tiles.push([]);
            this._tiles[x].unshift(t as never);
            console.log(this.tiles[x][y] == t);
           }
        }
      }

    createNewTile(x : number, y : number) {
        var t = new Tile(this, this.PullFromTileBag(), x, y);
        return t;
      }

    PullFromTileBag = () : TileType => {
      if (this.tileBag.length === 0) {
        console.warn("Tile bag empty!");
        return this.errorType; // If the array is empty, return undefined
      }
        shuffleArray(this.tileBag);
        return this.tileBag.pop() as TileType;
        //return this.removeRandomElement(this.tileBag) as TileType;
    }

    ReturnToBag = (type : TileType) => {
      if (type.name == 'overflow') return;
      this.tileBag.push(type);
      shuffleArray(this.tileBag);
    }

    removeRandomElement = (arr : TileType[]) : TileType | undefined  => {
      if (arr.length === 0) {
        console.warn("Tile bag empty!");
        return this.errorType; // If the array is empty, return undefined
      }
      const randomIndex : number = Math.floor(Math.random() * arr.length);
      const removedElement : TileType = arr.splice(randomIndex, 1)[0];
      return removedElement;
    }


    Reset = () :void =>{
      this.combo = 1;
      this.createGrid(this._rows, this._columns);
      setTimeout(this.doubleCheckBoard, 200); 
    }

    swapTiles(tile1 : Tile, tile2 : Tile, check ? : undefined | boolean) {
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
      
    doubleCheckBoard = () : void => {
      console.log("Board Check");

        if (this.collapseGroups())
          this.waterfall();
        else
        this.onInputLockChange.trigger(false);

      }
    
    collapseGroups = (): boolean => {
        var groups : Tile[][] = [];
        this.onCheckBoard.trigger(groups);
        for (let i = 0; i < groups.length; i++) {
          for (let j = 0; j < groups[i].length; j++) {
            if (groups[i][j] !== undefined) {
              var clearedTile: Tile = groups[i][j];
              if (!this.removedTiles.includes(clearedTile)){
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
      }

      turnInClearedTiles = () : void =>{
          console.log("Turning In Cleared Tiles");
          if (this.removedTiles.length < 0) return;
          var tempTiles : Tile[] = this.removedTiles;
          while (tempTiles.length > 0){
            this.onTileTurnIn.trigger({tileType: tempTiles[0].type, tileCount: tempTiles.filter((t) => t.type.name === tempTiles[0].type.name).length + 1, combo : this.combo})
            tempTiles = tempTiles.filter((t) => t.type.name !== tempTiles[0].type.name)
          }
          //this.removedTiles.forEach(t => {this.ReturnToBag(t.type)})
          this.removedTiles = [];
          this.combo++;
      }

    waterfall = () => {
        console.log("Waterfall");
        this._tiles.forEach((column, x) => {
          column = column.filter((t : Tile | null) => t !== null && t !== undefined) as Tile[];
          while (column.length < this._rows) {
            var t : Tile = this.createNewTile(x, column.length - this._rows);
            column.unshift(t as never);
          }
          for (let y = 0; y < column.length; y++) {
            var tile : Tile | null = column[y];
            if (tile !== null) tile.point.y = y;
          }
          this._tiles[x] = column;
        });
      }

    updateBoard = () => {
        this.onUpdateBoard.trigger();
      }

      registerTransition(tile : Tile) : void {
        if (this.transitioningTiles.includes(tile))
          return;
        this.transitioningTiles.push(tile);
        if (this.transitioningTiles.length == 1){
          this.onInputLockChange.trigger(true);
        }
      }

      unregisterTransition(tile : Tile) : void {
        if (this.transitioningTiles.includes(tile))
          this.transitioningTiles = this.transitioningTiles.filter(t => t !== tile);
        if (this.transitioningTiles.length == 0){
          console.log('Transition Ended');
          this.onTransitionFinished.trigger();
        }

      }

      kill = () => {
        this.tiles.forEach(a => {a.forEach( t => {if (t !== null) {t.element.style.opacity = '0';}})});
        setTimeout(() => {
          this._tiles = [];
          this.updateBoard();
        }, 1000);
      }

}

type RGB = `rgb(${number}, ${number}, ${number})`;
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
type HEX = `#${string}`;

type Color = RGB | RGBA | HEX;

export class TileType {
    name: string;
    src: string;
    color : Color;
    match = (tile : TileType) :boolean => {return this.name === tile.name;}

    constructor(name: string, src: string, color : Color, match? : (tile: TileType) => boolean) {
        this.name = name;
        this.color = color;
        this.src = src;
        if (match === undefined)
          return;
        this.match = match;
    }
}

// Define a custom interface extending HTMLElement
export interface TileHTMLElement extends HTMLElement {
    tile: Tile;
}

export class Tile {
    point : Point;
    type: TileType;
    game: MatchThreeGame;
    element: TileHTMLElement; // Use the custom interface here
    tileStartY : number = -5;
    // Controls
    private xDown: number | null = null;
    private yDown: number | null = null;

    constructor(game : MatchThreeGame, type: TileType, x: number, y: number) {
        this.game = game;
        this.type = type;

        var div : HTMLElement = document.createElement('div');
        //div.style.fontSize = '3em';
        //div.style.textAlign = 'center';
        //div.style.verticalAlign = 'middle';

        div.classList.add('select-tile');
        this.element = div as TileHTMLElement;
        this.element.addEventListener('click', this.ClickHandler);
        this.element.addEventListener('touchstart', this.SwipeStartHandler);
        this.element.addEventListener('touchend', this.SwipeEndHandler);
        this.element.ontransitionstart = (event) => {this.game.registerTransition(this);}
        this.element.ontransitionend = (event) => {this.Transitioned();}
        //this.element.on = (event) => {console.log("Loaded Tile Div");};   
        game.CheckBoard.subscribe(this.Solve);
        game.UpdateBoard.subscribe(this.Update);
        

        var img = document.createElement('img');
        img.src = type.src;
        img.style.height = '100%';
        img.style.width = '100%';
        img.style.backgroundColor = type.color;
        img.onload = (event) => {this.Reposition(); this.point.OnUpdate.subscribe(this.Reposition);};   

        this.element.appendChild(img);
        this.element.tile = this;
        game.container.appendChild(div);

        this.point = new Point(x, this.tileStartY);
        this.Reposition();

        this.point.y = y;
        

    }

    Transitioned = () =>{
      this.Update();
      this.game.unregisterTransition(this);
    }

    Solve = (output : Tile[][] | undefined): void => {
      if (output == undefined) return;
      const neighbors : Tile[] = this.GetNeighbors();
      this.RegisterMatches(output, neighbors[0], neighbors[1]);
      this.RegisterMatches(output, neighbors[2], neighbors[3]);
    }

    RegisterMatches = (output : Tile[][], neighborA : Tile, neighborB : Tile) : void => {
      if((neighborA?.type.match(this.type) && neighborB?.type.match(this.type)) == true){
        let vArr : Tile[] = [neighborA, this, neighborB];
        output.forEach((line, i) => {
          const intersection = vArr.filter(t => line.includes(t));
          if (intersection.length == 2){
            vArr.filter(t => !intersection.includes(t)).forEach(t => output[i].push(t));
            vArr = [];
          }
        });
        if (vArr.length == 3) output.push(vArr);
      }
    }


    Update = (): void => {
        console.log("Updating Tile");
        if (this.game.tiles.length > this.point.x && this.game.tiles[this.point.x][this.point.y] == this){
          this.Reposition();
        }else{
          this.Destroy();
        }

    }

    Destroy = () : void => {
      this.game.ReturnToBag(this.type);
      this.game.CheckBoard.unsubscribe(this.Solve);
      this.game.UpdateBoard.unsubscribe(this.Update);
      this.game.unregisterTransition(this);
      this.element.remove();
    }

    Reposition = (): void => {
      this.element.style.top = `${0 + this.point.y * (100 / this.game.rows)}%`;
      this.element.style.left = `${0 + this.point.x * (100 / this.game.columns)}%`;
    }

    GetNeighbors = () : Tile[] => {
        var neighbors : Tile[] = [];
        var allTiles : null[][] | Tile[][] = this.game.tiles;
        var y : number = this.point.y;
        var x : number = this.point.x;
        //check top
        neighbors.push((allTiles[x][y - 1] !== undefined ? allTiles[x][y - 1] : null) as Tile);
        //check bottom
        neighbors.push((allTiles[x][y + 1] !== undefined ? allTiles[x][y + 1] : null) as Tile);
        //check right
        neighbors.push((allTiles[x + 1] !== undefined && allTiles[x + 1][y] !== undefined ? allTiles[x + 1][y] : null) as Tile);
        //check left
        neighbors.push((allTiles[x - 1] !== undefined && allTiles[x - 1][y] !== undefined ? allTiles[x - 1][y] : null) as Tile);
        return neighbors;
      }
    
    isAdjacent = (tile : Tile) : boolean => {
        var xDiff = Math.abs(this.point.x - tile.point.x);
        var yDiff = Math.abs(this.point.y - tile.point.y);
        return ((xDiff == 0 && yDiff == 1) || (yDiff == 0 && xDiff == 1));
    }

    private ClickHandler = () : void => {
        if (!this.game.inputAllowed)
          return;
          this.selectTile(this);
      }
    
    
    SwipeStartHandler = (event : any) : void => {
        event.target.style.animation = 'pulse .5s';
        event.target.style.animationIterationCount = 'infinite';
        this.xDown = event.changedTouches[0].screenX;
        this.yDown = event.changedTouches[0].screenY;
      }
      
    SwipeEndHandler = (event : any) => {
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
      
        if (this.handleSwipe(event.target.tile, dir))
          if (this.game.selectedTile !== null)  this.deselectTile(this as Tile);
      
        /* reset values */
        this.xDown = null;
        this.yDown = null;
      
      }
    
    
    handleSwipe = (tile : Tile, dir : number) => {
        if (dir < 0)
          return false;
        var neighbors = this.GetNeighbors();
        var directions = ['up', 'down', 'left', 'right'];
        //console.log('Swiped ' + directions[dir]);
        if (this.game.swapTiles(tile, neighbors[dir])) {
        } else {
          return false;
        }
        return true;
      }
      
    
    deselectTile(tile : Tile) {
        if (tile == null)
          return false;
        if (this.game.selectedTile !== tile)
          return;
        tile.element.style.animation = '';
        this.game.selectTile(null);
      }
    
    selectTile(tile : Tile) {
        if (this.game.selectedTile == null) {
          tile.element.style.animation = 'pulse .5s';
          tile.element.style.animationIterationCount = 'infinite';
          this.game.selectTile (tile);
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
        } else {
          this.deselectTile(this.game.selectedTile);
          this.game.selectTile(tile);
        }
      }
}

function shuffleArray(array : any) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}
