
export class Draggable {
    constructor(element) {
        this.element = element;
        this.element.style.position = 'absolute';
        this.element.classList.add('draggable-item');
        this.isDragging = false;
        document.addEventListener('mousemove', this.onInput.bind(this));
        document.addEventListener('touchmove', this.onInput.bind(this));
        this.element.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.element.addEventListener('touchstart', this.onTouchStart.bind(this));
        this.mouseUp = this.onMouseUp.bind(this);
        this.touchEnd = this.onTouchEnd.bind(this);
    }

    onInput(event) {
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
        this.element.removeEventListener('mouseup', this.mouseUp);
        this.dragEnd();
    }
    onTouchEnd() {
        this.element.removeEventListener('touchend', this.touchEnd);
        this.dragEnd();
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

    // Method that controls what happens when the draggable div is released
    dragEnd() {
        this.dragging = false;
        // Check if the draggable div has been released over a static div
        let staticDivs = document.querySelectorAll('.inventory-slot');
        let mostCoveredDiv = null;
        let mostCoveredArea = 0;
        for (let staticDiv of staticDivs) {
            let staticDivRect = staticDiv.getBoundingClientRect();
            let draggableDivRect = this.element.getBoundingClientRect();
            if (this.checkCollision(staticDivRect, draggableDivRect)) {
                // If the draggable div has been released over a static div, delete the draggable div and change the color of the static div
                console.log(this.element.style.backgroundColor);
                let overlapArea = this.calculateOverlapArea(staticDivRect, draggableDivRect);
                if (overlapArea > mostCoveredArea) {
                    mostCoveredArea = overlapArea;
                    mostCoveredDiv = staticDiv;
                }
            }
        }
        if (mostCoveredDiv != null) {
            mostCoveredDiv.style.backgroundColor = 'blue';
            this.element.remove();
        }
    }

    calculateOverlapArea(rect1, rect2) {
        let xOverlap = Math.max(0, Math.min(rect1.x + rect1.width, rect2.x + rect2.width) - Math.max(rect1.x, rect2.x));
        let yOverlap = Math.max(0, Math.min(rect1.y + rect1.height, rect2.y + rect2.height) - Math.max(rect1.y, rect2.y));
        return xOverlap * yOverlap;
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

function getCenter(div) {
    var rect = div.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };
}