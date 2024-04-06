interface IGameEvent<T> {
    subscribe(handler: { (data?: T): void }) : void;
    unsubscribe(handler: { (data?: T): void }) : void;
}

export class GameEvent<T> implements IGameEvent<T> {
    private handlers: { (data?: T): void; }[] = [];

    public subscribe(handler: { (data?: T): void }) : void {
        this.handlers.push(handler);
    }

    public unsubscribe(handler: { (data?: T): void }) : void {
        this.handlers = this.handlers.filter(h => h !== handler);
    }

    public trigger(data?: T) {
        this.handlers.slice(0).forEach(h => h(data));
    }

    public expose() : IGameEvent<T> {
        return this;
    }
}