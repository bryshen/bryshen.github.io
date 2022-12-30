// Define the class that creates a draggable div
class DraggableDiv {
    constructor(id, color) {
      this.id = id;
      this.color = color;
      this.element = document.createElement('div');
      this.element.id = id;
      this.element.style.backgroundColor = color;
      this.element.style.position = 'absolute';
      this.element.style.width = '100px';
      this.element.style.height = '100px';
      document.body.appendChild(this.element);
    }
  
    // Method that makes the div draggable
    makeDraggable() {
      this.element.addEventListener('mousedown', this.dragStart.bind(this));
      document.addEventListener('mousemove', this.drag.bind(this));
      document.addEventListener('mouseup', this.dragEnd.bind(this));
      this.element.addEventListener('touchstart', this.dragStart.bind(this));
      document.addEventListener('touchmove', this.drag.bind(this));
      document.addEventListener('touchend', this.dragEnd.bind(this));
    }
  
    // Method that controls what happens when the draggable div is clicked/tapped
    dragStart(e) {
      this.startX = e.pageX || e.touches[0].pageX;
      this.startY = e.pageY || e.touches[0].pageY;
      this.startLeft = this.element.offsetLeft;
      this.startTop = this.element.offsetTop;
      this.dragging = true;
    }
  
    // Method that controls what happens when the draggable div is dragged
    drag(e) {
      if (this.dragging) {
        let currentX = e.pageX || e.touches[0].pageX;
        let currentY = e.pageY || e.touches[0].pageY;
        let left = (this.startLeft + currentX - this.startX);
        let top = (this.startTop + currentY - this.startY);
        this.element.style.left = left + 'px';
        this.element.style.top = top + 'px';
      }
    }
  
    // Method that controls what happens when the draggable div is released
    dragEnd(e) {
      this.dragging = false;
      // Check if the draggable div has been released over a static div
      let staticDivs = document.querySelectorAll('.static-div');
      for (let staticDiv of staticDivs) {
        let staticDivRect = staticDiv.getBoundingClientRect();
        let draggableDivRect = this.element.getBoundingClientRect();
        if (this.checkCollision(staticDivRect, draggableDivRect)) {
          // If the draggable div has been released over a static div, delete the draggable div and change the color of the static div
          staticDiv.style.backgroundColor = this.color;
          document.body.removeChild(this.element);
        }
      }
    }
  
    // Method that checks if two divs are colliding
    checkCollision(rect1, rect2) {
      if (rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.height + rect1.y > rect2.y) {
          return true;
      }
      return false;
    }
  }
  
  // Create 3 draggable divs
  let div1 = new DraggableDiv('draggable-div-1', '#FF0000');
  div1.makeDraggable();
  
  let div2 = new DraggableDiv('draggable-div-2', '#00FF00');
  div2.makeDraggable();
  
  let div3 = new DraggableDiv('draggable-div-3', '#0000FF');
  div3.makeDraggable();
  
  // Create 3 static divs
  let staticDiv1 = document.createElement('div');
  staticDiv1.className = 'static-div';
  staticDiv1.style.position = 'absolute';
  staticDiv1.style.width = '100px';
  staticDiv1.style.height = '100px';
  staticDiv1.style.left = '25px';
  staticDiv1.style.top = '25px';
  document.body.appendChild(staticDiv1);
  
  let staticDiv2 = document.createElement('div');
  staticDiv2.className = 'static-div';
  staticDiv2.style.position = 'absolute';
  staticDiv2.style.width = '100px';
  staticDiv2.style.height = '100px';
  staticDiv2.style.left = '150px';
  staticDiv2.style.top = '150px';
  document.body.appendChild(staticDiv2);
  
  let staticDiv3 = document.createElement('div');
  staticDiv3.className = 'static-div';
  staticDiv3.style.position = 'absolute';
  staticDiv3.style.width = '100px';
  staticDiv3.style.height = '100px';
  staticDiv3.style.left = '275px';
  staticDiv3.style.top = '275px';
  document.body.appendChild(staticDiv3);