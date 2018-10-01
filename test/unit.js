"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const index_1 = require("../index");
let should = chai.should();
describe("Cache", () => {
    it("Should set and get ", () => {
        let cache = new index_1.Cache({ maxSize: 1 });
        cache.set("hello", "world");
        cache.get("hello").should.equal("world");
    });
    it("Should set and get item", () => {
        let cache = new index_1.Cache({ maxSize: 1 });
        cache.set("hello", "world");
        cache.getItem("hello").value.should.equal("world");
    });
    it('should not drop recently', () => {
        let cache = new index_1.Cache({ maxSize: 2 });
        cache.set('a', 'A');
        cache.set('b', 'B');
        cache.get('a');
        cache.set('c', 'C');
        cache.get('c').should.be.eq('C');
        should.not.exist(cache.get('b'));
        cache.get('a').should.be.eq('A');
    });
    it("Should drop item on maxsize", () => {
        let cache = new index_1.Cache({ maxSize: 3 });
        cache.set("a", "1");
        cache.set("b", "2");
        cache.set("c", "3");
        cache.get("a").should.equal("1");
        cache.get("b").should.equal("2");
        cache.get("c").should.equal("3");
        cache.set("d", "4");
        cache.get("d").should.equal("4");
        should.not.exist(cache.get("a"));
        cache.get("b");
        cache.set("e", "5");
        cache.get("b").should.equal("2");
        cache.get("e").should.equal("5");
        should.not.exist(cache.get("c"));
    });
    it("Should drop item on maxsize with peek", () => {
        let cache = new index_1.Cache({ maxSize: 2 });
        cache.set("b", "2");
        cache.set("a", "1");
        cache.peek("a").should.equal("1");
        cache.peek("b").should.equal("2");
        cache.set("c", "4");
        cache.get("c").should.equal("4");
        should.not.exist(cache.get("b"));
    });
    it("Should enable delete items", function () {
        let cache = new index_1.Cache({ maxSize: 3 });
        cache.set("a", "1");
        cache.set("b", "2");
        cache.set("c", "3");
        cache.size.should.equal(3);
        cache.get("b").should.equal("2");
        cache.del("b");
        cache.size.should.equal(2);
        should.not.exist(cache.get("b"));
    });
    it("should expire items", function (done) {
        let cache = new index_1.Cache({ maxSize: 3, maxAge: 100 });
        cache.set("a", "1");
        cache.set("b", "2");
        cache.set("c", "3");
        cache.size.should.equal(3);
        setTimeout(() => {
            cache.expire("b", 150);
            cache.getItem("b").ttl.should.gt(3);
            cache.peek("a").should.equal("1");
        }, 15);
        setTimeout(() => {
            cache.get("b").should.equal("2");
            should.not.exist(cache.get("c"));
            cache.size.should.equal(2);
            should.not.exist(cache.get("a"));
            cache.size.should.equal(1);
            done();
        }, 150);
    });
    it('should drop with set and del', function () {
        let cache = new index_1.Cache({ maxSize: 2 });
        cache.set('foo', 1);
        cache.set('bar', 2);
        cache.del('bar');
        cache.set('baz', 3);
        cache.set('qux', 4);
        should.not.exist(cache.get('foo'));
        should.not.exist(cache.get('bar'));
        cache.get('baz').should.be.eq(3);
        cache.get('qux').should.be.eq(4);
    });
    it('should drop least recently with peek', () => {
        let cache = new index_1.Cache({ maxSize: 2 });
        cache.set('a', 'A');
        cache.set('b', 'B');
        cache.peek('a').should.be.eq('A');
        cache.set('c', 'C');
        cache.get('c').should.be.eq('C');
        cache.get('b').should.be.eq('B');
        should.not.exist(cache.get('a'));
    });
    it('should item can have its own maxAge > cache', (done) => {
        let cache = new index_1.Cache({
            maxSize: 5,
            maxAge: 20
        });
        cache.set('a', 'A', 50);
        setTimeout(function () {
            cache.get('a').should.be.eq('A');
            done();
        }, 25);
    });
    it('should item can have its own maxAge', function (done) {
        let cache = new index_1.Cache({
            maxSize: 5,
            maxAge: 50
        });
        cache.set('a', 'A', 20);
        setTimeout(function () {
            should.not.exist(cache.get('a'));
            done();
        }, 25);
    });
    it('should expire items', function (done) {
        let cache = new index_1.Cache({
            maxSize: 5,
            maxAge: 100 * 2
        });
        cache.set('a', 'A');
        setTimeout(function () {
            cache.set('b', 'b');
            cache.peek('a').should.be.eq('A');
        }, 100);
        setTimeout(function () {
            cache.set('c', 'C');
            // timed out
            should.not.exist(cache.get('a'));
        }, 100 * 3);
        setTimeout(function () {
            should.not.exist(cache.get('b'));
            cache.get('c').should.be.eq('C');
        }, 100 * 4);
        setTimeout(function () {
            should.not.exist(cache.get('c'));
            done();
        }, 100 * 7);
    });
    it('should  reset', () => {
        let cache = new index_1.Cache({ maxSize: 10 });
        cache.set('a', 'A');
        cache.set('b', 'B');
        cache.reset();
        cache.size.should.be.eq(0);
        should.not.exist(cache.get('a'));
        should.not.exist(cache.get('b'));
    });
    it('should  get keys', () => {
        let cache = new index_1.Cache({ maxSize: 10 });
        cache.set('a', 'A');
        cache.set('b', 'B');
        cache.keys().should.have.members(["a", "b"]);
    });
    it('should  get values', () => {
        let cache = new index_1.Cache({ maxSize: 10 });
        cache.set('a', 'A');
        cache.set('b', 'B');
        cache.values().should.have.members(["A", "B"]);
    });
    it('should  clear', () => {
        let cache = new index_1.Cache({ maxSize: 10 });
        cache.set('a', 'A');
        cache.set('b', 'B');
        cache.set('c', 'C');
        cache.set('d', 'D');
        cache.clear(2);
        cache.values().should.have.members(["C", "D"]);
    });
    it('should  clear half', () => {
        let cache = new index_1.Cache({ maxSize: 10 });
        cache.set('a', 'A');
        cache.set('b', 'B');
        cache.set('c', 'C');
        cache.set('d', 'D');
        cache.set('f', 'F');
        cache.clearHalf();
        cache.values().should.have.members(["C", "D", "F"]);
    });
});
//# sourceMappingURL=unit.js.map