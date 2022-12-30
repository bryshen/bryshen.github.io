  //create class for a draggable div
  class DraggableDiv {
    constructor(color, x, y) {
      //create div element and set properties
      this.div = document.createElement("div");
      this.div.style.backgroundColor = color;
      this.div.style.width = "100px";
      this.div.style.height = "100px";
      this.div.style.position = "absolute";
      this.div.style.top = y + "px";
      this.div.style.left = x + "px";
      this.div.draggable = true;
      //add drag start event listener
      this.div.addEventListener("dragstart", () => {
        this.dragStart();
      });
      //add drag end event listener
      this.div.addEventListener("dragend", () => {
        this.dragEnd();
      });
    }
    //drag start event handler
    dragStart() {
      this.div.style.opacity = 0.5;
    }
    //drag end event handler
    dragEnd() {
      this.div.style.opacity = 1;
      //get coordinates of the draggable div
      var x = this.div.offsetLeft;
      var y = this.div.offsetTop;
      //check if it is over any of the static divs
      for (let i = 0; i < 3; i++) {
        var div = document.getElementById("static" + I);
        //get coordinates of each static div
        var x0 = div.offsetLeft;
        var y0 = div.offsetTop;
        var x1 = x0 + div.offsetWidth;
        var y1 = y0 + div.offsetHeight;
        //check if the draggable div is within the boundaries of the static div
        if (x > x0 && x < x1 && y > y0 && y < y1) {
          //if yes, change the color of the static div and remove the draggable div
          div.style.backgroundColor = this.div.style.backgroundColor;
          this.div.remove();
        }
      }
    }
  }

  //create static divs
  for (let i = 0; i < 3; i++) {
    var div = document.createElement("div");
    div.style.backgroundColor = "#ccc";
    div.style.width = "100px";
    div.style.height = "100px";
    div.style.position = "absolute";
    div.style.top = (100 + i * 150) + "px";
    div.style.left = "100px";
    div.id = "static" + i;
    document.body.appendChild(div);
  }

  //create draggable divs
  var draggableDiv1 = new DraggableDiv("red", 200, 100);
  document.body.appendChild(draggableDiv1.div);
  var draggableDiv2 = new DraggableDiv("green", 200, 250);
  document.body.appendChild(draggableDiv2.div);
  var draggableDiv3 = new DraggableDiv("blue", 200, 400);
  document.body.appendChild(draggableDiv3.div);