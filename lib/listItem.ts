export class ListItem<K, T> {


    private _prev: ListItem<K, T>;
    private _next: ListItem<K, T>;

    private _expire: number;

    constructor(private _key: K, private _value: T,
                private _maxAge: number) {

        this._prev = null;
        this._next = null;
        this._expire = 0;

        this.maxAge = _maxAge;
    }

    public get maxAge(): number {
        return this._maxAge;
    }

    public set maxAge(value: number) {
        this._maxAge = value;
        this._expire = this._maxAge ? Date.now() + this._maxAge : 0
    }

    public get prev(): ListItem<K, T> {
        return this._prev;
    }

    public set prev(value: ListItem<K, T>) {
        this._prev = value;
    }

    public get key(): K {
        return this._key;
    }

    public set key(value: K) {
        this._key = value;
    }

    public get value(): T {
        return this._value;
    }

    public set value(value: T) {
        this._value = value;
    }


    public get ttl(): number {
        return this._expire > 0 ? this._expire - Date.now() : 0;
    }

    public get expire(): number {
        return this._expire;
    }


    public get next(): ListItem<K, T> {
        return this._next;
    }

    public set next(value: ListItem<K, T>) {
        this._next = value;
    }


}