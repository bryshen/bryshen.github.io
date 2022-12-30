
export class Draggable {
    constructor(element) {
        this.element = element;
        this.element.style.position = 'absolute';
        this.isDragging = false;
        document.addEventListener('mousemove', this.onInput.bind(this));
        document.addEventListener('touchmove', this.onInput.bind(this));
        this.element.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.element.addEventListener('touchstart', this.onTouchStart.bind(this));
        this.mouseUp = this.onMouseUp.bind(this);
        this.touchEnd = this.onTouchEnd.bind(this);
    }

    onInput(event){
        if (!this.dragging) return;
        this.drag(event.clientX || event.touches[0].clientX, event.clientY || event.touches[0].clientY);
    }

    onMouseDown(event) {
        console.log('clicked draggable item');
        this.dragging = true;
        document.addEventListener('mouseup', this.mouseUp);
        this.startDrag(event.clientX, event.clientY);
    }

    onTouchStart(event) {
        console.log('touched draggable item');
        this.dragging = true;
        document.addEventListener('touchend', this.touchEnd);
        this.startDrag(event.touches[0].clientX, event.touches[0].clientY);
    }

    onMouseUp() {
        console.log('no longer dragging item');
        this.dragging = false;
        clearInterval(this.dragCheck);

        this.element.removeEventListener('mouseup', this.mouseUp);
    }
    onTouchEnd() {
        this.dragging = false;
        this.element.removeEventListener('touchend', this.touchEnd);
    }
    startDrag(x, y) {
        console.log('starting drag');
        var c = getCenter(this.element);
        this.lastX = c.x;
        this.lastY = c.y;
        // this.lastX = x;
        // this.lastY = y;
    }
    drag(x, y) {
        if (!this.dragging)
        return;
        console.log('dragging item');

        const deltaX = x - this.lastX;
        const deltaY = y - this.lastY;
        this.element.style.left = `${this.element.offsetLeft + deltaX}px`;
        this.element.style.top = `${this.element.offsetTop + deltaY}px`;
        this.lastX = x;
        this.lastY = y;
    }
}

function getCenter(div) {
    var rect = div.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  }