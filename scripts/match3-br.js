// The main mechanics of the game
// Use events to update HTML elements

export class GameEvent {
    constructor() {
        this.subscribers = [];
    }

    subscribe(callback) {
        this.subscribers.push(callback);
    }

    triggerEvent(data) {
        this.subscribers.forEach(subscriber => subscriber(data));
    }

    unsubscribe(callback) {
        this.subscribers = this.subscribers.filter(subscriber => subscriber !== callback);
    }
}

export class Timer {
    constructor() {
        this.deltaTime = 1000;
        this.interval = null;
        this.value = 0;
        this.onTick = new GameEvent();
    }
    start() {
        this.interval = setInterval(() => {
            this.timerTick();
        }, this.deltaTime);
    }
    pause() {
        clearInterval(this.interval);
    }
    stop() {
        clearInterval(this.interval);
        this.value = 0;
    }
    timerTick() {
        this.value++;
        this.onTick.triggerEvent(this.value);
    }
}

export class Match {
    constructor() {
        this.timer = new Timer();
    }
    start() {
        this.timer.start();
    }
}