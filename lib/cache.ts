import {ListItem} from "./listItem";
import {IOptions} from "./IOptions";

export class Cache<K, T> {

    private _size: number;
    private _cache: Map<K, ListItem<K, T>> = new Map();
    private _tail: ListItem<K, T>;
    private _head: ListItem<K, T>;

    private _maxSize: number;
    private _maxAge: number;

    public constructor(options?: IOptions) {

        let opts = options || {};

        this._maxSize = opts.maxSize || 1000;
        this._maxAge = opts.maxAge || 0;

        this.reset();
    }

    public get(key: K): T {
        return this._get(key, false, true) as T;
    }

    public getItem(key: K): ListItem<K, T> {
        return this._get(key, true, true) as ListItem<K, T>
    }

    public peek(key: K): T {
        return this._get(key, false, false) as T;
    }

    public peekItem(key: K): ListItem<K, T> {
        return this._get(key, true, false) as ListItem<K, T>
    }

    public getByExpire(key: K, expire?: number, refresh?: number): { value: T, validExpire: boolean } {
        return this._getByExpire(key, expire, refresh, "getItem");
    }

    public peekByExpire(key: K, expire?: number, refresh?: number): { value: T, validExpire: boolean } {
        return this._getByExpire(key, expire, refresh, "peekItem");
    }

    private _getByExpire(key: K, expire: number, refresh: number, action: "peekItem" | "getItem"): { value: T, validExpire: boolean } {
        let item = this[action](key);

        if (item === null) {
            return null;
        }

        expire = expire || item.maxAge;
        let ttl = item.ttl;
        refresh = refresh || (expire / 2);
        let liveTime = expire - ttl;

        let dto = {
            value: item.value,
            validExpire: liveTime < refresh
        };

        if (!dto.validExpire) {
            this.expire(key, expire);
        }

        return dto;
    }

    public has(key: K): boolean {
        let item = this.getItem(key);
        return !!item
    }

    public pop(): T {
        if (!this._tail) {
            return null;
        }

        let value = this._tail.value;
        this._del(this._tail);

        return value;
    }

    public forEach(fn: (value: T, key: K) => void, $this?: any) {

        this._cache.forEach((item, key) => {
            item = this.peekItem(key);
            if (item) {
                fn.call($this || null, item.value, item.key)
            }
        });
    }

    public keys(): K[] {
        let output = [];

        let keys = this._cache.keys();

        for (let key of keys) {
            if (this.peek(key)) {
                output.push(key);
            }
        }

        return output;
    }

    public values(): T[] {
        let output = [];

        let keys = this._cache.keys();

        for (let key of keys) {

            let value = this.peek(key);

            if (value) {
                output.push(value);
            }
        }

        return output;
    }

    public prune() {

        let keys = this._cache.keys();

        for (let key of keys) {
            this._isValidExpire(this._cache.get(key));
        }
    }

    private _get(key: K, returnItem: boolean, hit: boolean): T | ListItem<K, T> {
        let item = this._cache.get(key);

        if (!item || !this._isValidExpire(item)) {
            return null
        }

        (hit) && (this._hit(item));

        return returnItem ? item : item.value;
    }

    private _isValidExpire(item: ListItem<K, T>): boolean {

        if (item.expire > 0 && Date.now() > item.expire) {
            this._del(item);

            return false;
        }

        return true
    }

    public set(key: K, value: T, maxAge?: number): void {
        let item: ListItem<K, T> = this._cache.get(key);

        maxAge = maxAge || this._maxAge;

        if (item) {
            item.value = value;
            maxAge != -1 && (item.maxAge = maxAge);
            this._hit(item);
            return;
        }

        //try to reuse the last item
        if (this._maxSize > 0 && this._size >= this._maxSize) {
            item = this._tail;
            this._del(item);
            item.key = key;
            item.value = value;
            item.maxAge = maxAge;
        } else {
            item = new ListItem(key, value, maxAge)
        }

        this._cache.set(key, item);
        this._link(item)
    }

    public get size(): number {
        return this._size
    }


    private _del(item: ListItem<K, T>) {
        this._unlink(item);
        item.next = null;
        item.prev = null;
        this._cache.delete(item.key);
    }

    public expire(key: K, maxAge: number): void {
        let item = this._cache.get(key);

        if (!item) {
            return;
        }

        item.maxAge = maxAge;

    }

    public ttl(key: K): number {
        let item = this._cache.get(key);

        if (!item) {
            return 0;
        }

        return item.ttl;
    }


    public del(key: K): void {
        let item = this._cache.get(key);

        if (!item) {
            return;
        }

        this._del(item);
    }

    public reset() {
        this._size = 0;
        this._cache = new Map();
        this._tail = null;
        this._head = null;
    }


    public hit(key: K): void {
        let item = this.getItem(key);

        if (item) {
            this._hit(item)
        }
    }

    private _hit(item: ListItem<K, T>) {

        if (this._maxSize > 0 && this._head !== item) {
            this._unlink(item);
            this._link(item);
        }
    }

    private _link(item: ListItem<K, T>) {
        if (!item) {
            return;
        }

        item.prev = null;
        item.next = this._head;
        this._head = item;

        if (item.next ? (item.next.prev = item) : (this._tail = item))

            this._size++;
    }

    private _unlink(item: ListItem<K, T>): void {
        if (!item) {
            return;
        }

        let prev = item.prev,
            next = item.next;

        (prev)
            ? (prev.next = next)
            : (this._head = next);

        (next)
            ? (next.prev = prev)
            : (this._tail = prev);

        this._size--;
    }

    public set maxSize(value: number) {
        this._maxSize = value;
    }

    public set maxAge(value: number) {
        this._maxAge = value;
    }

    public clear(n: number) {
        this.prune();
        for (let i = 0, len = n; i < len; i++) {
            this.del(this._tail.key);
        }
    }

    public clearHalf() {
        this.clear(Math.floor(this._size / 2));
    }

}
