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
    getByExpire(key, expire) {
        return this._getByExpire(key, expire, "getItem");
    }
    peekByExpire(key, expire) {
        return this._getByExpire(key, expire, "peekItem");
    }
    _getByExpire(key, expire, action) {
        let item = this[action](key);
        if (item === null) {
            return null;
        }
        expire = expire || item.maxAge;
        let ttl = item.ttl;
        let dto = {
            value: item.value,
            validExpire: ttl >= (expire / 2)
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
            item = this.getItem(key);
            if (item) {
                fn.call($this || null, item.value, item.key);
            }
        });
    }
    keys() {
        let output = [];
        this.forEach((value, key) => {
            output.push(key);
        });
        return output;
    }
    values() {
        let output = [];
        this.forEach((value, key) => {
            output.push(value);
        });
        return output;
    }
    prune() {
        let keys = this.keys();
        for (let i = 0, len = keys.length; i < len; i++) {
            this._isValidExpire(this._cache[keys[i]]);
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
            item.maxAge = maxAge;
            this._hit(item);
            return;
        }
        //try to reuse the last item
        if (this._size >= this._maxSize) {
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
        // if (item.maxAge > 0) {
        //     item.modified = Date.now();
        // }
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
}
exports.Cache = Cache;
//# sourceMappingURL=cache.js.map