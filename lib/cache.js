"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const listItem_1 = require("./listItem");
class Cache {
    constructor(options) {
        this._cache = new Map();
        let opts = options || {};
        this._maxSize = opts.maxSize || 1000;
        this._maxAge = opts.maxAge || 0;
        this.reset();
    }
    get(key) {
        return this._get(key, false, true);
    }
    getItem(key) {
        return this._get(key, true, true);
    }
    peek(key) {
        return this._get(key, false, false);
    }
    peekItem(key) {
        return this._get(key, true, false);
    }
    getByExpire(key, expire, refresh) {
        return this._getByExpire(key, expire, refresh, "getItem");
    }
    peekByExpire(key, expire, refresh) {
        return this._getByExpire(key, expire, refresh, "peekItem");
    }
    _getByExpire(key, expire, refresh, action) {
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
    has(key) {
        let item = this.getItem(key);
        return !!item;
    }
    pop() {
        if (!this._tail) {
            return null;
        }
        let value = this._tail.value;
        this._del(this._tail);
        return value;
    }
    forEach(fn, $this) {
        this._cache.forEach((item, key) => {
            item = this.peekItem(key);
            if (item) {
                fn.call($this || null, item.value, item.key);
            }
        });
    }
    keys() {
        let output = [];
        let keys = this._cache.keys();
        for (let key of keys) {
            if (this.peek(key)) {
                output.push(key);
            }
        }
        return output;
    }
    values() {
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
    prune() {
        let keys = this._cache.keys();
        for (let key of keys) {
            this._isValidExpire(this._cache.get(key));
        }
    }
    _get(key, returnItem, hit) {
        let item = this._cache.get(key);
        if (!item || !this._isValidExpire(item)) {
            return null;
        }
        (hit) && (this._hit(item));
        return returnItem ? item : item.value;
    }
    _isValidExpire(item) {
        if (item.expire > 0 && Date.now() > item.expire) {
            this._del(item);
            return false;
        }
        return true;
    }
    set(key, value, maxAge) {
        let item = this._cache.get(key);
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
        }
        else {
            item = new listItem_1.ListItem(key, value, maxAge);
        }
        this._cache.set(key, item);
        this._link(item);
    }
    get size() {
        return this._size;
    }
    _del(item) {
        this._unlink(item);
        item.next = null;
        item.prev = null;
        this._cache.delete(item.key);
    }
    expire(key, maxAge) {
        let item = this._cache.get(key);
        if (!item) {
            return;
        }
        item.maxAge = maxAge;
    }
    ttl(key) {
        let item = this._cache.get(key);
        if (!item) {
            return 0;
        }
        return item.ttl;
    }
    del(key) {
        let item = this._cache.get(key);
        if (!item) {
            return;
        }
        this._del(item);
    }
    reset() {
        this._size = 0;
        this._cache = new Map();
        this._tail = null;
        this._head = null;
    }
    hit(key) {
        let item = this.getItem(key);
        if (item) {
            this._hit(item);
        }
    }
    _hit(item) {
        if (this._maxSize > 0 && this._head !== item) {
            this._unlink(item);
            this._link(item);
        }
    }
    _link(item) {
        if (!item) {
            return;
        }
        item.prev = null;
        item.next = this._head;
        this._head = item;
        if (item.next ? (item.next.prev = item) : (this._tail = item))
            this._size++;
    }
    _unlink(item) {
        if (!item) {
            return;
        }
        let prev = item.prev, next = item.next;
        (prev)
            ? (prev.next = next)
            : (this._head = next);
        (next)
            ? (next.prev = prev)
            : (this._tail = prev);
        this._size--;
    }
    set maxSize(value) {
        this._maxSize = value;
    }
    set maxAge(value) {
        this._maxAge = value;
    }
    clear(n) {
        this.prune();
        for (let i = 0, len = n; i < len; i++) {
            this.del(this._tail.key);
        }
    }
    clearHalf() {
        this.clear(Math.floor(this._size / 2));
    }
}
exports.Cache = Cache;
//# sourceMappingURL=cache.js.map