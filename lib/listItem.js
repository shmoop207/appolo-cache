"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ListItem {
    constructor(_key, _value, _maxAge) {
        this._key = _key;
        this._value = _value;
        this._maxAge = _maxAge;
        this._prev = null;
        this._next = null;
        this._expire = 0;
        this.maxAge = _maxAge;
    }
    get maxAge() {
        return this._maxAge;
    }
    set maxAge(value) {
        this._maxAge = value;
        this._expire = this._maxAge ? Date.now() + this._maxAge : 0;
    }
    get prev() {
        return this._prev;
    }
    set prev(value) {
        this._prev = value;
    }
    get key() {
        return this._key;
    }
    set key(value) {
        this._key = value;
    }
    get value() {
        return this._value;
    }
    set value(value) {
        this._value = value;
    }
    get ttl() {
        return this._expire > 0 ? this._expire - Date.now() : 0;
    }
    get expire() {
        return this._expire;
    }
    get next() {
        return this._next;
    }
    set next(value) {
        this._next = value;
    }
}
exports.ListItem = ListItem;
//# sourceMappingURL=listItem.js.map