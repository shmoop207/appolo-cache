'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const benchmark = require("benchmark");
const __1 = require("../");
const LRU = require("lru-cache");
const Simple = require("simple-lru-cache");
let suite = new benchmark.Suite();
let lru1Counter = 0;
let lru2Counter = 0;
// SET
let cache1 = new __1.Cache({
    maxSize: 1000, maxAge: 10000
});
let lru1 = new LRU({
    max: 500, maxAge: 10000
});
suite.add('set', function () {
    cache1.set('key' + (lru1Counter++), 'value');
});
suite.add('lru set', function () {
    lru1.set('key' + (lru1Counter++), 'value');
});
// GET and PEEK
let cache2 = new __1.Cache({
    maxSize: 1000
});
let lru2 = new LRU({
    max: 1000
});
let simple = new Simple({
    maxSize: 1000
});
for (let i = 0; i < 1000; i++) {
    cache2.set('key' + i, 'value');
    lru2.set('key' + i, 'value');
    simple.set('key' + i, 'value');
}
suite.add('get', function () {
    cache2.get('key' + (lru2Counter++) % 1000);
});
suite.add('get lru', function () {
    lru2.get('key' + (lru2Counter++) % 1000);
});
suite.add('get simple', function () {
    simple.get('key' + (lru2Counter++) % 1000);
});
suite.add('peek', function () {
    cache2.peek('key' + (lru2Counter++) % 1000);
});
suite.add('peek lru', function () {
    lru2.peek('key' + (lru2Counter++) % 1000);
});
suite
    .on('cycle', (event) => {
    console.log(String(event.target));
    if (event.target.error)
        console.error(event.target.error);
})
    .run();
//# sourceMappingURL=index.js.map